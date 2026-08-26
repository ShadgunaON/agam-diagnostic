const { extractIdentity, isAdmin, isStaff, canAccessPatient, hasPermission } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const patientRepo = require('../repositories/dynamo-patient');

exports.handler = async (event) => {
  logger.info(`Incoming patient request: ${event.httpMethod} ${event.path}`);

  try {
    const identity = extractIdentity(event);
    if (!identity) {
      return error.unauthorized('Missing or invalid authentication token');
    }

    const pathParameters = event.pathParameters || {};
    const proxyPath = pathParameters.proxy || '';
    const rawPatientId = pathParameters.patientId || proxyPath.split('/').filter(Boolean)[0];

    switch (event.httpMethod) {
      case 'GET': {
        // Handle /api/patients/me
        if (rawPatientId === 'me' || event.path.endsWith('/me')) {
          const ownedPatients = await patientRepo.getByOwner(identity.sub);
          if (ownedPatients.length > 0) {
            return success(ownedPatients[0]);
          }
          // Default profile if no DynamoDB record created yet
          return success({
            id: identity.primaryPatientId,
            name: identity.username || 'Patient',
            email: identity.email,
            phone: identity.phone,
            role: identity.role,
            status: 'Active',
            ownerSub: identity.sub,
          });
        }

        // Handle /api/patients/{patientId}
        if (rawPatientId) {
          const patient = await patientRepo.getById(rawPatientId);
          if (!patient) return error.notFound('Patient not found');

          if (!(await canAccessPatient(identity, patient))) {
            // Verify if phlebotomist is assigned to a collection for this patient
            let hasPhlebAccess = false;
            if (await isPhlebotomist(identity)) {
              const collectionRepo = require('../repositories/dynamo-collection');
              const collections = await collectionRepo.getByPatientId(patient.id);
              hasPhlebAccess = collections.some(c => 
                c.phlebotomistId === identity.sub ||
                c.phlebotomistId === identity.username ||
                c.assignedTo === identity.username ||
                c.assignedTo === identity.sub
              );
            }
            if (!hasPhlebAccess) {
              return error.forbidden('Access denied: You are not authorized to view this patient record.');
            }
          }

          return success(patient);
        }

        // Handle /api/patients (list)
        if ((await isAdmin(identity)) || ((await isStaff(identity)) && !(await isPhlebotomist(identity)))) {
          if (!(await hasPermission(identity, 'patients', 'view'))) {
            return error.forbidden('Access denied: Missing patients.view permission');
          }
          const allPatients = await patientRepo.getAll();
          return success(allPatients);
        } else if (await isPhlebotomist(identity)) {
          // Phlebotomists don't get the broad patient list
          return success([]);
        } else {
          // Patient self-service (ownership check)
          const myPatients = await patientRepo.getByOwner(identity.sub);
          return success(myPatients);
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}');
        
        // RBAC Check for staff creating patients
        if ((await isStaff(identity)) && !(await hasPermission(identity, 'patients', 'create'))) {
          // Note: Patients can create their own profile/family during signup (self-service).
          // We distinguish by checking if they are acting as staff.
          return error.forbidden('Access denied: Missing patients.create permission');
        }

        const patientId = body.id || `pat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        const newPatientData = {
          ...body,
          id: patientId,
          ownerSub: identity.sub,
          phone: body.phone || identity.phone,
          email: body.email || identity.email,
          status: body.status || 'Active',
        };

        const createdPatient = await patientRepo.create(newPatientData, identity.sub);
        return success(createdPatient, 201);
      }

      case 'PUT': {
        let targetPatientId = rawPatientId;
        if (targetPatientId === 'me' || event.path.endsWith('/me')) {
          const ownedPatients = await patientRepo.getByOwner(identity.sub);
          if (ownedPatients.length > 0) {
            targetPatientId = ownedPatients[0].id;
          } else {
            targetPatientId = identity.primaryPatientId;
          }
        }

        if (!targetPatientId) {
          return error.badRequest('Missing patientId in path');
        }

        const existingPatient = await patientRepo.getById(targetPatientId);
        if (!existingPatient) {
          // If patient doesn't exist yet, create it for the user
          const updateBody = JSON.parse(event.body || '{}');
          const created = await patientRepo.create(
            {
              id: targetPatientId,
              ...updateBody,
              ownerSub: identity.sub,
            },
            identity.sub
          );
          return success(created);
        }

        if (!(await canAccessPatient(identity, existingPatient))) {
          return error.forbidden('Access denied: You are not authorized to update this patient record.');
        }

        // RBAC Check for staff editing patients
        // If identity is staff and NOT the owner of the patient record, require patients.edit
        if (await (await isStaff(identity)) && existingPatient.ownerSub !== identity.sub) {
          if (!(await hasPermission(identity, 'patients', 'edit'))) {
            return error.forbidden('Access denied: Missing patients.edit permission');
          }
        }

        const updateBody = JSON.parse(event.body || '{}');
        const updatedPatient = await patientRepo.update(targetPatientId, updateBody);
        return success(updatedPatient);
      }

      default:
        return error.badRequest(`Unsupported method: ${event.httpMethod}`);
    }
  } catch (err) {
    logger.error('Error processing patient request', err);
    return error.serverError('Internal Server Error');
  }
};
