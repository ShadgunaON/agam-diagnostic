const { extractIdentity, isAdmin, isStaff, canAccessPatient, hasPermission, isPhlebotomist, canAccessBooking, canAccessCollection, canModifyCollection, isValidCollectionTransition, canAccessInvoice, canModifyInvoice, isValidInvoiceTransition, canAccessDocument, canUploadDocument, canModifyDocument, canAccessBlog } = require('../shared/auth');
const { logger } = require('../shared/logger');
const rbacRepo = require('../repositories/dynamo-rbac');
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
const USER_POOL_ID = process.env.USER_POOL_ID;

// Canonical application roles that can be assigned to employees
const VALID_STAFF_ROLES = ['admin', 'op', 'path', 'phleb', 'phleb_home', 'phleb_lab'];
const ROLE_TO_GROUP = {
  admin: 'AdminGroup',
  op: 'StaffGroup',
  path: 'StaffGroup',
  phleb: 'PhlebGroup',
  phleb_home: 'PhlebGroup',
  phleb_lab: 'StaffGroup',
};

// Existing backend repositories
const patientRepo = require('../repositories/dynamo-patient');
const bookingRepo = require('../repositories/dynamo-booking');
const reportRepo = require('../repositories/dynamo-report');
const invoiceRepo = require('../repositories/dynamo-invoice');
const testRepo = require('../repositories/dynamo-test');
const packageRepo = require('../repositories/dynamo-package');
const serviceRepo = require('../repositories/dynamo-service');
const collectionRepo = require('../repositories/dynamo-collection');
const blogRepo = require('../repositories/dynamo-blog');
const newsletterRepo = require('../repositories/dynamo-newsletter');
const staffRepo = require('../repositories/dynamo-staff');
const reviewRepo = require('../repositories/dynamo-review');
const documentRepo = require('../repositories/dynamo-document');
const storageRepo = require('../storage/s3-storage');

const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function getExtension(contentType) {
  switch (contentType) {
    case 'application/pdf': return 'pdf';
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    default: return 'bin';
  }
}

/**
 * Shared GraphQL Lambda data source for AppSync.
 * 
 * Maps specific GraphQL field requests to targeted existing repository methods.
 * Enforces the existing domain authorization logic.
 */

function sanitizePublicBlog(article) {
  if (!article) return null;
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    content: article.content,
    date: article.date,
    category: article.category,
    author: article.author || 'Medical Editorial Team',
    authorId: article.authorId,
    icon: article.icon || 'fileText',
    colorPrimary: article.colorPrimary || '#3b82f6',
    colorSecondary: article.colorSecondary || '#bfdbfe',
    imageUrl: article.imageUrl || article.image || '',
    image: article.image || article.imageUrl || '',
    status: article.status || 'Published',
    views: article.views || 0,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
  };
}
exports.handler = async (event) => {
  logger.info(`Incoming GraphQL resolution: ${event.info?.parentTypeName}.${event.info?.fieldName}`);
  
  // AppSync typically passes Cognito identity in event.identity
  // We normalize it here so our existing shared/auth tools work (which expect API Gateway format)
  // Or we just implement the equivalent auth check for AppSync:
  const _rawGroups = event.identity?.groups || event.identity?.claims?.['cognito:groups'] || [];
  const _normalizedGroups = Array.isArray(_rawGroups)
    ? _rawGroups
    : (typeof _rawGroups === 'string' && _rawGroups ? _rawGroups.split(',').map(g => g.trim()) : []);

  let role = event.identity?.claims?.['custom:role'];
  if (!role) {
    if (_normalizedGroups.includes('AdminGroup') || _normalizedGroups.includes('admin')) {
      role = 'admin';
    } else if (_normalizedGroups.includes('StaffGroup') || _normalizedGroups.includes('doctor')) {
      role = 'doctor';
    } else if (_normalizedGroups.includes('lab_tech')) {
      role = 'lab_tech';
    } else if (_normalizedGroups.includes('PhlebGroup') || _normalizedGroups.includes('phleb')) {
      role = 'phleb';
    } else {
      role = 'patient';
    }
  }

  const sub = event.identity?.sub || event.identity?.claims?.sub;
  const identity = {
    sub: sub,
    email: event.identity?.claims?.email || '',
    phone: event.identity?.claims?.phone_number || '',
    role: role,
    username: event.identity?.username || event.identity?.claims?.email || sub,
    groups: _normalizedGroups,
    'cognito:groups': _normalizedGroups,
    primaryPatientId: sub ? `pat_${sub}` : undefined,
    staffId: event.identity?.claims?.['custom:staff_id'] || (role !== 'patient' ? sub : undefined)
  };
  const PUBLIC_FIELDS = new Set([
    'catalogTests', 'catalogPackages', 'catalogServices',
    'testBySlug', 'packageBySlug', 'serviceBySlug',
    'blogs', 'blogById', 'publicReviews', 'globalSearch'
  ]);

  const { fieldName } = event.info;

  if (!identity.sub && !PUBLIC_FIELDS.has(fieldName)) {
    throw new Error("Unauthorized: Missing authentication context");
  }

  const { arguments: args, source } = event;

  if (args && typeof args.input === 'string') {
    try {
      args.input = JSON.parse(args.input);
    } catch (e) {
      // Ignore JSON parse errors, leave as string
    }
  }

  try {
    switch (fieldName) {
      // ---------------------------------------------------------
      // Query Resolvers
      // ---------------------------------------------------------
      case 'patient': {
        const { id } = args;
        const patient = await patientRepo.getById(id);
        
        if (!patient) return null;
        
        // Use existing RBAC function
        // Need to mock the 'event' object if `canAccessPatient` expects API gateway event
        // Actually `canAccessPatient` takes (identity, patient)
        if (!(await canAccessPatient(identity, patient))) {
          throw new Error('Access denied: You are not authorized to view this patient record.');
        }
        
        return patient;
      }
      
      case 'globalSearch': {
        const { query, limit = 12 } = args;
        const isStaffUser = await isStaff(identity);
        const isAdminUser = await isAdmin(identity);
        
        const safeQuery = query ? query.trim() : '';
        if (!safeQuery) return [];

        const promises = [];
        
        // Public Catalog Searches
        promises.push(
          testRepo.search(safeQuery, limit).then(res => res.map(t => ({
            id: t.id || t.slug, type: 'test', title: t.title, subtitle: t.category || 'Test', href: `/tests/${t.slug}`, icon: 'TestTube'
          }))),
          packageRepo.search(safeQuery, limit).then(res => res.map(p => ({
            id: p.id || p.slug, type: 'package', title: p.title, subtitle: p.category || 'Package', href: `/health-packages/${p.slug}`, icon: 'Package'
          }))),
          serviceRepo.search(safeQuery, limit).then(res => res.map(s => ({
            id: s.id || s.slug, type: 'service', title: s.title, subtitle: s.category || 'Service', href: `/services/${s.slug}`, icon: 'Stethoscope'
          }))),
          blogRepo.search(safeQuery, limit).then(res => res.map(b => ({
            id: b.id || b.slug, type: 'blog', title: b.title, subtitle: `By ${b.author || 'Admin'}`, href: `/blog/${b.slug}`, icon: 'BookOpen'
          })))
        );

        // Secured Internal Searches
        if (isStaffUser || isAdminUser) {
          promises.push(
            patientRepo.search(safeQuery, limit).then(res => res.map(p => ({
              id: p.id, type: 'patient', title: p.name, subtitle: `ID: ${p.id}`, href: `/admin/patients/${p.id}`, icon: 'User'
            }))),
            bookingRepo.search(safeQuery, limit).then(res => res.map(b => ({
              id: b.id, type: 'booking', title: `Booking #${b.id}`, subtitle: b.patientName || 'Unknown Patient', href: `/admin/bookings/${b.id}`, icon: 'Calendar'
            }))),
            reportRepo.search(safeQuery, limit).then(res => res.map(r => ({
              id: r.id, type: 'report', title: `Report #${r.id}`, subtitle: r.patientName || r.status || 'Report', href: `/admin/reports/${r.id}`, icon: 'FileText'
            }))),
            invoiceRepo.search(safeQuery, limit).then(res => res.map(i => ({
              id: i.id, type: 'invoice', title: `Invoice #${i.id}`, subtitle: i.status || 'Invoice', href: `/admin/invoices/${i.id}`, icon: 'Receipt'
            }))),
            collectionRepo.search(safeQuery, limit).then(res => res.map(c => ({
              id: c.id, type: 'collection', title: `Collection #${c.id}`, subtitle: c.patient || c.status || 'Collection', href: `/admin/collections`, icon: 'Truck'
            }))),
            reviewRepo.search(safeQuery, limit).then(res => res.map(r => ({
              id: r.id, type: 'review', title: r.displayName || 'Review', subtitle: r.bookingId ? `Booking #${r.bookingId}` : 'Review', href: `/admin/reviews`, icon: 'Star'
            })))
          );
        }

        if (isAdminUser) {
          promises.push(
            staffRepo.searchStaff(safeQuery, limit).then(res => res.map(s => ({
              id: s.id, type: 'staff', title: s.name, subtitle: s.role || 'Staff', href: `/admin/staff`, icon: 'Users'
            })))
          );
        }

        const results = await Promise.allSettled(promises);
        
        // Flatten and limit
        let combined = [];
        for (const result of results) {
          if (result.status === 'fulfilled') {
            combined.push(...result.value);
          } else {
            logger.error(`Search partition failed: ${result.reason}`);
          }
        }
        
        return combined.slice(0, limit);
      }
      
      case 'dashboardStats': {
        // Enforce RBAC â€” admin always has access; staff need analytics.view permission
        const identityForCheck = identity;
        const { hasPermission } = require('../shared/auth');
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'analytics', 'view'))) {
          throw new Error('Access denied: Missing analytics.view permission');
        }
        
        // Ensure invoiceRepo is available in scope
        const invoiceRepo = require('../repositories/dynamo-invoice');

        const [bookingMetrics, revenueToday] = await Promise.all([
          bookingRepo.getDashboardMetrics(),
          invoiceRepo.getTodayRevenue()
        ]);
        
        return {
          totalPatients: null,          // populated by patientStats query
          awaitingVerification: null,   // no authoritative definition
          bookingsToday: bookingMetrics.bookingsToday,
          pendingBookings: bookingMetrics.pendingBookings,
          homeCollections: bookingMetrics.homeCollections,
          revenueToday: revenueToday
        };
      }

      case 'myPortal': {
        // 1. Identify valid patient IDs (authenticated sub + primaryPatientId + family members)
        const primaryPatientId = identity.primaryPatientId || `pat_${identity.sub}`;
        const allPatientIds = new Set([primaryPatientId, identity.sub]);
        
        const primaryPatient = await patientRepo.getById(primaryPatientId);
        let familyMembers = [];
        
        if (primaryPatient && Array.isArray(primaryPatient.savedPatients)) {
          primaryPatient.savedPatients.forEach(p => {
            if (p.id) allPatientIds.add(p.id);
          });
          familyMembers = primaryPatient.savedPatients;
        } else {
          // Fallback if not inside primaryPatient object, maybe owned patients?
          const ownedPatients = await patientRepo.getByOwner(identity.sub);
          ownedPatients.forEach(p => {
            if (p.id) allPatientIds.add(p.id);
          });
          familyMembers = ownedPatients.filter(p => p.id !== primaryPatientId);
        }

        // 2. Selection-Based Loading
        const requestedFields = event.info?.selectionSetList || [];
        const needsBookings = requestedFields.some(f => f === 'bookings' || f.startsWith('bookings/'));
        const needsInvoices = requestedFields.some(f => f === 'invoices' || f.startsWith('invoices/'));
        const needsReviews = requestedFields.some(f => f === 'reviews' || f.startsWith('reviews/'));
        const needsCollections = requestedFields.some(f => f === 'collections' || f.startsWith('collections/'));
        const needsReports = requestedFields.some(f => f === 'reports' || f.startsWith('reports/'));

        // 3. Concurrent Data Fetching
        const promises = [];
        const result = {
          patient: primaryPatient || { id: primaryPatientId, name: identity.username || 'Patient' },
          familyMembers: familyMembers,
          bookings: [],
          invoices: [],
          reviews: [],
          collections: [],
          reports: []
        };

        for (const pId of allPatientIds) {
          if (needsBookings) {
            promises.push(bookingRepo.getByPatientId(pId).then(data => {
              // Secure ownership boundary
              const owned = data.filter(b => b.ownerSub === identity.sub || b.patientId === pId);
              result.bookings.push(...owned);
            }));
          }
          if (needsInvoices) {
            promises.push(invoiceRepo.getByPatientId(pId).then(data => {
              const owned = data.filter(i => i.ownerSub === identity.sub || i.patientId === pId);
              result.invoices.push(...owned);
            }));
          }
          if (needsReviews) {
            promises.push(reviewRepo.getByPatientId(pId).then(data => {
              result.reviews.push(...data);
            }));
          }
          if (needsCollections) {
            promises.push(collectionRepo.getByPatientId(pId).then(data => {
              result.collections.push(...data);
            }));
          }
          if (needsReports) {
            promises.push(reportRepo.getByPatientId(pId).then(data => {
              const owned = data.filter(r => r.ownerSub === identity.sub || r.patientId === pId);
              result.reports.push(...owned);
            }));
          }
        }

        await Promise.allSettled(promises);

        // Map Denormalized patient snapshot for bookings / reports if missing but requested
        // DynamoDB already persists `patient` inside `Booking` and `Report`, so GraphQL will map it directly.

        // Sort descending
        result.bookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        result.invoices.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        result.reports.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        return result;
      }


      // ---------------------------------------------------------
      // NEW: Admin Bookings Workspace (Batch 7)
      // Replaces: REST GET /api/bookings (unbounded getAll)
      // ---------------------------------------------------------
      case 'adminBookingsWorkspace': {
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'orders', 'view'))) {
          throw new Error('Access denied: Missing orders.view permission');
        }

        const { limit = 20, cursor = null, status = 'All', tab = 'All', sort = 'date_newest', search = '' } = args;

        const paginated = await bookingRepo.getPaginated({ limit, cursor, status, tab, sort, search });

        return {
          queue: paginated.data,
          nextCursor: paginated.nextCursor,
          totalFiltered: paginated.data.length,
        };
      }

      // ---------------------------------------------------------
      // NEW: Admin Invoices Workspace
      // Replaces: REST GET /api/invoices (paginated)
      // ---------------------------------------------------------
      case 'adminInvoicesWorkspace': {
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'invoices', 'view'))) {
          throw new Error('Access denied: Missing invoices.view permission');
        }

        const { limit = 20, cursor = null, status = 'All', search = '' } = args;

        const paginated = await invoiceRepo.getPaginated({ limit, cursor, status, search });

        return {
          queue: paginated.data,
          nextCursor: paginated.nextCursor,
        };
      }

      // ---------------------------------------------------------
      // NEW: Admin Reviews Workspace
      // Replaces: REST GET /api/reviews (paginated)
      // ---------------------------------------------------------
      case 'adminReviewsWorkspace': {
        const identityForCheck = identity;
        if (!(await hasPermission(identityForCheck, 'reviews', 'view')) && !(await isAdmin(identityForCheck))) {
          throw new Error('Access denied: Missing reviews.view permission');
        }

        const { limit = 20, cursor = null, status = 'All', rating = 'All', search = '' } = args;

        const paginated = await reviewRepo.getPaginated({ limit, cursor, status, rating, search });

        return {
          queue: paginated.data,
          nextCursor: paginated.nextCursor,
        };
      }

      // ---------------------------------------------------------
      // NEW: Additional Review Resolvers
      // ---------------------------------------------------------
      case 'createReview': {
        if (!args.input || typeof args.input !== 'object') throw new Error('Input is required');
        const { bookingId, rating, comment, displayName } = args.input;
        if (!bookingId) throw new Error('bookingId is required to submit a review');
        
        const booking = await bookingRepo.getById(bookingId);
        if (!booking) throw new Error('Associated booking not found');
        if (booking.status !== 'Completed') throw new Error('Reviews can only be submitted for completed services.');
        
        // Ensure user is authorized to review this booking
        if (booking.patientId !== identity.sub && booking.ownerSub !== identity.sub && !booking.patientId?.includes(identity.sub)) {
           throw new Error('You are not authorized to review this booking.');
        }

        const ratingNum = Number(rating);
        if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) throw new Error('Rating must be an integer between 1 and 5.');
        const trimmedContent = (comment || '').trim();
        if (trimmedContent.length < 10 || trimmedContent.length > 2000) throw new Error('Comment must be between 10 and 2000 characters.');

        const reviewPayload = {
          patientId: booking.patientId || identity.primaryPatientId || `pat_${identity.sub}`,
          bookingId: booking.id,
          rating: ratingNum,
          content: trimmedContent,  // schema field is 'content', not 'comment'
          displayName: displayName || identity.fullName || 'Verified Patient',
          status: 'Pending',
          verified: true,
          ownerSub: identity.sub,
          createdBy: identity.sub,
        };

        try {
          const createdReview = await reviewRepo.create(reviewPayload);
          
          // Notify Admins
          try {
            const staffRepo = require('../repositories/dynamo-staff');
            const notificationRepo = require('../repositories/dynamo-notification');
            const allStaff = await staffRepo.getAllStaff();
            const admins = allStaff.filter(s => s.role === 'admin' || s.role === 'superadmin');
            for (const admin of admins) {
              await notificationRepo.create({
                userId: admin.id,
                title: 'New Patient Review',
                message: `A new ${ratingNum}-star review for booking ${booking.id} requires moderation.`,
                type: 'system',
                link: '/admin/reviews',
              });
            }
          } catch (notifErr) {
            logger.error('Failed to send review notifications to admins', notifErr);
          }

          return createdReview;
        } catch (createErr) {
          if (createErr.code === 'DUPLICATE_REVIEW' || createErr.statusCode === 409) {
            throw new Error('DUPLICATE_REVIEW: ' + createErr.message);
          }
          throw createErr;
        }
      }

      case 'moderateReview': {
        const identityForCheck = identity;
        if (!(await hasPermission(identityForCheck, 'reviews', 'edit')) && !(await isAdmin(identityForCheck))) {
          throw new Error('Access denied: Missing reviews.edit permission');
        }
        const { id, status } = args;
        if (!['Approved', 'Rejected'].includes(status)) throw new Error('Status must be Approved or Rejected.');
        return await reviewRepo.updateStatus(id, status);
      }

      case 'reviewById': {
        const { id } = args;
        const review = await reviewRepo.getById(id);
        if (!review) return null;
        
        const canViewFull = identity && (review.ownerSub === identity.sub || await hasPermission(identity, 'reviews', 'view'));
        if (review.status === 'Approved' && !canViewFull) {
          return {
            id: review.id, rating: review.rating, content: review.content || review.comment,
            displayName: review.displayName || 'Verified Patient', verified: !!review.verified, createdAt: review.createdAt
          };
        }
        
        if (!canViewFull) throw new Error('Access denied to this review');
        return review;
      }

      case 'reviewsByPatient': {
        const { patientId } = args;
        const targetPatientId = patientId || identity.primaryPatientId || identity.sub;
        if (targetPatientId !== identity.sub && targetPatientId !== identity.primaryPatientId && targetPatientId !== `pat_${identity.sub}` && !(await hasPermission(identity, 'reviews', 'view'))) {
          throw new Error('You are not authorized to view reviews for other patients');
        }
        return await reviewRepo.getByPatientId(targetPatientId);
      }

      case 'reviewByBooking': {
        const { bookingId } = args;
        const review = await reviewRepo.getByBookingId(bookingId);
        if (!review) return null;
        if (review.ownerSub !== identity.sub && !(await hasPermission(identity, 'reviews', 'view'))) {
          throw new Error('Access denied to this review');
        }
        return review;
      }

      case 'publicReviews': {
        const approved = await reviewRepo.getPublicApproved();
        return approved.map(r => ({
          id: r.id, rating: r.rating, content: r.content || r.comment,
          displayName: r.displayName || 'Verified Patient', verified: !!r.verified, createdAt: r.createdAt
        }));
      }

      case 'allReviews': {
        const identityForCheck = identity;
        if (!(await hasPermission(identityForCheck, 'reviews', 'view')) && !(await isAdmin(identityForCheck))) {
          throw new Error('Access denied: Missing reviews.view permission');
        }
        const { limit = 50, cursor = null, status = 'All', search = '' } = args;
        const paginated = await reviewRepo.getPaginated({ limit, cursor, status, search });
        return paginated.data;
      }

      // ---------------------------------------------------------
      // NEW: Targeted single booking lookup
      // Replaces: REST GET /api/bookings/:id
      // ---------------------------------------------------------
      case 'bookingById': {
        const { id } = args;
        if (!id) throw new Error('Missing booking ID');

        const booking = await bookingRepo.getById(id);
        if (!booking) return null;

        // Authorization: admin/staff OR booking owned by the calling patient
        const identityForCheck = identity;
        const isAdminOrStaff = (await isAdmin(identityForCheck)) || (await isStaff(identityForCheck));
        if (!isAdminOrStaff) {
          const patientSub = `pat_${identity.sub}`;
          const allowed =
            booking.patientId === identity.sub ||
            booking.patientId === patientSub ||
            booking.ownerSub === identity.sub;
          if (!allowed) throw new Error('Access denied: You are not authorized to view this booking.');
        }

        return booking;
      }

      // ---------------------------------------------------------
      // NEW: Targeted single invoice lookup
      // Replaces: REST GET /api/invoices/:id
      // ---------------------------------------------------------
      case 'invoiceById': {
        const { id } = args;
        if (!id) throw new Error('Missing invoice ID');

        const invoice = await invoiceRepo.getById(id);
        if (!invoice) return null;

        const identityForCheck = identity;
        const isAdminOrStaff = (await isAdmin(identityForCheck)) || (await isStaff(identityForCheck));
        if (!isAdminOrStaff) {
          const patientSub = `pat_${identity.sub}`;
          const allowed =
            invoice.patientId === identity.sub ||
            invoice.patientId === patientSub ||
            invoice.ownerSub === identity.sub;
          if (!allowed) throw new Error('Access denied: You are not authorized to view this invoice.');
        }

        return invoice;
      }

      // ---------------------------------------------------------
      // NEW: Targeted catalog lookups
      // Replaces: REST GET /api/tests/:id, /api/packages/:id, /api/services/:id
      // ---------------------------------------------------------
      case 'testById': {
        const { id } = args;
        if (!id) throw new Error('Missing test ID');
        return await testRepo.getById(id);
      }
      
      case 'packageById': {
        const { id } = args;
        if (!id) throw new Error('Missing package ID');
        return await packageRepo.getById(id);
      }
      
      case 'serviceById': {
        const { id } = args;
        if (!id) throw new Error('Missing service ID');
        return await serviceRepo.getById(id);
      }

      // ---------------------------------------------------------
      // NEW: Patient-scoped bookings list
      // Replaces: REST GET /api/bookings?patientId=
      // ---------------------------------------------------------
      case 'myBookings': {
        const primaryPatientId = identity.primaryPatientId || `pat_${identity.sub}`;

        // Gather all patient IDs the caller owns (self + family)
        const allPatientIds = new Set([primaryPatientId, identity.sub]);
        const primaryPatient = await patientRepo.getById(primaryPatientId);
        if (primaryPatient && Array.isArray(primaryPatient.savedPatients)) {
          primaryPatient.savedPatients.forEach(p => { if (p.id) allPatientIds.add(p.id); });
        } else {
          const owned = await patientRepo.getByOwner(identity.sub);
          owned.forEach(p => { if (p.id) allPatientIds.add(p.id); });
        }

        const allBookings = [];
        const perPatientPromises = [...allPatientIds].map(pid =>
          bookingRepo.getByPatientId(pid).then(data => {
            const owned = data.filter(b => b.ownerSub === identity.sub || b.patientId === pid);
            allBookings.push(...owned);
          }).catch(() => {})
        );
        await Promise.allSettled(perPatientPromises);

        allBookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return allBookings;
      }

      // ---------------------------------------------------------
      // NEW: Patient / staff notification feed
      // ---------------------------------------------------------
      case 'myNotifications': {
        const notifRepo = require('../repositories/dynamo-notification');
        return notifRepo.getByUserId(identity.sub);
      }

      // ---------------------------------------------------------
      // Staff Management (Admin Workspace)
      // ---------------------------------------------------------
      case 'adminStaffWorkspace': {
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'staff', 'view'))) {
          throw new Error('Access denied: Missing staff.view permission');
        }
        return await staffRepo.getAllStaff(500);
      }

      case 'staffById': {
        const { id } = args;
        const identityForCheck = identity;
        if (id !== identity.sub && !(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'staff', 'view'))) {
          throw new Error('Access denied: Missing staff.view permission');
        }
        return await staffRepo.getStaffById(id);
      }

      case 'adminRoles': {
        const identityForCheck = identity;
        const { isAdmin } = require('../shared/auth');
        if (!(await isAdmin(identityForCheck))) {
          throw new Error('Access denied: Admin only');
        }
        
        let roles = await rbacRepo.getRoles();
        if (!roles) {
          roles = [
            { id: 'admin', title: 'System Administrator', internal: 'ADMIN', users: 0, desc: 'Unrestricted system access.', color: '#3b82f6' },
            { id: 'op', title: 'Operation Manager', internal: 'OPERATION_MANAGER', users: 0, desc: 'Manages day-to-day operations.', color: '#10b981' },
            { id: 'path', title: 'Lead Pathologist', internal: 'PATHOLOGIST', users: 0, desc: 'Oversees lab results & reports.', color: '#8b5cf6' },
            { id: 'phleb', title: 'Phlebotomist', internal: 'FIELD_AGENT', users: 0, desc: 'Home collection field agents.', color: '#f59e0b' },
            { id: 'phleb_home', title: 'Home Collection Agent', internal: 'HOME_COLLECTION', users: 0, desc: 'Handles home sample collection visits.', color: '#0ea5e9', scope: 'home_collection' },
            { id: 'phleb_lab', title: 'In-Lab Technician', internal: 'IN_LAB_TECH', users: 0, desc: 'Handles in-lab patient visits and sample processing.', color: '#6366f1', scope: 'in_lab' },
          ];
          await rbacRepo.setRoles(roles);
        }
        return roles;
      }

      case 'adminPermissionsMap': {
        let perms = await rbacRepo.getPermissions();
        if (!perms) {
          // Empty or fallback handling, returning empty string to let client handle it
          return "[]";
        }
        return JSON.stringify(perms);
      }

      // ---------------------------------------------------------
      // NEW: Mark notification read (Mutation)
      // ---------------------------------------------------------
      case 'markNotificationRead': {
        const { id } = args;
        if (!id) throw new Error('Missing notification ID');
        const notifRepo = require('../repositories/dynamo-notification');
        const notif = await notifRepo.getById(id);
        if (!notif) throw new Error('Notification not found');
        if (notif.userId !== identity.sub && !notif.userId?.includes(identity.sub)) {
          throw new Error('Access denied: Notification does not belong to the caller.');
        }
        await notifRepo.markAsRead(id);
        return true;
      }

      // ---------------------------------------------------------
      // Payment Mutations
      // ---------------------------------------------------------
      case 'createPaymentOrder': {
        if (!identity) throw new Error('Missing authentication token');
        const { invoiceId } = args;
        if (!invoiceId) throw new Error('Missing invoiceId');

        const invoiceRepo = require('../repositories/dynamo-invoice');
        const invoice = await invoiceRepo.getById(invoiceId);
        if (!invoice) throw new Error('Invoice not found');

        // Ownership verify
        if (invoice.ownerSub !== identity.sub && invoice.patientId !== identity.primaryPatientId) {
          throw new Error('Not authorized to pay this invoice');
        }

        if (invoice.paymentStatus === 'Paid') {
          throw new Error('Invoice is already paid');
        }

        // Use the shared phonepe service
        const { createPaymentOrder } = require('../shared/phonepe');
        // AppSync strips browser Origin headers before Lambda receives them.
        // Use the deployed site URL from env (set in template.yaml SITE_URL), then
        // fall back to the request origin header (for local dev via /api/graphql proxy),
        // then finally localhost.
        const requestHeaders = event.request?.headers || {};
        const host = process.env.SITE_URL
          || requestHeaders['origin']
          || requestHeaders['Origin']
          || 'http://localhost:3000';
        const amountInPaisa = Math.round((invoice.total || 0) * 100);
        
        try {
          const redirectUrl = await createPaymentOrder(invoiceId, amountInPaisa, host);
          return redirectUrl;
        } catch (err) {
          logger.error('Payment initialization error', err);
          throw new Error('Payment gateway initialization failed');
        }
      }

      case 'paymentStatus': {
        if (!identity) throw new Error('Missing authentication token');
        const { invoiceId } = args;
        
        const invoiceRepo = require('../repositories/dynamo-invoice');
        const invoice = await invoiceRepo.getById(invoiceId);
        if (!invoice) throw new Error('Invoice not found');
        
        // Ownership verify
        if (invoice.ownerSub !== identity.sub && invoice.patientId !== identity.primaryPatientId) {
          throw new Error('Not authorized to view this invoice status');
        }

        if (invoice.paymentStatus === 'Paid') {
          return invoice; // Already paid locally
        }

        const { getPaymentStatus } = require('../shared/phonepe');
        try {
          const statusResponse = await getPaymentStatus(invoiceId);
          if (statusResponse && statusResponse.state === 'COMPLETED') {
             const providerTxnId = statusResponse.paymentDetails?.[0]?.transactionId || statusResponse.orderId;
             const paymentMethod = statusResponse.paymentDetails?.[0]?.paymentMode || 'Online';
             
             // Update Invoice
             await invoiceRepo.update(invoiceId, {
               paymentStatus: 'Paid',
               paymentMethod: paymentMethod,
               paidAt: new Date().toISOString(),
               providerTransactionId: providerTxnId
             });
             
             // Update Booking
             if (invoice.bookingId) {
               const bookingRepo = require('../repositories/dynamo-booking');
               await bookingRepo.updatePaymentStatus(invoice.bookingId, 'Paid');
             }
             
             const updatedInvoice = await invoiceRepo.getById(invoiceId);
             return updatedInvoice;
          }
          
          return invoice; // Return current invoice state if not completed
        } catch (err) {
          logger.error(`Error fetching order status for invoice ${invoiceId}`, err);
          return invoice; // Fallback to local state if SDK fails
        }
      }

      // ---------------------------------------------------------
      // Staff Mutations
      // ---------------------------------------------------------
      case 'createStaff': {
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'staff', 'create'))) {
          throw new Error('Access denied: Missing staff.create permission');
        }

        const { name, email, phone, role, department, shift } = args;
        
        // Fetch roles
        let validRoles = VALID_STAFF_ROLES;
        try {
          const dbRoles = await rbacRepo.getRoles();
          if (dbRoles) validRoles = dbRoles.map(r => r.id);
        } catch (err) {}

        if (!validRoles.includes(role)) {
          throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;
        const cleanName = name.trim();

        // 1. Create Cognito user
        let cognitoUser;
        try {
          const createCommand = new AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: cleanEmail,
            DesiredDeliveryMediums: ['EMAIL'],
            UserAttributes: [
              { Name: 'email', Value: cleanEmail },
              { Name: 'email_verified', Value: 'true' },
              { Name: 'phone_number', Value: cleanPhone },
              { Name: 'name', Value: cleanName },
              { Name: 'custom:role', Value: role },
            ],
          });
          const createResult = await cognitoClient.send(createCommand);
          cognitoUser = createResult.User;
        } catch (err) {
          throw new Error(err.message || 'Failed to create employee Cognito account.');
        }

        const cognitoSub = cognitoUser?.Attributes?.find(a => a.Name === 'sub')?.Value;
        if (!cognitoSub) throw new Error('Employee account created but identity could not be resolved.');

        const groupName = ROLE_TO_GROUP[role];
        if (groupName) {
          try {
            await cognitoClient.send(new AdminAddUserToGroupCommand({
              UserPoolId: USER_POOL_ID,
              Username: cleanEmail,
              GroupName: groupName,
            }));
          } catch (err) {}
        }

        return await staffRepo.createStaff({
          id: cognitoSub,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role,
          department: department || 'General',
          status: 'On Duty',
          shift: shift || 'Morning',
          joinDate: new Date().toISOString(),
          cognitoUsername: cleanEmail,
          cognitoStatus: 'FORCE_CHANGE_PASSWORD',
        });
      }

      case 'updateStaff': {
        const { id, ...updates } = args;
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'staff', 'edit'))) {
          throw new Error('Access denied: Missing staff.edit permission');
        }

        // Validate role if changing
        if (updates.role) {
          let validRoles = VALID_STAFF_ROLES;
          try {
            const dbRoles = await rbacRepo.getRoles();
            if (dbRoles) validRoles = dbRoles.map(r => r.id);
          } catch (err) {}

          if (!validRoles.includes(updates.role)) {
            throw new Error('Invalid role.');
          }
        }

        return await staffRepo.updateStaff(id, updates);
      }

      case 'createRole': {
        const identityForCheck = identity;
        // Admin OR staff with create permission â€” either condition is sufficient
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'staff', 'create'))) {
          throw new Error('Access denied: Missing staff.create permission');
        }

        const { title, internal, desc, color } = args;
        const id = args.title.toLowerCase().replace(/\\s+/g, '_');

        if (VALID_STAFF_ROLES.includes(id)) {
          throw new Error('Cannot override system roles.');
        }

        let roles = await rbacRepo.getRoles() || [];
        if (roles.find(r => r.id === id)) {
          throw new Error('A role with this ID already exists.');
        }

        const newRole = { id, title, internal, users: 0, desc: desc || 'Custom role', color: color || '#0ea5e9' };
        roles.push(newRole);
        await rbacRepo.setRoles(roles);

        let perms = await rbacRepo.getPermissions() || [];
        if (!perms.find(p => p.roleId === id)) {
          const emptyModules = perms.length > 0 && perms[0].modules ? perms[0].modules.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            permissions: [{ view: false, create: false, edit: false, del: false, assign: false, name: m.permissions[0].name, description: m.permissions[0].description }]
          })) : [];
          perms.push({ id, roleId: id, modules: emptyModules });
          await rbacRepo.setPermissions(perms);
        }

        return newRole;
      }

      case 'updatePermissions': {
        const identityForCheck = identity;
        // Admin OR staff with edit permission â€” either condition is sufficient
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'staff', 'edit'))) {
          throw new Error('Access denied: Missing staff.edit permission');
        }

        const body = JSON.parse(args.records);
        if (!Array.isArray(body)) {
          throw new Error('Expected an array of permission records.');
        }

        await rbacRepo.setPermissions(body);
        return true;
      }

      case 'adminCollectionsWorkspace': {
        const { hasPermission } = require('../shared/auth');
        const identityForCheck = identity;
        
        // Authorization: Admin or specific collection scope
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'collections', 'view'))) {
          throw new Error('Access denied: Missing collections.view permission');
        }

        const { limit = 20, cursor = null, tab = 'HOME', sort = 'date_oldest', search = '' } = args;

        const promises = [
          collectionRepo.getPaginated({ limit, cursor, tab, sort, search }),
          collectionRepo.getStats(),
          staffRepo.getAllStaff(500) // Bounded at 500, easily fits in memory
        ];

        const [paginated, stats, staffRes] = await Promise.all(promises);

        // Strictly filter staff to only on-duty phlebotomists
        const phlebotomists = (staffRes || []).filter(s => 
          (s.role === 'Phleb' || s.role === 'phleb' || s.role === 'phleb_home' || s.role === 'Phlebotomist') && s.status === 'On Duty'
        );

        return {
          queue: paginated,
          stats,
          phlebotomists
        };
      }

      case 'adminReportsWorkspace': {
        const { hasPermission } = require('../shared/auth');
        const identityForCheck = identity;
        
        // Authorization: Admin or specific reports scope
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'reports', 'view'))) {
          throw new Error('Access denied: Missing reports.view permission');
        }

        const { limit = 20, cursor = null, status = 'All', sort = 'date_newest', search = '' } = args;

        // Run paginated query and pending count in parallel
        const [paginated, pendingCount] = await Promise.all([
          reportRepo.getPaginated({ limit, cursor, status, sort, search }),
          reportRepo.getPendingCount(),
        ]);

        return {
          queue: paginated.data,
          nextCursor: paginated.nextCursor,
          pendingCount,
        };
      }

      case 'adminCatalogWorkspace': {
        const { hasPermission } = require('../shared/auth');
        const identityForCheck = identity;
        
        // Authorization: Admin or specific catalog scope
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'catalog', 'view'))) {
          throw new Error('Access denied: Missing catalog.view permission');
        }

        const [tests, packages, services] = await Promise.all([
          testRepo.getCatalog(1000),
          packageRepo.getCatalog(1000),
          serviceRepo.getCatalog(1000)
        ]);

        return {
          tests: tests || [],
          packages: packages || [],
          services: services || []
        };
      }

      // ---------------------------------------------------------
      // Patient Relational Resolvers (Nested fields)
      // ---------------------------------------------------------
      case 'bookings': {
        // Triggered when resolving `Patient.bookings` outside of myPortal
        if (!source || !source.id) throw new Error("Missing parent patient context");
        return bookingRepo.getByPatientId(source.id);
      }
      
      case 'reports': {
        if (!source || !source.id) throw new Error("Missing parent patient context");
        return reportRepo.getByPatientId(source.id);
      }
      
      case 'invoices': {
        if (!source || !source.id) throw new Error("Missing parent patient context");
        return invoiceRepo.getByPatientId(source.id);
      }

      case 'analyticsCharts': {
        // Require analytics.view permission â€” identical to dashboardStats
        const identityForCheck = identity;
        if (!(await hasPermission(identityForCheck, 'analytics', 'view'))) {
          throw new Error('Access denied: Missing analytics.view permission');
        }

        const revenueByMonth = await invoiceRepo.getRevenueByMonth();
        return { revenueByMonth };
      }

      case 'patientStats': {
        // Require analytics.view permission (same authority as dashboardStats)
        const identityForCheck = identity;
        if (!(await hasPermission(identityForCheck, 'analytics', 'view'))) {
          throw new Error('Access denied: Missing analytics.view permission');
        }

        const now = new Date();
        // UTC year-month prefix for begins_with on GSI1SK
        const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

        const [totalPatients, newThisMonth] = await Promise.all([
          patientRepo.countAll(),
          patientRepo.countThisMonth(yearMonth),
        ]);

        // retentionRate is intentionally not returned: no authoritative
        // business definition or supporting data model exists.
        return { totalPatients, newThisMonth };
      }

      case 'reviewStats': {
        // Require reviews.view permission â€” identical to the review REST handler
        const identityForCheck = identity;
        if (!(await hasPermission(identityForCheck, 'reviews', 'view'))) {
          throw new Error('Access denied: Missing reviews.view permission');
        }

        return reviewRepo.getStats();
      }
      // ---------------------------------------------------------
      // NEW: Unified Catalog Resolvers (Tests, Services, Packages)
      // ---------------------------------------------------------
      case 'catalogTests':
      case 'catalogServices':
      case 'catalogPackages': {
        const isTest = fieldName === 'catalogTests';
        const isService = fieldName === 'catalogServices';
        const repo = isTest ? testRepo : isService ? serviceRepo : packageRepo;
        
        let canViewInactive = false;
        if (identity) {
          const identityForCheck = identity;
          if (await isAdmin(identityForCheck) || await hasPermission(identityForCheck, 'catalog', 'view')) {
            canViewInactive = true;
          }
        }

        const { page = 1, limit = 100, q = '' } = args;

        let allItems;

        if (q) {
          // Use the native, GSI1-scoped search â€” no full-catalog fetch needed
          let searchResults = await repo.search(q, limit);
          if (!canViewInactive) {
            searchResults = searchResults.filter(item => !item.status || item.status === 'ACTIVE');
          }
          return {
            data: searchResults,
            meta: { total: searchResults.length, page: 1, limit: searchResults.length, totalPages: 1 }
          };
        }

        allItems = await repo.getCatalog();

        if (!canViewInactive) {
          allItems = allItems.filter(item => !item.status || item.status === 'ACTIVE');
        }

        const start = (page - 1) * limit;
        const data = allItems.slice(start, start + limit);
        return {
          data,
          meta: { total: allItems.length, page, limit, totalPages: Math.ceil(allItems.length / limit) || 1 }
        };
      }

      case 'testBySlug':
      case 'serviceBySlug':
      case 'packageBySlug':
      case 'testById':
      case 'serviceById':
      case 'packageById': {
        const isTest = fieldName.startsWith('test');
        const isService = fieldName.startsWith('service');
        const repo = isTest ? testRepo : isService ? serviceRepo : packageRepo;
        
        let canViewInactive = false;
        if (identity) {
          const identityForCheck = identity;
          if (await isAdmin(identityForCheck) || await hasPermission(identityForCheck, 'catalog', 'view')) {
            canViewInactive = true;
          }
        }

        const { slug, id } = args;
        const lookup = slug || id;
        if (!lookup) throw new Error('Missing slug or id');

        const item = slug ? await repo.getBySlug(slug) : await repo.getById(id);
        if (!item) return null;
        if (!canViewInactive && item.status && item.status !== 'ACTIVE') return null;
        return item;
      }

      case 'createCatalogTest':
      case 'createCatalogService':
      case 'createCatalogPackage': {
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'catalog', 'create'))) {
          throw new Error('Access denied: Requires catalog create permission');
        }
        
        const isTest = fieldName === 'createCatalogTest';
        const isService = fieldName === 'createCatalogService';
        const repo = isTest ? testRepo : isService ? serviceRepo : packageRepo;
        
        const { input } = args;
        if (!input.slug || !input.title) throw new Error('Missing required fields (slug, title)');
        
        const existing = await repo.getBySlug(input.slug);
        if (existing) throw new Error('An item with this slug already exists');
        
        return await repo.upsert(input);
      }

      case 'updateCatalogTest':
      case 'updateCatalogService':
      case 'updateCatalogPackage': {
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'catalog', 'edit'))) {
          throw new Error('Access denied: Requires catalog edit permission');
        }
        
        const isTest = fieldName === 'updateCatalogTest';
        const isService = fieldName === 'updateCatalogService';
        const repo = isTest ? testRepo : isService ? serviceRepo : packageRepo;
        
        const { id, input } = args;
        if (!id) throw new Error('Missing id');
        
        try {
          return await repo.update(id, input);
        } catch (err) {
          if (err.message.includes('not found')) throw new Error('Item not found');
          throw err;
        }
      }

      case 'updateCatalogTestStatus':
      case 'updateCatalogServiceStatus':
      case 'updateCatalogPackageStatus': {
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'catalog', 'edit'))) {
          throw new Error('Access denied: Requires catalog edit permission');
        }
        
        const isTest = fieldName === 'updateCatalogTestStatus';
        const isService = fieldName === 'updateCatalogServiceStatus';
        const repo = isTest ? testRepo : isService ? serviceRepo : packageRepo;
        
        const { id, status } = args;
        if (!id || !status) throw new Error('Missing id or status');
        
        try {
          await repo.updateStatus(id, status);
          return true;
        } catch (err) {
          if (err.message.includes('not found')) throw new Error('Item not found');
          throw err;
        }
      }

      case 'deleteCatalogTest':
      case 'deleteCatalogService':
      case 'deleteCatalogPackage': {
        const identityForCheck = identity;
        if (!(await isAdmin(identityForCheck)) && !(await hasPermission(identityForCheck, 'catalog', 'delete'))) {
          throw new Error('Access denied: Requires catalog delete permission');
        }
        
        const isTest = fieldName === 'deleteCatalogTest';
        const isService = fieldName === 'deleteCatalogService';
        const repo = isTest ? testRepo : isService ? serviceRepo : packageRepo;
        
        const { id } = args;
        if (!id) throw new Error('Missing id');
        
        const existing = await repo.getById(id) || await repo.getBySlug(id);
        if (!existing) throw new Error('Item not found');
        
        await repo.delete(existing.id);
        return true;
      }
      // ---------------------------------------------------------
      // NEW: Unified Patient Resolvers
      // ---------------------------------------------------------
      case 'mePatient': {
        if (!identity) throw new Error('Unauthorized');
        const ownedPatients = await patientRepo.getByOwner(identity.sub);
        if (ownedPatients.length > 0) return ownedPatients[0];
        
        return {
          id: identity.primaryPatientId || `pat_${identity.sub}`,
          name: identity.username || 'Patient',
          email: identity.email,
          phone: identity.phone,
          role: identity.role,
          status: 'Active',
          ownerSub: identity.sub,
        };
      }

      case 'patientById': {
        const { id } = args;
        const patient = await patientRepo.getById(id);
        if (!patient) return null;
        
        const identityForCheck = identity;
        if (!(await canAccessPatient(identityForCheck, patient))) {
          let hasPhlebAccess = false;
          if (await isPhlebotomist(identityForCheck)) {
            const collectionRepo = require('../repositories/dynamo-collection');
            const collections = await collectionRepo.getByPatientId(patient.id);
            hasPhlebAccess = collections.some(c => 
              c.phlebotomistId === identity.sub ||
              c.phlebotomistId === identity.username ||
              c.assignedTo === identity.username ||
              c.assignedTo === identity.sub
            );
          }
          if (!hasPhlebAccess) throw new Error('Access denied: You are not authorized to view this patient record.');
        }
        return patient;
      }

      case 'patients': {
        const identityForCheck = identity;
        if ((await isAdmin(identityForCheck)) || ((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
          if (!(await hasPermission(identityForCheck, 'patients', 'view'))) {
            throw new Error('Access denied: Missing patients.view permission');
          }
          const { limit = 20, cursor = null, search = '' } = args;
          const paginated = await patientRepo.getPaginated({ limit, cursor, search });
          const totalCount = paginated.totalCount ?? paginated.data.length;
          return { data: paginated.data, nextCursor: paginated.nextCursor, meta: { total: totalCount, page: 1, limit, totalPages: Math.ceil(totalCount / limit) || 1 } };
        } else if (await isPhlebotomist(identityForCheck)) {
          return { data: [], nextCursor: null, meta: { total: 0, page: 1, limit: 20, totalPages: 1 } };
        } else {
          const myPatients = await patientRepo.getByOwner(identity.sub);
          return { data: myPatients, nextCursor: null, meta: { total: myPatients.length, page: 1, limit: myPatients.length, totalPages: 1 } };
        }
      }

      case 'createPatient': {
        const { input } = args;
        const identityForCheck = identity;
        const isStaffUser = await isStaff(identityForCheck);
        
        if (isStaffUser && !(await hasPermission(identityForCheck, 'patients', 'create'))) {
          throw new Error('Access denied: Missing patients.create permission');
        }

        let patientId = input.id || `pat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        let ownerSub = identity.sub;

        if (isStaffUser && input.email && typeof input.email === 'string') {
          const cleanEmail = input.email.trim().toLowerCase();
          const cleanPhone = input.phone ? (input.phone.trim().startsWith('+') ? input.phone.trim() : `+91${input.phone.trim()}`) : '';
          const cleanName = input.name ? input.name.trim() : 'Patient';

          try {
            const USER_POOL_ID = process.env.USER_POOL_ID;
            if (USER_POOL_ID) {
              const createCommand = new AdminCreateUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: cleanEmail,
                DesiredDeliveryMediums: ['EMAIL'],
                UserAttributes: [
                  { Name: 'email', Value: cleanEmail },
                  { Name: 'email_verified', Value: 'true' },
                  ...(cleanPhone ? [{ Name: 'phone_number', Value: cleanPhone }] : []),
                  { Name: 'name', Value: cleanName },
                  { Name: 'custom:role', Value: 'patient' },
                ],
              });
              const createResult = await cognitoClient.send(createCommand);
              const cognitoSub = createResult.User?.Attributes?.find(a => a.Name === 'sub')?.Value;
              if (cognitoSub) {
                patientId = `pat_${cognitoSub}`;
                ownerSub = cognitoSub;
              }
            }
          } catch (err) {
            if (err.name === 'UsernameExistsException') {
              // Patient already has a Cognito account - look up their existing DynamoDB record
              try {
                const { AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
                const USER_POOL_ID = process.env.USER_POOL_ID;
                const existingCognitoUser = await cognitoClient.send(new AdminGetUserCommand({
                  UserPoolId: USER_POOL_ID,
                  Username: input.email.trim().toLowerCase(),
                }));
                const existingSub = existingCognitoUser.UserAttributes?.find(a => a.Name === 'sub')?.Value;
                if (existingSub) {
                  const existingPatient = await patientRepo.getById(`pat_${existingSub}`);
                  if (existingPatient) {
                    logger.info(`Returning existing patient for sub ${existingSub}`);
                    return existingPatient;
                  }
                  // Patient exists in Cognito but not in DB - create DB record with correct IDs
                  patientId = `pat_${existingSub}`;
                  ownerSub = existingSub;
                }
              } catch (lookupErr) {
                logger.warn('Failed to retrieve existing patient from Cognito', lookupErr);
              }
              // Fall through to create the DynamoDB patient record with the resolved IDs
            } else {
              logger.error('Failed to provision Cognito account for new patient', err);
              throw new Error('Failed to provision patient account.');
            }
          }
        }
        
        const newPatientData = {
          ...input,
          id: patientId,
          ownerSub: ownerSub,
          phone: input.phone || identity.phone,
          email: input.email || identity.email,
          status: input.status || 'Active',
        };

        return await patientRepo.create(newPatientData, ownerSub);
      }

      case 'updatePatient': {
        const { id, input } = args;
        let targetPatientId = id;
        
        if (id === 'me') {
          const ownedPatients = await patientRepo.getByOwner(identity.sub);
          if (ownedPatients.length > 0) {
            targetPatientId = ownedPatients[0].id;
          } else {
            targetPatientId = identity.primaryPatientId || `pat_${identity.sub}`;
          }
        }

        if (!targetPatientId) throw new Error('Missing id');

        const existingPatient = await patientRepo.getById(targetPatientId);
        if (!existingPatient) {
          return await patientRepo.create({
            id: targetPatientId,
            ...input,
            ownerSub: identity.sub,
          }, identity.sub);
        }

        const identityForCheck = identity;
        if (!(await canAccessPatient(identityForCheck, existingPatient))) {
          throw new Error('Access denied: You are not authorized to update this patient record.');
        }

        if ((await isStaff(identityForCheck)) && existingPatient.ownerSub !== identity.sub) {
          if (!(await hasPermission(identityForCheck, 'patients', 'edit'))) {
            throw new Error('Access denied: Missing patients.edit permission');
          }
        }

        return await patientRepo.update(targetPatientId, input);
      }

      // ---------------------------------------------------------
      // NEW: Unified Booking Resolvers
      // ---------------------------------------------------------
      case 'bookingById': {
        const { id } = args;
        const booking = await bookingRepo.getById(id);
        if (!booking) return null;

        let patient = null;
        if (booking.patientId) {
          patient = await patientRepo.getById(booking.patientId);
        }

        const identityForCheck = identity;
        if (!(await canAccessBooking(identityForCheck, booking, patient))) {
          let hasPhlebAccess = false;
          if (await isPhlebotomist(identityForCheck)) {
            const collections = await collectionRepo.getByPatientId(booking.patientId);
            hasPhlebAccess = collections.some(c => 
              c.bookingId === booking.id && (
                c.phlebotomistId === identity.sub ||
                c.phlebotomistId === identity.username ||
                c.assignedTo === identity.username ||
                c.assignedTo === identity.sub
              )
            );
          }
          if (!hasPhlebAccess) throw new Error('Access denied: You are not authorized to view this booking.');
        }

        return booking;
      }

      case 'bookingsByPatient': {
        const { patientId } = args;
        const identityForCheck = identity;
        
        if (!(await isAdmin(identityForCheck)) && !(await isStaff(identityForCheck))) {
          const patient = await patientRepo.getById(patientId);
          if (patient && !(await canAccessPatient(identityForCheck, patient))) {
            throw new Error('Access denied: You are not authorized to view bookings for this patient.');
          }
          if (!patient && patientId !== identity.primaryPatientId && patientId !== identity.sub) {
            throw new Error('Access denied: Unauthorized patient query.');
          }
        } else {
          if (!(await hasPermission(identityForCheck, 'orders', 'view'))) {
            throw new Error('Access denied: Missing orders.view permission');
          }
        }

        return await bookingRepo.getByPatientId(patientId);
      }

      case 'recentBookings': {
        const { limit = 10 } = args;
        const identityForCheck = identity;

        if ((await isAdmin(identityForCheck)) || ((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
          if (!(await hasPermission(identityForCheck, 'orders', 'view'))) {
            throw new Error('Access denied: Missing orders.view permission');
          }
          let bookings = await bookingRepo.getRecent(limit);
          return bookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        } else if (await isPhlebotomist(identityForCheck)) {
          return [];
        } else {
          const allPatientIds = new Set([identity.primaryPatientId || `pat_${identity.sub}`, identity.sub]);
          
          const primaryPatient = await patientRepo.getById(identity.primaryPatientId || `pat_${identity.sub}`);
          if (primaryPatient && Array.isArray(primaryPatient.savedPatients)) {
            primaryPatient.savedPatients.forEach(p => {
              if (p.id) allPatientIds.add(p.id);
            });
          }

          const bookingLists = await Promise.all(
            Array.from(allPatientIds).map((pId) => bookingRepo.getByPatientId(pId))
          );
          
          let flattened = bookingLists.flat().filter(b => b.ownerSub === identity.sub);
          flattened.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          return flattened.slice(0, limit);
        }
      }

      case 'createBooking': {
        const { input, idempotencyKey: rawIdempotencyKey } = args;
        const idempotencyKey = rawIdempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const identityForCheck = identity;

        if ((await isStaff(identityForCheck)) && !(await hasPermission(identityForCheck, 'orders', 'create'))) {
          throw new Error('Access denied: Missing orders.create permission');
        }

        const bookingId = input.id || `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newBookingData = {
          ...input,
          id: bookingId,
          ownerSub: identity.sub,
          status: input.status || 'Pending',
        };

        if (!newBookingData.patientId && newBookingData.patient) {
          newBookingData.patientId = `pat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        }

        const invoiceItems = [];
        for (let i = 0; i < (newBookingData.items || []).length; i++) {
          const item = newBookingData.items[i];
          let authoritativePrice = 0;
          
          if (item.type === 'Package') {
            const pkg = item.slug ? await packageRepo.getBySlug(item.slug) : (item.id ? await packageRepo.getById(item.id) : null);
            if (pkg && pkg.status === 'ACTIVE') {
              authoritativePrice = parseFloat(pkg.price || pkg.packagePrice || '0');
            } else if (item.price != null && !isNaN(parseFloat(item.price))) {
              // Package not found in DB or not active - trust admin-provided price
              authoritativePrice = parseFloat(item.price);
            } else {
              throw new Error(`Package "${item.name}" is unavailable or has no price. Please re-add it from the catalog.`);
            }
          } else {
            const test = item.slug ? await testRepo.getBySlug(item.slug) : (item.id ? await testRepo.getById(item.id) : null);
            if (test && test.status === 'ACTIVE') {
              authoritativePrice = parseFloat(test.price || '0');
            } else {
              const service = item.slug ? await serviceRepo.getBySlug(item.slug) : (item.id ? await serviceRepo.getById(item.id) : null);
              if (service && service.status === 'ACTIVE') {
                authoritativePrice = parseFloat(service.price || '0');
              } else if (item.price != null && !isNaN(parseFloat(item.price))) {
                // Item not found in DB - trust admin-provided price
                authoritativePrice = parseFloat(item.price);
              } else {
                throw new Error(`Item "${item.name}" is unavailable or has no price. Please re-add it from the catalog.`);
              }
            }
          }
          
          if (isNaN(authoritativePrice)) authoritativePrice = 0;

          invoiceItems.push({
            id: `ITEM-${i}-${Date.now()}`,
            name: item.name,
            type: item.type === 'Package' ? 'Package' : 'Test',
            price: authoritativePrice
          });
          
          item.price = authoritativePrice;
        }

        const subtotal = invoiceItems.reduce((sum, item) => sum + item.price, 0);
        const collectionFee = (newBookingData.collection?.type === 'Home Collection' && subtotal < 500) ? 150 : 0;
        const total = subtotal + collectionFee;
        
        if (!newBookingData.payment) newBookingData.payment = {};
        newBookingData.payment.total = total;

        const invoiceData = {
          id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          bookingId: bookingId,
          patientId: newBookingData.patientId || 'GENERAL',
          items: invoiceItems,
          subtotal,
          discount: 0,
          tax: 0,
          collectionFee,
          total,
          paymentStatus: newBookingData.payment?.status === 'Paid' ? 'Paid' : 'Pending',
          createdAt: new Date().toISOString()
        };

        const collectionData = {
          id: `COL-${bookingId.replace('bk_', '')}`,
          type: newBookingData.collection?.type || 'Home Collection',
          patientId: newBookingData.patientId,
          bookingId: bookingId,
          time: newBookingData.collection?.timeSlot || 'Flexible',
          date: newBookingData.collection?.date || new Date().toISOString().split('T')[0],
          patient: newBookingData.patient?.name || 'Unknown Patient',
          address: newBookingData.collection?.address,
          tests: (newBookingData.items || []).map(i => i.name),
          assignedTo: newBookingData.collection?.assignedPhlebotomist || 'Unassigned',
          status: newBookingData.collection?.type === 'Lab Visit' ? 'Pending' : 'Unassigned',
          createdAt: new Date().toISOString()
        };

        const result = await bookingRepo.createAggregate({
          booking: newBookingData,
          invoice: invoiceData,
          collectionTask: collectionData,
          idempotencyKey,
          ownerSub: identity.sub
        });
        
        if (newBookingData.patient) {
          const resolvedPatientId = invoiceData.patientId;
          if (resolvedPatientId && resolvedPatientId !== 'GENERAL') {
            try {
              const existingPatient = await patientRepo.getById(resolvedPatientId);
              if (!existingPatient) {
                await patientRepo.create({
                  id: resolvedPatientId,
                  name: newBookingData.patient.name || 'Unknown Patient',
                  phone: newBookingData.patient.phone,
                  email: newBookingData.patient.email,
                  age: newBookingData.patient.age || 0,
                  gender: newBookingData.patient.gender || 'Unknown'
                }, identity.sub);
              }
            } catch (patErr) {
              logger.warn(`Failed to auto-register patient ${resolvedPatientId}`, patErr);
            }
          }
        }
        
        return { ...result.booking, invoiceId: invoiceData.id };
      }

      case 'updateBookingStatus': {
        const { id, status } = args;
        const existingBooking = await bookingRepo.getById(id);
        if (!existingBooking) throw new Error('Booking not found');

        let patient = null;
        if (existingBooking.patientId) {
          patient = await patientRepo.getById(existingBooking.patientId);
        }

        const identityForCheck = identity;
        if (!(await canAccessBooking(identityForCheck, existingBooking, patient))) {
          throw new Error('Access denied: You are not authorized to modify this booking.');
        }

        if (!(await isAdmin(identityForCheck)) && !(await isStaff(identityForCheck))) {
          if (status !== 'Cancelled') {
            throw new Error('Patients are only permitted to cancel pending bookings.');
          }
        } else {
          if (!(await hasPermission(identityForCheck, 'orders', 'edit'))) {
            throw new Error('Access denied: Missing orders.edit permission');
          }
        }

        const updatedBooking = await bookingRepo.updateStatus(id, status);
        
        if (status === 'Completed' || status === 'Cancelled') {
           try {
             const pId = existingBooking.patientId;
             if (pId) {
               const collections = await collectionRepo.getByPatientId(pId);
               const matchingTask = collections.find(c => c.bookingId === id);
               if (matchingTask && matchingTask.status !== status) {
                 await collectionRepo.update(matchingTask.id, { status });
               }
             }
           } catch (syncErr) {
             logger.warn(`Failed to sync collection task for booking ${id}`, syncErr);
           }
        }

        return updatedBooking;
      }

      case 'updateBookingPaymentStatus': {
        const { id, status } = args;
        const existingBooking = await bookingRepo.getById(id);
        if (!existingBooking) throw new Error('Booking not found');

        let patient = null;
        if (existingBooking.patientId) {
          patient = await patientRepo.getById(existingBooking.patientId);
        }

        const identityForCheck = identity;
        if (!(await canAccessBooking(identityForCheck, existingBooking, patient))) {
          throw new Error('Access denied: You are not authorized to modify this booking.');
        }

        if (!(await isAdmin(identityForCheck)) && !(await isStaff(identityForCheck))) {
          throw new Error('Patients cannot directly alter booking payment status.');
        } else {
          if (!(await hasPermission(identityForCheck, 'orders', 'edit'))) {
            throw new Error('Access denied: Missing orders.edit permission');
          }
        }

        return await bookingRepo.updatePaymentStatus(id, status);
      }

      // ---------------------------------------------------------
      // NEW: Unified Collection Resolvers
      // ---------------------------------------------------------
      case 'collectionById': {
        const { id } = args;
        const collection = await collectionRepo.getById(id);
        if (!collection) return null;

        let patient = null;
        if (collection.patientId) {
          patient = await patientRepo.getById(collection.patientId);
        }

        const identityForCheck = identity;
        if (!(await canAccessCollection(identityForCheck, collection, patient))) {
          throw new Error('Access denied: You are not authorized to view this collection task.');
        }

        return collection;
      }

      case 'collectionsByPatient': {
        const { patientId } = args;
        const identityForCheck = identity;

        if (!(await isAdmin(identityForCheck)) && !(await isStaff(identityForCheck))) {
          const patient = await patientRepo.getById(patientId);
          if (patient && !(await canAccessPatient(identityForCheck, patient))) {
            throw new Error('Access denied: You are not authorized to view collections for this patient.');
          }
          if (!patient && patientId !== identity.primaryPatientId && patientId !== identity.sub) {
            throw new Error('Access denied: Unauthorized patient query.');
          }
        } else {
          if (!(await hasPermission(identityForCheck, 'collections', 'view'))) {
            throw new Error('Access denied: Missing collections.view permission');
          }
        }

        return await collectionRepo.getByPatientId(patientId);
      }

      case 'collections': {
        const identityForCheck = identity;
        
        if ((await isAdmin(identityForCheck)) || ((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
          if (!(await hasPermission(identityForCheck, 'collections', 'view'))) {
            throw new Error('Access denied: Missing collections.view permission');
          }
          const { limit = 20, cursor = null, search = '' } = args;
          const paginated = await collectionRepo.getPaginated({ limit, cursor, search });
          return paginated.data;
        } else if (await isPhlebotomist(identityForCheck)) {
          if (!(await hasPermission(identityForCheck, 'collections', 'view'))) {
            throw new Error('Access denied: Missing collections.view permission');
          }
          const [myTasks, unassignedTasks] = await Promise.all([
            collectionRepo.getByAssignee(identity.sub),
            collectionRepo.getByAssignee('UNASSIGNED')
          ]);
          
          return [...myTasks, ...unassignedTasks];
        } else {
          const ownedPatients = await patientRepo.getByOwner(identity.sub);
          const allPatientIds = new Set([identity.primaryPatientId || `pat_${identity.sub}`, identity.sub, ...ownedPatients.map((p) => p.id)]);

          const collectionLists = await Promise.all(
            Array.from(allPatientIds).map((pId) => collectionRepo.getByPatientId(pId))
          );
          return collectionLists.flat();
        }
      }

      case 'createCollection': {
        const { input } = args;
        const identityForCheck = identity;

        if (!(await isAdmin(identityForCheck)) && !(await isStaff(identityForCheck))) {
          if (input.patientId) {
            const patient = await patientRepo.getById(input.patientId);
            if (patient && !(await canAccessPatient(identityForCheck, patient))) {
              throw new Error('Access denied: You cannot create a collection for this patient.');
            }
            if (!patient && input.patientId !== identity.primaryPatientId && input.patientId !== identity.sub) {
              throw new Error('Access denied: Unauthorized patient ID.');
            }
          }
        } else {
          if (!(await hasPermission(identityForCheck, 'collections', 'create'))) {
            throw new Error('Access denied: Missing collections.create permission');
          }
        }

        const collectionId = input.id || `COL-${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const initialStatus = (!(await isAdmin(identityForCheck)) && !(await isStaff(identityForCheck)))
          ? (input.type === 'Lab Visit' ? 'Pending' : 'Unassigned')
          : (input.status || (input.type === 'Lab Visit' ? 'Pending' : 'Unassigned'));

        const taskData = {
          ...input,
          id: collectionId,
          ownerSub: identity.sub,
          patientId: input.patientId || identity.primaryPatientId || `pat_${identity.sub}`,
          status: initialStatus,
          assignedTo: (!(await isAdmin(identityForCheck)) && !(await isStaff(identityForCheck))) ? 'Unassigned' : (input.assignedTo || 'Unassigned'),
          phlebotomistId: (!(await isAdmin(identityForCheck)) && !(await isStaff(identityForCheck))) ? undefined : input.phlebotomistId,
        };

        return await collectionRepo.create(taskData, identity.sub);
      }

      case 'updateCollection': {
        const { id, input } = args;
        const existingCollection = await collectionRepo.getById(id);
        if (!existingCollection) throw new Error('Collection task not found');

        let patient = null;
        if (existingCollection.patientId) {
          patient = await patientRepo.getById(existingCollection.patientId);
        }

        const identityForCheck = identity;
        if (!(await canAccessCollection(identityForCheck, existingCollection, patient))) {
          throw new Error('Access denied: You are not authorized to modify this collection task.');
        }

        if (!(await canModifyCollection(identityForCheck, existingCollection, input))) {
          throw new Error('Access denied: You do not have permission to modify these collection fields.');
        }

        if (await isStaff(identityForCheck)) {
          if (input.assignedTo !== undefined || input.phlebotomistId !== undefined) {
             if (!(await hasPermission(identityForCheck, 'collections', 'assign'))) {
               throw new Error('Access denied: Missing collections.assign permission');
             }
          }
          const editKeys = Object.keys(input).filter(k => k !== 'assignedTo' && k !== 'phlebotomistId');
          if (editKeys.length > 0) {
            if (!(await hasPermission(identityForCheck, 'collections', 'edit'))) {
               throw new Error('Access denied: Missing collections.edit permission');
            }
          }
        }

        if (input.status && input.status !== existingCollection.status) {
          if (!isValidCollectionTransition(existingCollection.status, input.status)) {
            throw new Error(`Invalid status transition from '${existingCollection.status}' to '${input.status}'.`);
          }
        }

        const updatedCollection = await collectionRepo.update(id, input);

        if (input.status && input.status !== existingCollection.status && existingCollection.bookingId) {
          const bookingId = existingCollection.bookingId;
          const statusMap = {
            'Assigned': 'Assigned',
            'Sample Collected': 'Sample Collected',
            'Completed': 'Completed'
          };
          
          if (statusMap[input.status]) {
            try {
              await bookingRepo.updateStatus(bookingId, statusMap[input.status]);
            } catch (syncErr) {
              logger.warn(`Failed to sync booking ${bookingId} status to ${statusMap[input.status]}`, syncErr);
            }
          }

          if (input.status === 'Sample Collected') {
            try {
              const existingReports = await reportRepo.getByPatientId(existingCollection.patientId);
              const alreadyExists = existingReports.some(r => r.bookingId === bookingId);
              
              if (!alreadyExists) {
                await reportRepo.create({
                  id: `REP-${bookingId.replace('bk_', '')}`,
                  patientId: existingCollection.patientId,
                  bookingId: bookingId,
                  patient: patient ? {
                    name: patient.name || 'Unknown',
                    age: patient.age || 0,
                    gender: patient.gender || 'Unknown',
                    id: patient.id || existingCollection.patientId
                  } : {
                    name: typeof existingCollection.patient === 'string' ? existingCollection.patient : existingCollection.patient?.name || 'Unknown',
                    age: 0,
                    gender: 'Unknown',
                    id: existingCollection.patientId
                  },
                  tests: existingCollection.tests || [],
                  testType: (existingCollection.tests || []).join(', '),
                  status: 'Processing',
                  priority: 'Routine',
                  generatedAt: new Date().toISOString()
                });
              }
            } catch (repErr) {
              logger.warn(`Failed to generate report task for booking ${bookingId}`, repErr);
            }
          }
        }

        const newPhlebId = input.phlebotomistId || input.assignedTo;
        const oldPhlebId = existingCollection.phlebotomistId || existingCollection.assignedTo;
        if (newPhlebId && newPhlebId !== 'Unassigned' && newPhlebId !== oldPhlebId) {
          try {
            const notificationRepo = require('../repositories/dynamo-notification');
            await notificationRepo.create({
              userId: newPhlebId,
              title: 'New Home Collection Assignment',
              message: `You have been assigned a Home Collection for task ${id}.`,
              link: `/admin/collections`,
              isRead: false,
              createdBy: identity.sub,
            });
          } catch (notifErr) {
            logger.warn('Failed to dispatch assignment notification', notifErr);
          }
        }

        return updatedCollection;
      }

      // ---------------------------------------------------------
      // NEW: Unified Report Resolvers
      // ---------------------------------------------------------
      case 'reportById': {
        const { id } = args;
        const report = await reportRepo.getById(id);
        if (!report) return null;

        const identityForCheck = identity;
        const canViewAsStaff = await hasPermission(identityForCheck, 'reports', 'view');
        
        if (!canViewAsStaff) {
          let ownsReport = false;
          if (report.patientId === identity.sub || report.patientId === identity.primaryPatientId) {
            ownsReport = true;
          } else if (identity.primaryPatientId) {
            const primaryPatient = await patientRepo.getById(identity.primaryPatientId);
            if (primaryPatient && Array.isArray(primaryPatient.savedPatients)) {
              ownsReport = primaryPatient.savedPatients.some(p => p.id === report.patientId);
            }
          }
          if (!ownsReport) throw new Error('Access denied: You are not authorized to view this report.');
        }

        return report;
      }

      case 'reports': {
        const { limit = 100 } = args;
        const identityForCheck = identity;
        const canViewAsStaff = await hasPermission(identityForCheck, 'reports', 'view');

        if (canViewAsStaff) {
          const { limit = 20, cursor = null, search = '', status = 'All', sort = 'date_newest' } = args;
          const paginated = await reportRepo.getPaginated({ limit, cursor, search, status, sort });
          return paginated.data;
        } else {
          const allPatientIds = new Set([identity.primaryPatientId || `pat_${identity.sub}`, identity.sub]);
          
          if (identity.primaryPatientId) {
            const primaryPatient = await patientRepo.getById(identity.primaryPatientId);
            if (primaryPatient && Array.isArray(primaryPatient.savedPatients)) {
              primaryPatient.savedPatients.forEach(p => {
                if (p.id) allPatientIds.add(p.id);
              });
            }
          }

          const reportLists = await Promise.all(
            Array.from(allPatientIds).map((pId) => reportRepo.getByPatientId(pId))
          );
          
          let flattened = reportLists.filter(Boolean).flat();
          return flattened;
        }
      }

      case 'reportsByPatient': {
        const { patientId } = args;
        const identityForCheck = identity;
        const canViewAsStaff = await hasPermission(identityForCheck, 'reports', 'view');

        if (canViewAsStaff) {
          return await reportRepo.getByPatientId(patientId);
        } else {
          let ownsPatient = false;
          if (patientId === identity.sub || patientId === identity.primaryPatientId) {
            ownsPatient = true;
          } else if (identity.primaryPatientId) {
            const primaryPatient = await patientRepo.getById(identity.primaryPatientId);
            if (primaryPatient && Array.isArray(primaryPatient.savedPatients)) {
              ownsPatient = primaryPatient.savedPatients.some(p => p.id === patientId);
            }
          }
          if (!ownsPatient) throw new Error('Access denied: You are not authorized to view reports for this patient.');
          return await reportRepo.getByPatientId(patientId);
        }
      }

      case 'createReportTask': {
        const { input } = args;
        const identityForCheck = identity;
        const canCreate = await hasPermission(identityForCheck, 'reports', 'create');
        if (!canCreate) {
          throw new Error('Access denied: Missing reports.create permission');
        }

        const reportId = input.id || `REP-${Date.now()}`;
        const newReportData = {
          ...input,
          id: reportId,
          status: input.status || 'Processing',
          priority: input.priority || 'Routine',
          results: input.results || [],
        };

        return await reportRepo.create(newReportData);
      }

      case 'updateReportStatus': {
        const { id, status } = args;
        const identityForCheck = identity;
        const canEdit = await hasPermission(identityForCheck, 'reports', 'edit');
        if (!canEdit) {
          throw new Error('Access denied: Missing reports.edit permission');
        }

        const existingReport = await reportRepo.getById(id);
        if (!existingReport) throw new Error('Report not found');

        const validStatuses = ['Processing', 'Generated', 'Awaiting Verification', 'Pending Upload', 'Published'];
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        await reportRepo.updateStatus(id, status);

        // Side effect: publish â†’ mark booking + collection as Completed
        if (status === 'Published') {
          const updatedReport = await reportRepo.getById(id);
          if (updatedReport && updatedReport.bookingId) {
            try {
              await bookingRepo.updateStatus(updatedReport.bookingId, 'Completed');
              if (updatedReport.patientId) {
                const collections = await collectionRepo.getByPatientId(updatedReport.patientId);
                const matchingTask = collections.find(c => c.bookingId === updatedReport.bookingId);
                if (matchingTask && matchingTask.status !== 'Completed') {
                  await collectionRepo.update(matchingTask.id, { status: 'Completed' });
                }
              }
            } catch (syncErr) {
              logger.warn(`Failed to sync booking/collection for published report ${id}`, syncErr);
            }
          }
        }

        return true; // Schema: updateReportStatus returns Boolean!
      }

      // ---------------------------------------------------------
      // NEW: Unified Invoice Resolvers
      // ---------------------------------------------------------
      case 'invoiceById': {
        const { id } = args;
        const invoice = await invoiceRepo.getById(id);
        if (!invoice) return null;

        let patient = null;
        if (invoice.patientId) {
          patient = await patientRepo.getById(invoice.patientId);
        }

        const identityForCheck = identity;
        if (!(await canAccessInvoice(identityForCheck, invoice, patient))) {
          throw new Error('Access denied: You are not authorized to view this invoice.');
        }

        return invoice;
      }

      case 'invoices': {
        const { limit = 20, cursor = null, status = 'All', search = '' } = args;
        const identityForCheck = identity;
        
        if ((await isAdmin(identityForCheck)) || ((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
          if (!(await hasPermission(identityForCheck, 'invoices', 'view'))) {
            throw new Error('Access denied: Missing invoices.view permission');
          }
          return await invoiceRepo.getPaginated({ limit, cursor, status, search });
        } else if (await isPhlebotomist(identityForCheck)) {
          if (!(await hasPermission(identityForCheck, 'invoices', 'view'))) {
            throw new Error('Access denied: Missing invoices.view permission');
          }
          return { data: [], nextCursor: null };
        } else {
          // Patient flow
          const ownedPatients = await patientRepo.getByOwner(identity.sub);
          const allPatientIds = new Set([
            identity.primaryPatientId,
            identity.sub,
            `pat_${identity.sub}`,
            ...ownedPatients.map((p) => p.id),
          ]);

          const invoiceLists = await Promise.all(
            Array.from(allPatientIds).map((pId) => invoiceRepo.getByPatientId(pId))
          );
          const flattened = invoiceLists.flat();
          const seen = new Set();
          const unique = [];
          for (const inv of flattened) {
            if (inv && inv.id && !seen.has(inv.id)) {
              seen.add(inv.id);
              unique.push(inv);
            }
          }
          unique.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          return { data: unique, nextCursor: null };
        }
      }

      case 'invoicesByPatient': {
        const { patientId } = args;
        const identityForCheck = identity;
        
        if (!(await isAdmin(identityForCheck)) && !((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
          const patient = await patientRepo.getById(patientId);
          if (patient && !(await canAccessPatient(identityForCheck, patient))) {
            throw new Error('Access denied: You are not authorized to view invoices for this patient.');
          }
          if (!patient && patientId !== identity.primaryPatientId && patientId !== identity.sub) {
            throw new Error('Access denied: Unauthorized patient query.');
          }
        } else {
          if (!(await hasPermission(identityForCheck, 'invoices', 'view'))) {
            throw new Error('Access denied: Missing invoices.view permission');
          }
        }

        return await invoiceRepo.getByPatientId(patientId);
      }

      case 'createInvoice': {
        const { input } = args;
        const identityForCheck = identity;
        
        if (!(await isAdmin(identityForCheck)) && !((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
          if (input.patientId) {
            const patient = await patientRepo.getById(input.patientId);
            if (patient && !(await canAccessPatient(identityForCheck, patient))) {
              throw new Error('Access denied: Cannot create invoice for unauthorized patient.');
            }
          }
        } else {
          if (!(await hasPermission(identityForCheck, 'invoices', 'create'))) {
            throw new Error('Access denied: Missing invoices.create permission');
          }
        }

        const items = Array.isArray(input.items) ? input.items : [];
        const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const discount = Math.max(0, Number(input.discount) || 0);
        const tax = Math.round(subtotal * 0.05);
        const total = Math.max(0, subtotal - discount + tax);

        const newId = input.id || `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const invoiceData = {
          ...input,
          id: newId,
          subtotal,
          discount,
          tax,
          total,
          items,
          ownerSub: identity.sub,
          patientId: input.patientId || identity.primaryPatientId,
          paymentStatus: input.paymentStatus === 'Paid' && ((await isAdmin(identityForCheck)) || (await isStaff(identityForCheck))) ? 'Paid' : 'Pending',
          createdAt: input.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return await invoiceRepo.create(invoiceData);
      }

      case 'updateInvoiceStatus': {
        const { id, status } = args;
        const identityForCheck = identity;
        
        const existingInvoice = await invoiceRepo.getById(id);
        if (!existingInvoice) throw new Error('Invoice not found');

        if (!(await isAdmin(identityForCheck)) && !((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
          throw new Error('Access denied: Only authorized staff or payment recording can update invoice payment status.');
        } else {
          if (!(await hasPermission(identityForCheck, 'invoices', 'edit'))) {
            throw new Error('Access denied: Missing invoices.edit permission');
          }
        }

        if (!isValidInvoiceTransition(existingInvoice.paymentStatus, status)) {
          throw new Error(`Invalid payment status transition from ${existingInvoice.paymentStatus} to ${status}`);
        }

        const statusUpdates = {
          paymentStatus: status,
          paymentMethod: existingInvoice.paymentMethod || 'Online',
          receivedBy: identity.sub,
        };

        if (status === 'Paid') {
          statusUpdates.paidAt = new Date().toISOString();
        }

        await invoiceRepo.update(id, statusUpdates);
        return true; // Schema: updateInvoiceStatus returns Boolean!
      }

      case 'updateInvoicePaymentMethod': {
        // Schema: updateInvoicePaymentMethod(id: ID!, method: String!): Boolean!
        const { id, method: paymentMethod } = args;  // schema arg is 'method', not 'paymentMethod'
        const identityForCheck = identity;
        
        const existingInvoice = await invoiceRepo.getById(id);
        if (!existingInvoice) throw new Error('Invoice not found');
        
        const allowedMethods = ['UPI', 'Card', 'Online', 'Cash'];
        if (!allowedMethods.includes(paymentMethod)) {
          throw new Error(`Invalid paymentMethod. Allowed: ${allowedMethods.join(', ')}`);
        }
        if (existingInvoice.paymentStatus === 'Paid') {
          throw new Error('Cannot change payment method after invoice is paid');
        }
        
        if (
          !(await isAdmin(identityForCheck)) && 
          !(await isStaff(identityForCheck)) && 
          existingInvoice.ownerSub !== identity.sub && 
          existingInvoice.patientId !== identity.primaryPatientId &&
          existingInvoice.patientId !== identity.sub &&
          existingInvoice.patientId !== `pat_${identity.sub}`
        ) {
          throw new Error('Access denied: You do not have permission to modify this invoice.');
        }

        await invoiceRepo.update(id, { paymentMethod });
        return true; // Schema returns Boolean!
      }

      case 'updateInvoice': {
        const { id, input } = args;
        const identityForCheck = identity;
        
        const existingInvoice = await invoiceRepo.getById(id);
        if (!existingInvoice) throw new Error('Invoice not found');

        if (!(await canModifyInvoice(identityForCheck, existingInvoice, input))) {
          throw new Error('Access denied: You do not have permission to modify this invoice.');
        }

        return await invoiceRepo.update(id, input);
      }

      // ---------------------------------------------------------
      // NEW: Unified Document Resolvers
      // ---------------------------------------------------------
      case 'initiateDocumentUpload': {
        const { input } = args;
        const { entityType, entityId, patientId, bookingId, fileName, contentType, fileSize } = input;
        const identityForCheck = identity;

        if (!entityType || !entityId || !patientId || !fileName || !contentType || !fileSize) {
          throw new Error('Missing required fields');
        }

        if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
          throw new Error(`Unsupported content type: ${contentType}`);
        }

        if (fileSize > MAX_FILE_SIZE_BYTES) {
          throw new Error(`File size exceeds maximum allowed 10MB`);
        }

        let patient = null;
        try { patient = await patientRepo.getById(patientId); } catch (e) {}
        
        if (!(await canUploadDocument(identityForCheck, patientId, patient))) {
          throw new Error('Access denied: You are not authorized to upload documents for this patient.');
        }

        const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const extension = getExtension(contentType);
        const fileKey = `documents/${patientId}/${entityType}/${entityId}/${documentId}.${extension}`;

        const metadata = {
          documentId,
          entityType,
          entityId,
          patientId,
          bookingId: bookingId || null,
          fileKey,
          fileName,
          contentType,
          fileSize,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          createdBy: identity.sub || 'SYSTEM',
        };

        await documentRepo.createMetadata(metadata, identity.sub);
        const uploadUrl = await storageRepo.getPresignedUploadUrl(fileKey, contentType);
        return { documentId, uploadUrl, fileKey };
      }

      case 'completeDocumentUpload': {
        const { id } = args;
        const identityForCheck = identity;

        const doc = await documentRepo.getById(id);
        if (!doc) throw new Error('Document not found');

        let patient = null;
        if (doc.patientId) {
          try { patient = await patientRepo.getById(doc.patientId); } catch (e) {}
        }

        if (!(await canModifyDocument(identityForCheck, doc, patient))) {
          throw new Error('Access denied: You do not have permission to modify this document.');
        }

        if (doc.status !== 'PENDING') {
          throw new Error(`Document is not in PENDING state`);
        }

        return await documentRepo.updateStatus(id, 'UPLOADED');
      }

      case 'documentDownloadUrl': {
        const { id } = args;
        const identityForCheck = identity;

        const doc = await documentRepo.getById(id);
        if (!doc) throw new Error('Document not found');

        let patient = null;
        if (doc.patientId) {
          try { patient = await patientRepo.getById(doc.patientId); } catch (e) {}
        }

        if (!(await canAccessDocument(identityForCheck, doc, patient))) {
          throw new Error('Access denied: You do not have permission to download this document.');
        }

        if (doc.status !== 'UPLOADED') {
          throw new Error('Document is not available for download');
        }

        // Schema declares documentDownloadUrl as String! â€” return URL only
        const downloadUrl = await storageRepo.getPresignedDownloadUrl(doc.fileKey);
        return downloadUrl;
      }

      case 'documentById': {
        const { id } = args;
        const identityForCheck = identity;

        const doc = await documentRepo.getById(id);
        if (!doc) return null;

        let patient = null;
        if (doc.patientId) {
          try { patient = await patientRepo.getById(doc.patientId); } catch (e) {}
        }

        if (!(await canAccessDocument(identityForCheck, doc, patient))) {
          throw new Error('Access denied: You do not have permission to view this document.');
        }

        return doc;
      }

      case 'documents': {
        const { patientId, entityType, entityId } = args;
        const identityForCheck = identity;

        if (patientId) {
          let patient = null;
          try { patient = await patientRepo.getById(patientId); } catch (e) {}

          if (!(await isAdmin(identityForCheck)) && !((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
            if (!(await canAccessPatient(identityForCheck, patient)) && patientId !== identity.sub && patientId !== identity.primaryPatientId) {
              throw new Error('Access denied: Unauthorized patient document query.');
            }
          } else {
            if (!(await hasPermission(identityForCheck, 'reports', 'view'))) {
              throw new Error('Access denied: Missing reports.view permission');
            }
          }

          return await documentRepo.getByPatientId(patientId);
        }

        if (entityType && entityId) {
          const documents = await documentRepo.getByEntity(entityType, entityId);
          if (!(await isAdmin(identityForCheck)) && !((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
            let familyPatients = [];
            try { familyPatients = await patientRepo.getByOwner(identity.sub); } catch (e) {}
            const allowedPatientIds = new Set([
              identity.sub,
              identity.primaryPatientId,
              `pat_${identity.sub}`,
              ...familyPatients.map((p) => p.id),
            ]);

            return documents.filter((d) => allowedPatientIds.has(d.patientId) || d.ownerSub === identity.sub);
          } else {
            if (!(await hasPermission(identityForCheck, 'reports', 'view'))) {
              throw new Error('Access denied: Missing reports.view permission');
            }
            return documents;
          }
        }

        if (!(await isAdmin(identityForCheck)) && !((await isStaff(identityForCheck)) && !(await isPhlebotomist(identityForCheck)))) {
          let familyPatients = [];
          try { familyPatients = await patientRepo.getByOwner(identity.sub); } catch (e) {}
          const patientIds = Array.from(new Set([
            identity.sub,
            identity.primaryPatientId,
            `pat_${identity.sub}`,
            ...familyPatients.map((p) => p.id),
          ]));

          let allDocs = [];
          for (const pid of patientIds) {
            try {
              const docs = await documentRepo.getByPatientId(pid);
              if (docs && docs.length > 0) allDocs = allDocs.concat(docs);
            } catch (e) {}
          }

          const uniqueDocsMap = new Map();
          for (const d of allDocs) { uniqueDocsMap.set(d.documentId, d); }
          return Array.from(uniqueDocsMap.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        } else {
          if (!(await hasPermission(identityForCheck, 'reports', 'view'))) {
            throw new Error('Access denied: Missing reports.view permission');
          }
          return [];
        }
      }

      // ---------------------------------------------------------
      // NEW: Unified Blog Resolvers
      // ---------------------------------------------------------
      case 'newsletterSubscribe': {
        const { email } = args;
        if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) {
          throw new Error('Valid email is required');
        }

        const result = await newsletterRepo.subscribe(email);
        
        if (result.isNew) {
          try {
            const allStaff = await staffRepo.getAllStaff();
            const admins = allStaff.filter(s => s.role === 'admin' || s.role === 'superadmin');
            
            const notificationRepo = require('../repositories/dynamo-notification');
            const promises = admins.map(admin => 
              notificationRepo.create({
                userId: admin.id,
                title: 'New Newsletter Subscriber',
                message: `${result.subscriber.email} has subscribed to the newsletter.`,
                type: 'success',
                link: '/admin/newsletter',
                isRead: false,
                createdBy: identity?.sub || 'system'
              }).catch(err => logger.error(`Failed to create newsletter notification for ${admin.id}`, err))
            );
            await Promise.all(promises);
          } catch (error) {
            logger.error('Failed to dispatch admin newsletter notifications', error);
          }
        }

        // Schema declares newsletterSubscribe as Boolean! â€” return true on success
        return true;
      }

      case 'newsletterSubscribers': {
        const { limit = 50, cursor = null } = args;
        const identityForCheck = identity;
        if (!identity) throw new Error('Unauthorized');
        
        if (!(await hasPermission(identityForCheck, 'newsletter', 'view')) && !(await hasPermission(identityForCheck, 'blogs', 'view'))) {
          throw new Error('Forbidden: Missing newsletter.view or blogs.view permission');
        }
        
        const paginated = await newsletterRepo.getPaginated({ limit, cursor });
        
        return {
          data: paginated.data,
          meta: {
            total: paginated.totalCount ?? paginated.data.length,
            page: 1,
            limit,
            totalPages: Math.ceil((paginated.totalCount ?? paginated.data.length) / limit) || 1
          }
        };
      }

      case 'blogs': {
        const { status } = args;
        const identityForCheck = identity;
        
        const canManageBlogs = await hasPermission(identityForCheck, 'blogs', 'view');
        if (!canManageBlogs) {
          const publishedArticles = await blogRepo.getPublicPublished();
          return publishedArticles.map(sanitizePublicBlog);
        }

        if (status) {
          return await blogRepo.getByStatus(status);
        }

        return await blogRepo.getAll();
      }

      case 'blogById': {
        const { idOrSlug } = args;
        const identityForCheck = identity;

        let article = await blogRepo.getBySlug(idOrSlug);
        if (!article) {
          article = await blogRepo.getById(idOrSlug);
        }

        if (!article) throw new Error('Article not found');

        if (!(await canAccessBlog(identityForCheck, article))) {
          throw new Error('Article not found or access denied');
        }

        const canManageBlogs = await hasPermission(identityForCheck, 'blogs', 'view');
        if (!canManageBlogs) {
          return sanitizePublicBlog(article);
        }

        return article;
      }

      case 'createBlog': {
        const { input } = args;
        const identityForCheck = identity;

        if (!identity) throw new Error('Unauthorized');
        if (!(await hasPermission(identityForCheck, 'blogs', 'create'))) {
          throw new Error('Forbidden: Missing blogs.create permission');
        }

        const blogInput = typeof input === 'string' ? JSON.parse(input) : (input || {});

        if (!blogInput.title || typeof blogInput.title !== 'string' || blogInput.title.trim().length === 0) {
          throw new Error('Article title is required');
        }

        const {
          id: _id,
          PK: _pk,
          SK: _sk,
          GSI1PK: _g1pk,
          GSI1SK: _g1sk,
          GSI2PK: _g2pk,
          GSI2SK: _g2sk,
          createdAt: _ca,
          updatedAt: _ua,
          publishedAt: _pa,
          createdBy: _cb,
          ownerSub: _os,
          ...allowedFields
        } = blogInput;

        return await blogRepo.create({
          ...allowedFields,
          createdBy: identity.sub,
          ownerSub: identity.sub,
          author: allowedFields.author || identity.username || 'Admin User',
          authorId: identity.sub,
        });
      }

      case 'updateBlog': {
        const { id, input } = args;
        const identityForCheck = identity;

        if (!identity) throw new Error('Unauthorized');
        if (!(await hasPermission(identityForCheck, 'blogs', 'edit'))) {
          throw new Error('Forbidden: Missing blogs.edit permission');
        }

        let existing = await blogRepo.getById(id);
        if (!existing) existing = await blogRepo.getBySlug(id);
        if (!existing) throw new Error('Article not found');

        const blogUpdates = typeof input === 'string' ? JSON.parse(input) : (input || {});

        const {
          id: _id,
          PK: _pk,
          SK: _sk,
          GSI1PK: _g1pk,
          GSI1SK: _g1sk,
          GSI2PK: _g2pk,
          GSI2SK: _g2sk,
          createdAt: _ca,
          createdBy: _cb,
          ownerSub: _os,
          ...updates
        } = blogUpdates;

        updates.updatedBy = identity.sub;
        return await blogRepo.update(existing.id, updates);
      }

      case 'deleteBlog': {
        const { id } = args;
        const identityForCheck = identity;

        if (!identity) throw new Error('Unauthorized');
        if (!(await hasPermission(identityForCheck, 'blogs', 'del'))) {
          throw new Error('Forbidden: Missing blogs.del permission');
        }

        let existing = await blogRepo.getById(id);
        if (!existing) existing = await blogRepo.getBySlug(id);
        if (!existing) throw new Error('Article not found');

        await blogRepo.delete(existing.id);
        return true;
      }
      default:
        throw new Error(`Unsupported field: ${fieldName}`);
    }
  } catch (error) {
    logger.error(`GraphQL resolution failed for ${fieldName}`, error);
    // Do not leak internal stack traces
    throw new Error(error.message || 'Internal Server Error');
  }
};

