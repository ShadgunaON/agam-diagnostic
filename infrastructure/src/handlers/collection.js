const {
  extractIdentity,
  isAdmin,
  isStaff,
  isPhlebotomist,
  canAccessPatient,
  canAccessCollection,
  canModifyCollection,
  isValidCollectionTransition,
  hasPermission,
} = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const collectionRepo = require('../repositories/dynamo-collection');
const patientRepo = require('../repositories/dynamo-patient');
const bookingRepo = require('../repositories/dynamo-booking');
const reportRepo = require('../repositories/dynamo-report');

exports.handler = async (event) => {
  logger.info(`Incoming collection request: ${event.httpMethod} ${event.path}`);

  try {
    const identity = extractIdentity(event);
    if (!identity) {
      return error.unauthorized('Missing or invalid authentication token');
    }

    const pathParameters = event.pathParameters || {};
    const proxyPath = pathParameters.proxy || '';
    const rawCollectionId = pathParameters.collectionId || proxyPath.split('/').filter(Boolean)[0];
    const queryStringParameters = event.queryStringParameters || {};
    const patientId = queryStringParameters.patientId;

    switch (event.httpMethod) {
      case 'GET': {
        // 1. Single collection retrieval: GET /api/collections/{collectionId}
        if (rawCollectionId) {
          const collection = await collectionRepo.getById(rawCollectionId);
          if (!collection) {
            return error.notFound('Collection task not found');
          }

          let patient = null;
          if (collection.patientId) {
            patient = await patientRepo.getById(collection.patientId);
          }

          if (!(await canAccessCollection(identity, collection, patient))) {
            return error.forbidden('Access denied: You are not authorized to view this collection task.');
          }

          return success(collection);
        }

        // 2. Query by patientId: GET /api/collections?patientId={patientId}
        if (patientId) {
          if (!(await isAdmin(identity)) && !(await isStaff(identity))) {
            const patient = await patientRepo.getById(patientId);
            if (patient && !(await canAccessPatient(identity, patient))) {
              return error.forbidden('Access denied: You are not authorized to view collections for this patient.');
            }
            if (!patient && patientId !== identity.primaryPatientId && patientId !== identity.sub) {
              return error.forbidden('Access denied: Unauthorized patient query.');
            }
          } else {
            if (!(await hasPermission(identity, 'collections', 'view'))) {
              return error.forbidden('Access denied: Missing collections.view permission');
            }
          }

          const collections = await collectionRepo.getByPatientId(patientId);
          return success(collections);
        }

        // 3. List collections: GET /api/collections
        if ((await isAdmin(identity)) || ((await isStaff(identity)) && !(await isPhlebotomist(identity)))) {
          if (!(await hasPermission(identity, 'collections', 'view'))) {
            return error.forbidden('Access denied: Missing collections.view permission');
          }
          // Admin & general staff (Doctor, Lab Tech): return all collections
          const collections = await collectionRepo.getAll();
          return success(collections);
        } else if (await isPhlebotomist(identity)) {
          if (!(await hasPermission(identity, 'collections', 'view'))) {
            return error.forbidden('Access denied: Missing collections.view permission');
          }
          // Phlebotomist: return operational collections assigned to them or unassigned
          const allCollections = await collectionRepo.getAll();
          const phlebCollections = allCollections.filter((c) =>
            c.phlebotomistId === identity.sub ||
            c.phlebotomistId === identity.username ||
            c.assignedTo === identity.username ||
            c.assignedTo === identity.sub ||
            c.status === 'Unassigned' ||
            c.status === 'Pending'
          );
          return success(phlebCollections);
        } else {
          // Regular Patient: retrieve collections for all owned patients
          const ownedPatients = await patientRepo.getByOwner(identity.sub);
          const allPatientIds = new Set([identity.primaryPatientId, identity.sub, ...ownedPatients.map((p) => p.id)]);

          const collectionLists = await Promise.all(
            Array.from(allPatientIds).map((pId) => collectionRepo.getByPatientId(pId))
          );
          const flattened = collectionLists.flat();
          return success(flattened);
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}');

        // Patient authorization check
        if (!(await isAdmin(identity)) && !(await isStaff(identity))) {
          if (body.patientId) {
            const patient = await patientRepo.getById(body.patientId);
            if (patient && !(await canAccessPatient(identity, patient))) {
              return error.forbidden('Access denied: You cannot create a collection for this patient.');
            }
            if (!patient && body.patientId !== identity.primaryPatientId && body.patientId !== identity.sub) {
              return error.forbidden('Access denied: Unauthorized patient ID.');
            }
          }
        } else {
          // Staff RBAC check for creation
          if (!(await hasPermission(identity, 'collections', 'create'))) {
            return error.forbidden('Access denied: Missing collections.create permission');
          }
        }

        const collectionId = body.id || `COL-${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const initialStatus = (!(await isAdmin(identity)) && !(await isStaff(identity)))
          ? (body.type === 'Lab Visit' ? 'Pending' : 'Unassigned')
          : (body.status || (body.type === 'Lab Visit' ? 'Pending' : 'Unassigned'));

        const taskData = {
          ...body,
          id: collectionId,
          ownerSub: identity.sub,
          patientId: body.patientId || identity.primaryPatientId,
          status: initialStatus,
          // Prevent patients from assigning staff during creation
          assignedTo: (!(await isAdmin(identity)) && !(await isStaff(identity))) ? 'Unassigned' : (body.assignedTo || 'Unassigned'),
          phlebotomistId: (!(await isAdmin(identity)) && !(await isStaff(identity))) ? undefined : body.phlebotomistId,
        };

        const newCollection = await collectionRepo.create(taskData, identity.sub);
        return success(newCollection, 201);
      }

      case 'PUT': {
        if (!rawCollectionId) return error.badRequest('Missing collectionId in path');

        const existingCollection = await collectionRepo.getById(rawCollectionId);
        if (!existingCollection) {
          return error.notFound('Collection task not found');
        }

        let patient = null;
        if (existingCollection.patientId) {
          patient = await patientRepo.getById(existingCollection.patientId);
        }

        if (!(await canAccessCollection(identity, existingCollection, patient))) {
          return error.forbidden('Access denied: You are not authorized to modify this collection task.');
        }

        const updateBody = JSON.parse(event.body || '{}');

        // Check modification permissions (ownership / basic rule boundary)
        if (!(await canModifyCollection(identity, existingCollection, updateBody))) {
          return error.forbidden('Access denied: You do not have permission to modify these collection fields.');
        }

        // Detailed RBAC Check for Staff/Admin
        if (await isStaff(identity)) {
          // If trying to assign/reassign
          if (updateBody.assignedTo !== undefined || updateBody.phlebotomistId !== undefined) {
             if (!(await hasPermission(identity, 'collections', 'assign'))) {
               return error.forbidden('Access denied: Missing collections.assign permission');
             }
          }
          // If trying to edit any other fields (status, etc.)
          const editKeys = Object.keys(updateBody).filter(k => k !== 'assignedTo' && k !== 'phlebotomistId');
          if (editKeys.length > 0) {
            if (!(await hasPermission(identity, 'collections', 'edit'))) {
               return error.forbidden('Access denied: Missing collections.edit permission');
            }
          }
        }

        // Validate lifecycle transition if status is changed
        if (updateBody.status && updateBody.status !== existingCollection.status) {
          if (!isValidCollectionTransition(existingCollection.status, updateBody.status)) {
            return error.badRequest(
              `Invalid status transition from '${existingCollection.status}' to '${updateBody.status}'.`
            );
          }
        }

        const updatedCollection = await collectionRepo.update(rawCollectionId, updateBody);

        // --- BACKEND AUTHORITATIVE LIFECYCLE SYNC ---
        // If collection status changed, propagate authoritative state to Booking and Reports
        if (updateBody.status && updateBody.status !== existingCollection.status && existingCollection.bookingId) {
          const bookingId = existingCollection.bookingId;
          const statusMap = {
            'Assigned': 'Assigned',
            'Sample Collected': 'Sample Collected',
            'Completed': 'Completed'
          };
          
          if (statusMap[updateBody.status]) {
            try {
              await bookingRepo.updateStatus(bookingId, statusMap[updateBody.status]);
            } catch (syncErr) {
              logger.warn(`Failed to sync booking ${bookingId} status to ${statusMap[updateBody.status]}`, syncErr);
            }
          }

          // If sample is collected, automatically instantiate a Report task
          if (updateBody.status === 'Sample Collected') {
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
                  status: 'Processing', // Changed from Pending to match frontend model
                  priority: 'Routine',
                  generatedAt: new Date().toISOString()
                });
              }
            } catch (repErr) {
              logger.warn(`Failed to generate report task for booking ${bookingId}`, repErr);
            }
          }
        }

        // Server-authoritative assignment notification for phlebotomist
        const newPhlebId = updateBody.phlebotomistId || updateBody.assignedTo;
        const oldPhlebId = existingCollection.phlebotomistId || existingCollection.assignedTo;
        if (newPhlebId && newPhlebId !== 'Unassigned' && newPhlebId !== oldPhlebId) {
          try {
            const notificationRepo = require('../repositories/dynamo-notification');
            await notificationRepo.create({
              userId: newPhlebId,
              title: 'New Home Collection Assignment',
              message: `You have been assigned a Home Collection for task ${rawCollectionId}.`,
              link: `/admin/collections`,
              isRead: false,
              createdBy: identity.sub,
            });
          } catch (notifErr) {
            logger.warn('Failed to dispatch assignment notification', notifErr);
          }
        }

        return success(updatedCollection);

      }

      default:
        return error.badRequest(`Unsupported method: ${event.httpMethod}`);
    }
  } catch (err) {
    logger.error('Error processing collection request', err);
    return error.serverError('Internal Server Error');
  }
};
