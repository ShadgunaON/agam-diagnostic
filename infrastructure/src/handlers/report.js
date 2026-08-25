const { extractIdentity, hasPermission } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const reportRepo = require('../repositories/dynamo-report');
const patientRepo = require('../repositories/dynamo-patient');

exports.handler = async (event) => {
  logger.info(`Incoming report request: ${event.httpMethod} ${event.path}`);

  try {
    const identity = extractIdentity(event);
    if (!identity) {
      return error.unauthorized('Missing or invalid authentication token');
    }

    const pathParameters = event.pathParameters || {};
    const proxyPath = pathParameters.proxy || '';
    const rawReportId = pathParameters.id || proxyPath.split('/').filter(Boolean)[0];
    const queryStringParameters = event.queryStringParameters || {};
    const patientId = queryStringParameters.patientId;

    switch (event.httpMethod) {
      case 'GET': {
        // Handle /api/reports/{id}
        if (rawReportId) {
          const report = await reportRepo.getById(rawReportId);
          if (!report) return error.notFound('Report not found');

          // Check permissions
          const canViewAsStaff = await hasPermission(identity, 'reports', 'view');
          
          if (!canViewAsStaff) {
            // Check patient ownership
            let ownsReport = false;
            
            if (report.patientId === identity.sub || report.patientId === identity.primaryPatientId) {
              ownsReport = true;
            } else if (identity.primaryPatientId) {
              const primaryPatient = await patientRepo.getById(identity.primaryPatientId);
              if (primaryPatient && Array.isArray(primaryPatient.savedPatients)) {
                ownsReport = primaryPatient.savedPatients.some(p => p.id === report.patientId);
              }
            }

            if (!ownsReport) {
              return error.notFound('Report not found'); // Secure not-found behavior
            }
          }

          return success(report);
        }

        // Handle /api/reports (list)
        const canViewAsStaff = await hasPermission(identity, 'reports', 'view');

        if (canViewAsStaff) {
          // If a specific patientId is requested by staff, filter by it
          if (patientId) {
            const reports = await reportRepo.getByPatientId(patientId);
            return success(reports);
          }
          // Otherwise, return recent reports
          const limit = queryStringParameters.limit ? parseInt(queryStringParameters.limit, 10) : 100;
          let reports = await reportRepo.getAll(limit);
          reports = reports.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          return success(reports);
        } else {
          // Patient access: get only own and family reports
          const allPatientIds = new Set([identity.primaryPatientId, identity.sub]);
          
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
          
          // Filter out falsy arrays/items and flatten
          const flattened = reportLists.filter(Boolean).flat();
          
          // Secure ownership boundary: The frontend patientId query param is IGNORED.
          // We always return exactly the reports that belong to the user's valid patient IDs.
          return success(flattened);
        }
      }

      case 'POST': {
        const canCreate = await hasPermission(identity, 'reports', 'create');
        if (!canCreate) {
          return error.forbidden('Access denied: Missing reports.create permission');
        }

        const body = JSON.parse(event.body || '{}');

        // Validation for minimum required fields
        if (!body.patientId || !body.patient) {
          return error.badRequest('Missing required field: patientId or patient object');
        }

        const reportId = body.id || `REP-${Date.now()}`;

        const newReportData = {
          ...body,
          id: reportId,
          status: body.status || 'Processing',
          priority: body.priority || 'Routine',
          results: body.results || [],
        };

        const createdReport = await reportRepo.create(newReportData);
        return success(createdReport, 201);
      }

      case 'PUT': {
        if (!rawReportId) return error.badRequest('Missing report ID in path');

        // Status updates must require reports.edit
        const canEdit = await hasPermission(identity, 'reports', 'edit');
        if (!canEdit) {
          return error.forbidden('Access denied: Missing reports.edit permission');
        }

        const existingReport = await reportRepo.getById(rawReportId);
        if (!existingReport) return error.notFound('Report not found');

        const updateBody = JSON.parse(event.body || '{}');
        const nextStatus = updateBody.status;

        if (!nextStatus) {
          return error.badRequest('Must provide status to update');
        }

        const validStatuses = ['Processing', 'Generated', 'Awaiting Verification', 'Pending Upload', 'Published'];
        if (!validStatuses.includes(nextStatus)) {
          return error.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        const updatedReport = await reportRepo.updateStatus(rawReportId, nextStatus);

        // Note: The parent booking transition (to 'Completed') is currently handled
        // in reportsService.updateStatus on the frontend/service layer, 
        // per the audit and user instruction: "Do NOT duplicate that business rule inside the Lambda if it already belongs to ReportsService."

        return success(updatedReport);
      }

      default:
        return error.badRequest(`Unsupported method: ${event.httpMethod}`);
    }
  } catch (err) {
    logger.error('Error processing report request', err);
    return error.serverError('Internal Server Error');
  }
};
