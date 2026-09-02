const { extractIdentity, isAdmin, isStaff, isPhlebotomist, canAccessPatient, canAccessBooking, hasPermission } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const bookingRepo = require('../repositories/dynamo-booking');
const patientRepo = require('../repositories/dynamo-patient');
const collectionRepo = require('../repositories/dynamo-collection');
const testRepo = require('../repositories/dynamo-test');
const packageRepo = require('../repositories/dynamo-package');
const serviceRepo = require('../repositories/dynamo-service');

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

          if (!(await canAccessBooking(identity, booking, patient))) {
            // Verify if phlebotomist is assigned to a collection for this booking
            let hasPhlebAccess = false;
            if (await isPhlebotomist(identity)) {
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
          if (!(await isAdmin(identity)) && !(await isStaff(identity))) {
            const patient = await patientRepo.getById(patientId);
            if (patient && !(await canAccessPatient(identity, patient))) {
              return error.forbidden('Access denied: You are not authorized to view bookings for this patient.');
            }
            if (!patient && patientId !== identity.primaryPatientId && patientId !== identity.sub) {
              return error.forbidden('Access denied: Unauthorized patient query.');
            }
          } else {
            const { hasPermission } = require('../shared/auth');
            if (!(await hasPermission(identity, 'orders', 'view'))) {
              return error.forbidden('Access denied: Missing orders.view permission');
            }
          }

          const bookings = await bookingRepo.getByPatientId(patientId);
          return success(bookings);
        }

        // Handle /api/bookings (list)
        if ((await isAdmin(identity)) || ((await isStaff(identity)) && !(await isPhlebotomist(identity)))) {
          if (!(await hasPermission(identity, 'orders', 'view'))) {
            return error.forbidden('Access denied: Missing orders.view permission');
          }
          const limit = queryStringParameters.limit ? parseInt(queryStringParameters.limit, 10) : 100;
          let bookings = await bookingRepo.getRecent(limit);
          bookings = bookings.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          return success(bookings);
        } else if (await isPhlebotomist(identity)) {
          // Phlebotomists don't have broad booking list access
          return success([]);
        } else {
          // Regular patient: retrieve bookings for self + family members
          const allPatientIds = new Set([identity.primaryPatientId, identity.sub]);
          
          const primaryPatient = await patientRepo.getById(identity.primaryPatientId);
          if (primaryPatient && Array.isArray(primaryPatient.savedPatients)) {
            primaryPatient.savedPatients.forEach(p => {
              if (p.id) allPatientIds.add(p.id);
            });
          }

          const bookingLists = await Promise.all(
            Array.from(allPatientIds).map((pId) => bookingRepo.getByPatientId(pId))
          );
          let flattened = bookingLists.flat();
          
          // Secure ownership boundary: only return bookings owned by the authenticated identity
          flattened = flattened.filter(b => b.ownerSub === identity.sub);
          
          return success(flattened);
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}');

        // Extract Idempotency Key
        const headers = event.headers || {};
        const idempotencyKey = headers['idempotency-key'] || headers['Idempotency-Key'];
        
        if (!idempotencyKey) {
          return error.badRequest('Idempotency-Key header is required');
        }

        // RBAC Check for staff creating bookings
        if (await (await isStaff(identity)) && !(await hasPermission(identity, 'orders', 'create'))) {
          // Note: Patients can create their own bookings (self-service).
          // We distinguish by checking if they are acting as staff.
          return error.forbidden('Access denied: Missing orders.create permission');
        }

        const bookingId = body.id || `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const newBookingData = {
          ...body,
          id: bookingId,
          ownerSub: identity.sub,
          status: body.status || 'Pending',
        };

        // Resolve authoritative pricing from DynamoDB
        const invoiceItems = [];
        for (let i = 0; i < (newBookingData.items || []).length; i++) {
          const item = newBookingData.items[i];
          let authoritativePrice = 0;
          
          if (item.type === 'Package') {
            const pkg = await packageRepo.getBySlug(item.slug || item.id);
            if (!pkg || pkg.status !== 'ACTIVE') {
              return error.badRequest(`Package ${item.name} is unavailable or invalid`);
            }
            authoritativePrice = parseFloat(pkg.price || pkg.packagePrice || '0');
          } else {
            const test = await testRepo.getBySlug(item.slug || item.id);
            if (!test || test.status !== 'ACTIVE') {
              // Try service repo if not found in test
              const service = await serviceRepo.getBySlug(item.slug || item.id);
              if (!service || service.status !== 'ACTIVE') {
                 return error.badRequest(`Item ${item.name} is unavailable or invalid`);
              } else {
                 authoritativePrice = parseFloat(service.price || '0');
              }
            } else {
              authoritativePrice = parseFloat(test.price || '0');
            }
          }
          
          if (isNaN(authoritativePrice)) authoritativePrice = 0;

          invoiceItems.push({
            id: `ITEM-${i}-${Date.now()}`,
            name: item.name,
            type: item.type === 'Package' ? 'Package' : 'Test',
            price: authoritativePrice
          });
          
          // Overwrite the booking payload item price with authoritative price so it's snapped in the booking as well
          item.price = authoritativePrice;
        }

        const subtotal = invoiceItems.reduce((sum, item) => sum + item.price, 0);
        const tax = 0; // 0% tax per instructions
        const discount = 0; // Discounts not currently applied via backend flow
        const collectionFee = (newBookingData.collection?.type === 'Home Collection' && subtotal < 500) ? 150 : 0;
        
        const total = subtotal + tax + collectionFee - discount;
        
        // Overwrite the client's payload with authoritative total
        if (!newBookingData.payment) newBookingData.payment = {};
        newBookingData.payment.total = total;

        const invoiceData = {
          id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          bookingId: bookingId,
          patientId: newBookingData.patientId || newBookingData.patient?.phone || newBookingData.patient?.email || 'GENERAL',
          items: invoiceItems,
          subtotal,
          discount,
          tax,
          collectionFee,
          total,
          paymentStatus: newBookingData.payment?.status === 'Paid' ? 'Paid' : 'Pending',
          createdAt: new Date().toISOString()
        };

        // Construct CollectionTask
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

        try {
          const result = await bookingRepo.createAggregate({
            booking: newBookingData,
            invoice: invoiceData,
            collectionTask: collectionData,
            idempotencyKey,
            ownerSub: identity.sub
          });
          
          // Auto-register guest patients to ensure they appear in Admin dashboards
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
                  logger.info(`Auto-registered guest patient ${resolvedPatientId}`);
                }
              } catch (patErr) {
                logger.warn(`Failed to auto-register patient ${resolvedPatientId}`, patErr);
              }
            }
          }
          
          return success({
            ...result.booking,
            invoiceId: invoiceData.id
          }, result.isDuplicate ? 200 : 201);
        } catch (aggError) {
          logger.error('Failed to create booking aggregate', aggError);
          return error.serverError('Failed to create booking aggregate. Please try again.');
        }
      }

      case 'PUT': {
        if (!rawBookingId) return error.badRequest('Missing bookingId in path');

        const existingBooking = await bookingRepo.getById(rawBookingId);
        if (!existingBooking) return error.notFound('Booking not found');

        let patient = null;
        if (existingBooking.patientId) {
          patient = await patientRepo.getById(existingBooking.patientId);
        }

        if (!(await canAccessBooking(identity, existingBooking, patient))) {
          return error.forbidden('Access denied: You are not authorized to modify this booking.');
        }

        const updateBody = JSON.parse(event.body || '{}');

        // RBAC on updates: Patients can only cancel their own booking
        if (!(await isAdmin(identity)) && !(await isStaff(identity))) {
          if (updateBody.status && updateBody.status !== 'Cancelled') {
            return error.forbidden('Patients are only permitted to cancel pending bookings.');
          }
          if (updateBody.paymentStatus) {
            return error.forbidden('Patients cannot directly alter booking payment status.');
          }
        } else {
          // Staff modification RBAC check
          if (!(await hasPermission(identity, 'orders', 'edit'))) {
            return error.forbidden('Access denied: Missing orders.edit permission');
          }
        }

        let updatedBooking;
        if (updateBody.status) {
          updatedBooking = await bookingRepo.updateStatus(rawBookingId, updateBody.status);
          
          // --- BACKEND AUTHORITATIVE LIFECYCLE SYNC ---
          if (updateBody.status === 'Completed' || updateBody.status === 'Cancelled') {
             try {
               const pId = existingBooking.patientId;
               if (pId) {
                 const collections = await collectionRepo.getByPatientId(pId);
                 const matchingTask = collections.find(c => c.bookingId === rawBookingId);
                 if (matchingTask && matchingTask.status !== updateBody.status) {
                   await collectionRepo.update(matchingTask.id, { status: updateBody.status });
                 }
               }
             } catch (syncErr) {
               logger.warn(`Failed to sync collection task for booking ${rawBookingId}`, syncErr);
             }
          }
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
