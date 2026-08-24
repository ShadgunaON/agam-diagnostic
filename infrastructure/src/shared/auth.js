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

/**
 * Evaluates whether an authenticated identity is permitted to perform a given action on a module.
 * FAIL-CLOSED: Any failure to load or parse permissions results in denial.
 */
async function hasPermission(identity, moduleId, action) {
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
  };
}

function extractAuthContext(event) {
  return extractIdentity(event);
}

function isAdmin(identity) {
  if (!identity) return false;
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
 * Allowed if:
 * 1. Caller is Admin or Staff
 * 2. Caller is the account owner (patient.ownerSub === identity.sub)
 * 3. Patient ID matches caller sub or primaryPatientId
 */
function canAccessPatient(identity, patient) {
  if (!identity || !patient) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity) && !isPhlebotomist(identity)) return true;
  if (patient.ownerSub && patient.ownerSub === identity.sub) return true;
  if (patient.id === identity.sub || patient.id === `pat_${identity.sub}`) return true;
  return false;
}

/**
 * Validates whether the authenticated identity is authorized to access a Booking record.
 * Allowed if:
 * 1. Caller is Admin or Staff
 * 2. Caller is the booking owner (booking.ownerSub === identity.sub)
 * 3. Linked patient belongs to the caller
 */
function canAccessBooking(identity, booking, patient) {
  if (!identity || !booking) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity) && !isPhlebotomist(identity)) return true;
  if (booking.ownerSub && booking.ownerSub === identity.sub) return true;
  if (patient && canAccessPatient(identity, patient)) return true;
  return false;
}

/**
 * Validates whether the authenticated identity is authorized to access a Collection record.
 * Allowed if:
 * 1. Caller is Admin or General Staff (Doctor, Lab Tech)
 * 2. Caller is Phlebotomist assigned to the collection or viewing unassigned tasks
 * 3. Caller is the Patient/Account owner
 */
function canAccessCollection(identity, collection, patient) {
  if (!identity || !collection) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity) && !isPhlebotomist(identity)) return true;

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
    return false;
  }

  if (collection.ownerSub && collection.ownerSub === identity.sub) return true;
  if (patient && canAccessPatient(identity, patient)) return true;
  if (collection.patientId === identity.sub || collection.patientId === identity.primaryPatientId) return true;
  return false;
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

function canModifyCollection(identity, collection, updateData) {
  if (!identity || !collection) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity) && !isPhlebotomist(identity)) return true;

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

  return false;
}

/**
 * Validates whether the authenticated identity is authorized to access / download a Document record.
 * Allowed if:
 * 1. Caller is Admin or Staff
 * 2. Caller is the document owner (document.ownerSub === identity.sub)
 * 3. Document belongs to a patient authorized for the caller (patient.ownerSub === identity.sub or matching primary)
 */
function canAccessDocument(identity, document, patient) {
  if (!identity || !document) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity) && !isPhlebotomist(identity)) return true;
  if (document.ownerSub && document.ownerSub === identity.sub) return true;
  if (patient && canAccessPatient(identity, patient)) return true;
  if (
    document.patientId === identity.sub ||
    document.patientId === identity.primaryPatientId ||
    document.patientId === `pat_${identity.sub}`
  ) {
    return true;
  }
  return false;
}

/**
 * Validates whether the authenticated identity is authorized to upload a Document for a target patient.
 * Allowed if:
 * 1. Caller is Admin or Staff
 * 2. Target patient belongs to caller (patient.ownerSub === identity.sub or matching primary)
 */
function canUploadDocument(identity, patientId, patient) {
  if (!identity) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity) && !isPhlebotomist(identity)) return true;
  if (patient && canAccessPatient(identity, patient)) return true;
  if (
    patientId === identity.sub ||
    patientId === identity.primaryPatientId ||
    patientId === `pat_${identity.sub}`
  ) {
    return true;
  }
  return false;
}

/**
 * Validates whether the authenticated identity is authorized to access an Invoice record.
 * Allowed if:
 * 1. Caller is Admin or Staff
 * 2. Caller is the account owner (invoice.ownerSub === identity.sub)
 * 3. Invoice belongs to a patient authorized for the caller (patient.ownerSub === identity.sub or matching primary)
 */
function canAccessInvoice(identity, invoice, patient) {
  if (!identity || !invoice) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity) && !isPhlebotomist(identity)) return true;
  if (invoice.ownerSub && invoice.ownerSub === identity.sub) return true;
  if (patient && canAccessPatient(identity, patient)) return true;
  if (
    invoice.patientId === identity.sub ||
    invoice.patientId === identity.primaryPatientId ||
    invoice.patientId === `pat_${identity.sub}`
  ) {
    return true;
  }
  return false;
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

function canModifyInvoice(identity, invoice, updateData) {
  if (!identity || !invoice) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity) && !isPhlebotomist(identity)) {
    // Staff can record payment, update notes, or assign receiver
    const forbiddenForStaff = ['id', 'PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK', 'subtotal', 'total', 'patientId', 'ownerSub', 'bookingId'];
    const hasForbiddenKey = Object.keys(updateData || {}).some(k => forbiddenForStaff.includes(k));
    return !hasForbiddenKey;
  }
  // Regular patients cannot modify invoices directly
  return false;
}

function canAccessNotification(identity, notification) {
  if (!identity || !notification) return false;
  if (isAdmin(identity)) return true;

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

  return false;
}

function canCreateNotification(identity, notificationData) {
  if (!identity || !notificationData) return false;
  if (isAdmin(identity)) return true;
  if (isStaff(identity)) return true;

  const targetUserId = notificationData.userId;
  if (
    targetUserId === identity.sub ||
    targetUserId === identity.primaryPatientId ||
    targetUserId === `pat_${identity.sub}`
  ) {
    return true;
  }

  return false;
}

function canAccessReview(identity, review) {
  if (!review) return false;
  // Approved reviews are publicly readable
  if (review.status === 'Approved') return true;

  // Pending/Rejected reviews require authentication
  if (!identity) return false;
  if (isAdmin(identity) || isStaff(identity)) return true;

  if (identity.sub && (review.ownerSub === identity.sub || review.patientId === identity.sub)) {
    return true;
  }
  if (identity.primaryPatientId && review.patientId === identity.primaryPatientId) {
    return true;
  }
  if (review.patientId === `pat_${identity.sub}`) {
    return true;
  }
  return false;
}

function canCreateReview(identity, reviewData, booking) {
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

function canModerateReview(identity) {
  if (!identity) return false;
  return isAdmin(identity) || isStaff(identity);
}

function canAccessBlog(identity, blog) {
  if (!blog) return false;
  if (blog.status === 'Published') return true;
  return isAdmin(identity);
}

function canCreateBlog(identity) {
  return isAdmin(identity);
}

function canModifyBlog(identity) {
  return isAdmin(identity);
}

function canDeleteBlog(identity) {
  return isAdmin(identity);
}

module.exports = {
  extractIdentity,
  extractAuthContext,
  isAdmin,
  isStaff,
  isPhlebotomist,
  canAccessPatient,
  canAccessBooking,
  canAccessCollection,
  canModifyCollection,
  isValidCollectionTransition,
  canAccessDocument,
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
  canCreateBlog,
  canModifyBlog,
  canDeleteBlog,
  hasPermission,
};




