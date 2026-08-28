const { extractIdentity, isAdmin, isStaff, canAccessReview, canCreateReview, canModerateReview, hasPermission } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const reviewRepo = require('../repositories/dynamo-review');
const bookingRepo = require('../repositories/dynamo-booking');
const notificationRepo = require('../repositories/dynamo-notification');
const staffRepo = require('../repositories/dynamo-staff');

function sanitizePublicReview(review) {
  if (!review) return null;
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    displayName: review.displayName || 'Verified Patient',
    verified: !!review.verified,
    createdAt: review.createdAt,
  };
}

exports.handler = async (event) => {
  logger.info('Incoming review request', {
    httpMethod: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters,
  });

  const method = event.httpMethod;
  const path = event.path || '';
  const identity = extractIdentity(event);

  try {
    // ----------------------------------------------------
    // GET /api/reviews or GET /api/reviews/{id}
    // ----------------------------------------------------
    if (method === 'GET') {
      const pathParts = path.split('/').filter(Boolean);
      const isCollectionPath = pathParts.length === 2 && pathParts[0] === 'api' && pathParts[1] === 'reviews';
      const isPublicPath = pathParts.length === 3 && pathParts[0] === 'api' && pathParts[1] === 'reviews' && pathParts[2] === 'public';

      // 0. GET /api/reviews/public
      if (isPublicPath) {
        const approved = await reviewRepo.getPublicApproved();
        return success(approved.map(sanitizePublicReview));
      }

      // 1. GET /api/reviews
      if (isCollectionPath) {
        const queryParams = event.queryStringParameters || {};
        const requestedStatus = queryParams.status;
        const requestedPatientId = queryParams.patientId;
        const requestedBookingId = queryParams.bookingId;

        // API requires authentication
        if (!identity) {
          return error.unauthorized('Authentication required to view reviews');
        }

        // Admin & Staff can query all, by status, or by patient
        const canManageReviews = await hasPermission(identity, 'reviews', 'view');
        if (canManageReviews) {
          if (requestedBookingId) {
            const review = await reviewRepo.getByBookingId(requestedBookingId);
            return success(review);
          }
          if (requestedPatientId) {
            const patientReviews = await reviewRepo.getByPatientId(requestedPatientId);
            return success(patientReviews);
          }
          if (requestedStatus) {
            const statusReviews = await reviewRepo.getByStatus(requestedStatus);
            return success(statusReviews);
          }
          const allReviews = await reviewRepo.getAll();
          return success(allReviews);
        }

        // Patient caller
        if (requestedBookingId) {
          const review = await reviewRepo.getByBookingId(requestedBookingId);
          if (!review) return success(null);
          if (!(await canAccessReview(identity, review))) {
            return error.forbidden('Access denied to this review');
          }
          return success(review);
        }

        if (requestedStatus === 'Approved') {
          const approved = await reviewRepo.getPublicApproved();
          return success(approved.map(sanitizePublicReview));
        }

        // Return caller's own reviews
        const targetPatientId = requestedPatientId || identity.primaryPatientId || identity.sub;
        if (
          targetPatientId !== identity.sub &&
          targetPatientId !== identity.primaryPatientId &&
          targetPatientId !== `pat_${identity.sub}`
        ) {
          return error.forbidden('You are not authorized to view reviews for other patients');
        }

        const myReviews = await reviewRepo.getByPatientId(targetPatientId);
        return success(myReviews);
      }

      // 2. GET /api/reviews/{id}
      const reviewId = pathParts[2];
      if (!reviewId) {
        return error.badRequest('Review ID is required');
      }

      const review = await reviewRepo.getById(reviewId);
      if (!review) {
        return error.notFound('Review not found');
      }

      if (!(await canAccessReview(identity, review))) {
        return error.forbidden('Access denied to this review');
      }

      // If approved and unauthenticated or regular user without review view permission, sanitize
      const canViewFull = identity && (review.ownerSub === identity.sub || await hasPermission(identity, 'reviews', 'view'));
      if (review.status === 'Approved' && !canViewFull) {
        return success(sanitizePublicReview(review));
      }

      return success(review);
    }

    // ----------------------------------------------------
    // POST /api/reviews
    // ----------------------------------------------------
    if (method === 'POST') {
      if (!identity) {
        return error.unauthorized('Authentication required to submit a review');
      }

      let body = {};
      try {
        body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      } catch (parseErr) {
        return error.badRequest('Invalid JSON payload');
      }

      const bookingId = body.bookingId;
      if (!bookingId) {
        return error.badRequest('bookingId is required to submit a review');
      }

      // 1. Fetch booking to verify existence, status, and ownership
      const booking = await bookingRepo.getById(bookingId);
      if (!booking) {
        return error.notFound('Associated booking not found');
      }

      // 2. Verify eligibility
      if (booking.status !== 'Completed') {
        return error.badRequest('Reviews can only be submitted for completed services.');
      }

      if (!(await canCreateReview(identity, body, booking))) {
        return error.forbidden('You are not authorized to review this booking.');
      }

      // 3. Validate rating
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return error.badRequest('Rating must be an integer between 1 and 5.');
      }

      // 4. Validate comment
      const comment = (body.comment || '').trim();
      if (comment.length < 10 || comment.length > 2000) {
        return error.badRequest('Comment must be between 10 and 2000 characters.');
      }

      // 5. Sanitize display name
      const displayName = (typeof body.displayName === 'string' && body.displayName.trim().length > 0)
        ? body.displayName.trim()
        : (identity.fullName || 'Verified Patient');

      // 6. Build server-authoritative review object
      const reviewPayload = {
        patientId: booking.patientId || identity.primaryPatientId || `pat_${identity.sub}`,
        bookingId: booking.id,
        rating,
        comment,
        displayName,
        status: 'Pending',
        verified: true,
        ownerSub: identity.sub,
        createdBy: identity.sub,
      };

      try {
        const createdReview = await reviewRepo.create(reviewPayload);

        // Notify Admins
        try {
          const allStaff = await staffRepo.getAllStaff();
          const admins = allStaff.filter(s => s.role === 'admin' || s.role === 'superadmin');
          
          for (const admin of admins) {
            await notificationRepo.create({
              userId: admin.id,
              title: 'New Patient Review',
              message: `A new ${rating}-star review for booking ${booking.id} requires moderation.`,
              type: 'system',
              link: '/admin/reviews',
            });
          }
        } catch (notifErr) {
          logger.error('Failed to send review notifications to admins', { error: notifErr.message });
        }

        return success(createdReview, 201);
      } catch (createErr) {
        if (createErr.code === 'DUPLICATE_REVIEW' || createErr.statusCode === 409) {
          return error(409, 'DUPLICATE_REVIEW', createErr.message);
        }
        throw createErr;
      }
    }

    // ----------------------------------------------------
    // PUT /api/reviews/{id}/status (Moderation)
    // ----------------------------------------------------
    if (method === 'PUT') {
      if (!identity) {
        return error.unauthorized('Authentication required for review moderation');
      }

      if (!(await hasPermission(identity, 'reviews', 'edit'))) {
        return error.forbidden('Access denied: Missing reviews.edit permission to moderate reviews');
      }

      const pathParts = path.split('/').filter(Boolean);
      const reviewId = pathParts[2];
      if (!reviewId) {
        return error.badRequest('Review ID is required');
      }

      let body = {};
      try {
        body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
      } catch (parseErr) {
        return error.badRequest('Invalid JSON payload');
      }

      const newStatus = body.status;
      if (!['Approved', 'Rejected'].includes(newStatus)) {
        return error.badRequest('Status must be Approved or Rejected.');
      }

      const updated = await reviewRepo.updateStatus(reviewId, newStatus);
      return success(updated);
    }

    return error.badRequest(`Unsupported HTTP method: ${method}`);
  } catch (err) {
    logger.error('Review handler error', { error: err.message, stack: err.stack });
    if (err.statusCode) {
      return error(err.statusCode, err.code || 'ERROR', err.message);
    }
    return error.serverError(err.message || 'Internal server error');
  }
};
