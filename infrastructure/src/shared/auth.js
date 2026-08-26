const rbacRepo = require('../repositories/dynamo-rbac');
const { logger } = require('./logger');

/**
 * Shared Authentication and Authorization utilities for Agam Lambda Handlers.
 * Extracts Cognito authorizer claims and enforces server-side role/ownership access control.
 */

// ----------------------------------------------------
// DYNAMODB RBAC CACHE & EVALUATION
// ----------------------------------------------------
let rbacCache = null;
let rbacCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * Safely load the RBAC permissions matrix from DynamoDB, with a short-lived cache.
 */
async function getRBACMatrix() {
  const now = Date.now();
  if (rbacCache && (now - rbacCacheTime < CACHE_TTL)) {
    return rbacCache;
  }
  try {
    const perms = await rbacRepo.getPermissions();
    if (!perms) {
      logger.warn('DynamoDB RBAC permissions matrix is completely missing.');
      return null;
    }
    rbacCache = perms;
    rbacCacheTime = now;
    return perms;
  } catch (err) {
    logger.error('Failed to query DynamoDB for RBAC permissions', err);
    return null;
  }
}

function isSuperAdmin(identity) {
  if (!identity) return false;
  
  // 1. Immutable Infrastructure Root Authority
  const rootSub = process.env.SUPER_ADMIN_SUB;
  if (rootSub && identity.sub === rootSub) {
    return true;
  }

  return false;
}

/**
 * Evaluates whether an authenticated identity is permitted to perform a given action on a module.
 * FAIL-CLOSED: Any failure to load or parse permissions results in denial.
 */
async function hasPermission(identity, moduleId, action) {
  if (isSuperAdmin(identity)) return true; // Super Admin is the permanent root authority

  if (!isStaff(identity)) return false; // Non-staff are immediately rejected from staff matrix actions

  const matrix = await getRBACMatrix();
  if (!matrix) return false; // Fail closed if DB fails

  const roleId = (identity.role || '').toLowerCase();
  if (!roleId) return false;

  const roleRecord = matrix.find(r => r.roleId === roleId);
  if (!roleRecord) return false;

  const mod = (roleRecord.modules || []).find(m => m.id === moduleId);
  if (!mod || !mod.permissions || mod.permissions.length === 0) return false;

  return !!mod.permissions[0][action];
}

function extractIdentity(event) {
  let claims = event.requestContext?.authorizer?.claims;
  if (!claims) {
    // Fallback: decode JWT payload if client passed Bearer token on Authorizer: NONE route
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7).trim();
        const parts = token.split('.');
        if (parts.length === 3) {
          claims = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        }
      } catch {
        // Ignore unparseable tokens
      }
    }
  }
  if (!claims) return null;

  const rawGroups = claims['cognito:groups'];
  let groups = [];
  if (Array.isArray(rawGroups)) {
    groups = rawGroups;
  } else if (typeof rawGroups === 'string' && rawGroups.trim().length > 0) {
    groups = rawGroups.split(',').map((g) => g.trim());
  }

  // Derive role: custom:role attribute > Cognito group > default 'patient'
  let role = claims['custom:role'];
  if (!role) {
    if (groups.includes('AdminGroup') || groups.includes('admin')) {
      role = 'admin';
    } else if (groups.includes('StaffGroup') || groups.includes('doctor')) {
      role = 'doctor';
    } else if (groups.includes('lab_tech')) {
      role = 'lab_tech';
    } else {
      role = 'patient';
    }
  }

  return {
    sub: claims.sub,
    username: claims['cognito:username'] || claims.username || claims.sub,
    email: claims.email || '',
    phone: claims.phone_number || '',
    role,
    groups,
    primaryPatientId: `pat_${claims.sub}`,
    staffId: claims['custom:staff_id'] || (role !== 'patient' ? claims.sub : undefined),
  };
}

function extractAuthContext(event) {
  return extractIdentity(event);
}

function isAdmin(identity) {
  if (!identity) return false;
  if (isSuperAdmin(identity)) return true;
  const role = (identity.role || '').toLowerCase();
  return (
    role === 'admin' ||
    identity.groups?.some(g => g.toLowerCase() === 'admingroup' || g.toLowerCase() === 'admin')
  );
}

function isStaff(identity) {
  if (!identity) return false;
  if (isAdmin(identity)) return true;
  const role = (identity.role || '').toLowerCase();
  const staffRoles = ['doctor', 'lab_tech', 'phleb', 'phleb_home', 'phlebotomist', 'staff', 'op', 'path', 'phleb_lab'];
  if (staffRoles.includes(role)) return true;
  const staffGroups = ['staffgroup', 'staff', 'phleb', 'phleb_home', 'phlebgroup'];
  return identity.groups?.some(g => staffGroups.includes(g.toLowerCase()));
}

function isPhlebotomist(identity) {
  if (!identity) return false;
  const role = (identity.role || '').toLowerCase();
  return (
    role === 'phleb' ||
    role === 'phleb_home' ||
    role === 'phlebotomist' ||
    identity.groups?.some(g => ['phleb', 'phleb_home', 'phlebgroup'].includes(g.toLowerCase()))
  );
}

/**
 * Validates whether the authenticated identity is authorized to access a Patient record.
 */
async function canAccessPatient(identity, patient) {
  if (!identity || !patient) return false;
  if (patient.ownerSub && patient.ownerSub === identity.sub) return true;
  if (patient.id === identity.sub || patient.id === `pat_${identity.sub}`) return true;
  return hasPermission(identity, 'patients', 'view');
}

/**
 * Validates whether the authenticated identity is authorized to access a Booking record.
 */
async function canAccessBooking(identity, booking, patient) {
  if (!identity || !booking) return false;
  if (booking.ownerSub && booking.ownerSub === identity.sub) return true;
  if (patient && await canAccessPatient(identity, patient)) return true;
  return hasPermission(identity, 'orders', 'view');
}

/**
 * Validates whether the authenticated identity is authorized to access a Collection record.
 */
async function canAccessCollection(identity, collection, patient) {
  if (!identity || !collection) return false;

  if (isPhlebotomist(identity)) {
    if (
      collection.phlebotomistId === identity.sub ||
      collection.phlebotomistId === identity.username ||
      collection.assignedTo === identity.username ||
      collection.assignedTo === identity.sub
    ) {
      return true;
    }
    if (collection.status === 'Unassigned' || collection.status === 'Pending') {
      return true;
    }
  }

  if (collection.ownerSub && collection.ownerSub === identity.sub) return true;
  if (patient && await canAccessPatient(identity, patient)) return true;
  if (collection.patientId === identity.sub || collection.patientId === identity.primaryPatientId) return true;

  return hasPermission(identity, 'collections', 'view');
}

const ALLOWED_COLLECTION_TRANSITIONS = {
  'Unassigned': ['Assigned', 'Pending', 'Cancelled'],
  'Pending': ['Assigned', 'In Progress', 'En Route', 'Cancelled'],
  'Assigned': ['En Route', 'In Progress', 'Unassigned', 'Cancelled'],
  'En Route': ['In Progress', 'Sample Collected', 'Assigned', 'Cancelled'],
  'In Progress': ['Sample Collected', 'En Route', 'Assigned', 'Cancelled'],
  'Sample Collected': ['Checked In', 'Completed'],
  'Checked In': ['Completed'],
  'Completed': [],
  'Cancelled': [],
};

function isValidCollectionTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_COLLECTION_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

async function canModifyCollection(identity, collection, updateData) {
  if (!identity || !collection) return false;

  if (isPhlebotomist(identity)) {
    const isAssigned = (
      collection.phlebotomistId === identity.sub ||
      collection.phlebotomistId === identity.username ||
      collection.assignedTo === identity.username ||
      collection.assignedTo === identity.sub
    );
    if (!isAssigned) return false;

    const forbiddenKeys = ['patientId', 'ownerSub', 'bookingId', 'phlebotomistId', 'assignedTo', 'tests'];
    const hasForbiddenKey = Object.keys(updateData || {}).some((k) => forbiddenKeys.includes(k));
    if (hasForbiddenKey) return false;

    return true;
  }

  return hasPermission(identity, 'collections', 'edit');
}

/**
 * Validates whether the authenticated identity is authorized to access / download a Document record.
 */
async function canAccessDocument(identity, document, patient) {
  if (!identity || !document) return false;
  if (document.ownerSub && document.ownerSub === identity.sub) return true;
  if (patient && await canAccessPatient(identity, patient)) return true;
  if (
    document.patientId === identity.sub ||
    document.patientId === identity.primaryPatientId ||
    document.patientId === `pat_${identity.sub}`
  ) {
    return true;
  }
  return hasPermission(identity, 'reports', 'view');
}

/**
 * Validates whether the authenticated identity is authorized to modify a Document record.
 */
async function canModifyDocument(identity, document, patient) {
  if (!identity || !document) return false;
  if (document.ownerSub && document.ownerSub === identity.sub) return true;
  if (patient && await canAccessPatient(identity, patient)) return true;
  if (
    document.patientId === identity.sub ||
    document.patientId === identity.primaryPatientId ||
    document.patientId === `pat_${identity.sub}`
  ) {
    return true;
  }
  return hasPermission(identity, 'reports', 'edit');
}

/**
 * Validates whether the authenticated identity is authorized to upload a Document for a target patient.
 */
async function canUploadDocument(identity, patientId, patient) {
  if (!identity) return false;
  if (patient && await canAccessPatient(identity, patient)) return true;
  if (
    patientId === identity.sub ||
    patientId === identity.primaryPatientId ||
    patientId === `pat_${identity.sub}`
  ) {
    return true;
  }
  return hasPermission(identity, 'reports', 'create');
}

/**
 * Validates whether the authenticated identity is authorized to access an Invoice record.
 */
async function canAccessInvoice(identity, invoice, patient) {
  if (!identity || !invoice) return false;
  if (invoice.ownerSub && invoice.ownerSub === identity.sub) return true;
  if (patient && await canAccessPatient(identity, patient)) return true;
  if (
    invoice.patientId === identity.sub ||
    invoice.patientId === identity.primaryPatientId ||
    invoice.patientId === `pat_${identity.sub}`
  ) {
    return true;
  }
  return hasPermission(identity, 'invoices', 'view');
}

const ALLOWED_INVOICE_TRANSITIONS = {
  'Pending': ['Paid', 'Unpaid', 'Cancelled'],
  'Unpaid': ['Paid', 'Cancelled'],
  'Paid': [], // Paid is a terminal state; refunds/cancellations handled through administrative credit flows
  'Cancelled': [],
};

function isValidInvoiceTransition(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_INVOICE_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

async function canModifyInvoice(identity, invoice, updateData) {
  if (!identity || !invoice) return false;
  
  if (await hasPermission(identity, 'invoices', 'edit')) {
    // Staff can record payment, update notes, or assign receiver
    const forbiddenForStaff = ['id', 'PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK', 'subtotal', 'total', 'patientId', 'ownerSub', 'bookingId'];
    const hasForbiddenKey = Object.keys(updateData || {}).some(k => forbiddenForStaff.includes(k));
    return !hasForbiddenKey;
  }
  return false;
}

async function canAccessNotification(identity, notification) {
  if (!identity || !notification) return false;

  const targetUserId = notification.userId;
  const ownerSub = notification.ownerSub;

  if (identity.sub && (targetUserId === identity.sub || ownerSub === identity.sub)) {
    return true;
  }
  if (identity.primaryPatientId && targetUserId === identity.primaryPatientId) {
    return true;
  }
  if (identity.username && targetUserId === identity.username) {
    return true;
  }
  if (targetUserId === `pat_${identity.sub}`) {
    return true;
  }

  // Fallback to see if they can view notifications generically (assuming it's a module, but it's not in the matrix)
  // We'll allow it if they are staff and it passes through. Actually, the user asked to strictly follow matrix.
  // We will preserve the identity logic and remove the bypass. 
  // Wait, I removed the `isAdmin` bypass here, so now only the owner can see their notification.
  // Is there a 'notifications' module? No.
  return false;
}

async function canCreateNotification(identity, notificationData) {
  if (!identity || !notificationData) return false;

  const targetUserId = notificationData.userId;
  if (
    targetUserId === identity.sub ||
    targetUserId === identity.primaryPatientId ||
    targetUserId === `pat_${identity.sub}`
  ) {
    return true;
  }
  
  // No module for notifications. Usually staff create them system-side. We rely on the handlers for top-level guard.
  return false;
}

async function canAccessReview(identity, review) {
  if (!review) return false;
  if (review.status === 'Approved') return true;

  if (!identity) return false;

  if (identity.sub && (review.ownerSub === identity.sub || review.patientId === identity.sub)) {
    return true;
  }
  if (identity.primaryPatientId && review.patientId === identity.primaryPatientId) {
    return true;
  }
  if (review.patientId === `pat_${identity.sub}`) {
    return true;
  }
  return hasPermission(identity, 'reviews', 'view');
}

async function canCreateReview(identity, reviewData, booking) {
  if (!identity || !booking) return false;
  if (booking.status !== 'Completed') return false;

  if (booking.ownerSub && booking.ownerSub === identity.sub) {
    return true;
  }
  if (identity.primaryPatientId && booking.patientId === identity.primaryPatientId) {
    return true;
  }
  if (booking.patientId === identity.sub || booking.patientId === `pat_${identity.sub}`) {
    return true;
  }
  return false;
}

async function canModerateReview(identity) {
  if (!identity) return false;
  return hasPermission(identity, 'reviews', 'edit');
}

async function canAccessBlog(identity, blog) {
  if (!blog) return false;
  if (blog.status === 'Published') return true;
  return hasPermission(identity, 'blogs', 'view');
}

module.exports = {
  extractIdentity,
  extractAuthContext,
  isAdmin,
  isStaff,
  isPhlebotomist,
  isSuperAdmin,
  canAccessPatient,
  canAccessBooking,
  canAccessCollection,
  canModifyCollection,
  isValidCollectionTransition,
  canAccessDocument,
  canModifyDocument,
  canUploadDocument,
  canAccessInvoice,
  canModifyInvoice,
  isValidInvoiceTransition,
  canAccessNotification,
  canCreateNotification,
  canAccessReview,
  canCreateReview,
  canModerateReview,
  canAccessBlog,
  hasPermission,
};




