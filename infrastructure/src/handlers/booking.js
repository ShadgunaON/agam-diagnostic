const { extractIdentity, isAdmin, isStaff, canAccessPatient, canAccessBooking } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const bookingRepo = require('../repositories/dynamo-booking');
const patientRepo = require('../repositories/dynamo-patient');

exports.handler = async (event) => {
  logger.info(`Incoming booking request: ${event.httpMethod} ${event.path}`);

  try {
    const identity = extractIdentity(event);
    if (!identity) {
      return error.unauthorized('Missing or invalid authentication token');
    }

    const pathParameters = event.pathParameters || {};
    const proxyPath = pathParameters.proxy || '';
    const rawBookingId = pathParameters.bookingId || proxyPath.split('/').filter(Boolean)[0];
    const queryStringParameters = event.queryStringParameters || {};
    const patientId = queryStringParameters.patientId;

    switch (event.httpMethod) {
      case 'GET': {
        // Handle /api/bookings/{bookingId}
        if (rawBookingId) {
          const booking = await bookingRepo.getById(rawBookingId);
          if (!booking) return error.notFound('Booking not found');

          let patient = null;
          if (booking.patientId) {
            patient = await patientRepo.getById(booking.patientId);
          }

          if (!canAccessBooking(identity, booking, patient)) {
            // Verify if phlebotomist is assigned to a collection for this booking
            let hasPhlebAccess = false;
            if (isPhlebotomist(identity)) {
              const collectionRepo = require('../repositories/dynamo-collection');
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
            if (!hasPhlebAccess) {
              return error.forbidden('Access denied: You are not authorized to view this booking.');
            }
          }

          return success(booking);
        }

        // Handle /api/bookings?patientId={patientId}
        if (patientId) {
          if (!isAdmin(identity) && !isStaff(identity)) {
            const patient = await patientRepo.getById(patientId);
            if (patient && !canAccessPatient(identity, patient)) {
              return error.forbidden('Access denied: You are not authorized to view bookings for this patient.');
            }
            if (!patient && patientId !== identity.primaryPatientId && patientId !== identity.sub) {
              return error.forbidden('Access denied: Unauthorized patient query.');
            }
          }

          const bookings = await bookingRepo.getByPatientId(patientId);
          return success(bookings);
        }

        // Handle /api/bookings (list)
        if (isAdmin(identity) || (isStaff(identity) && !isPhlebotomist(identity))) {
          const limit = queryStringParameters.limit ? parseInt(queryStringParameters.limit, 10) : 20;
          const bookings = await bookingRepo.getRecent(limit);
          return success(bookings);
        } else if (isPhlebotomist(identity)) {
          // Phlebotomists don't have broad booking list access
          return success([]);
        } else {
          // Regular patient: retrieve bookings for all owned patients
          const ownedPatients = await patientRepo.getByOwner(identity.sub);
          const allPatientIds = new Set([identity.primaryPatientId, identity.sub, ...ownedPatients.map((p) => p.id)]);

          const bookingLists = await Promise.all(
            Array.from(allPatientIds).map((pId) => bookingRepo.getByPatientId(pId))
          );
          const flattened = bookingLists.flat();
          return success(flattened);
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}');
        const bookingId = body.id || `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const newBookingData = {
          ...body,
          id: bookingId,
          ownerSub: identity.sub,
          status: body.status || 'Pending',
        };

        const createdBooking = await bookingRepo.create(newBookingData, identity.sub);
        return success(createdBooking, 201);
      }

      case 'PUT': {
        if (!rawBookingId) return error.badRequest('Missing bookingId in path');

        const existingBooking = await bookingRepo.getById(rawBookingId);
        if (!existingBooking) return error.notFound('Booking not found');

        let patient = null;
        if (existingBooking.patientId) {
          patient = await patientRepo.getById(existingBooking.patientId);
        }

        if (!canAccessBooking(identity, existingBooking, patient)) {
          return error.forbidden('Access denied: You are not authorized to modify this booking.');
        }

        const updateBody = JSON.parse(event.body || '{}');

        // RBAC on updates: Patients can only cancel their own booking
        if (!isAdmin(identity) && !isStaff(identity)) {
          if (updateBody.status && updateBody.status !== 'Cancelled') {
            return error.forbidden('Patients are only permitted to cancel pending bookings.');
          }
          if (updateBody.paymentStatus) {
            return error.forbidden('Patients cannot directly alter booking payment status.');
          }
        }

        let updatedBooking;
        if (updateBody.status) {
          updatedBooking = await bookingRepo.updateStatus(rawBookingId, updateBody.status);
        } else if (updateBody.paymentStatus) {
          updatedBooking = await bookingRepo.updatePaymentStatus(rawBookingId, updateBody.paymentStatus);
        } else {
          return error.badRequest('Must provide status or paymentStatus to update');
        }

        return success(updatedBooking);
      }

      default:
        return error.badRequest(`Unsupported method: ${event.httpMethod}`);
    }
  } catch (err) {
    logger.error('Error processing booking request', err);
    return error.serverError('Internal Server Error');
  }
};
