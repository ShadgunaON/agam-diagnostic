const {
  extractIdentity,
  isAdmin,
  isStaff,
  canAccessPatient,
  canAccessInvoice,
  canModifyInvoice,
  isValidInvoiceTransition,
  hasPermission,
} = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const invoiceRepo = require('../repositories/dynamo-invoice');
const patientRepo = require('../repositories/dynamo-patient');

exports.handler = async (event) => {
  logger.info(`Incoming request: ${event.httpMethod} ${event.path}`);

  try {
    const identity = extractIdentity(event);
    if (!identity) {
      return error.unauthorized('Missing or invalid authentication token');
    }

    const pathParameters = event.pathParameters || {};
    const proxyPath = pathParameters.proxy || '';
    const segments = proxyPath.split('/').filter(Boolean);
    const invoiceId = pathParameters.invoiceId || segments[0];
    const action = segments[1];
    const queryStringParameters = event.queryStringParameters || {};
    const patientId = queryStringParameters.patientId;

    switch (event.httpMethod) {
      case 'GET': {
        // 1. Single invoice lookup: /api/invoices/{invoiceId}
        if (invoiceId) {
          const invoice = await invoiceRepo.getById(invoiceId);
          if (!invoice) return error.notFound('Invoice not found');

          let patient = null;
          if (invoice.patientId) {
            patient = await patientRepo.getById(invoice.patientId);
          }

          if (!(await canAccessInvoice(identity, invoice, patient))) {
            return error.forbidden('Access denied: You are not authorized to view this invoice.');
          }

          return success(invoice);
        }

        // 2. Patient-scoped query: /api/invoices?patientId={id}
        if (patientId) {
          if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
            const patient = await patientRepo.getById(patientId);
            if (patient && !(await canAccessPatient(identity, patient))) {
              return error.forbidden('Access denied: You are not authorized to view invoices for this patient.');
            }
            if (!patient && patientId !== identity.primaryPatientId && patientId !== identity.sub) {
              return error.forbidden('Access denied: Unauthorized patient query.');
            }
          } else {
            const { hasPermission } = require('../shared/auth');
            if (!(await hasPermission(identity, 'invoices', 'view'))) {
              return error.forbidden('Access denied: Missing invoices.view permission');
            }
          }

          const invoices = await invoiceRepo.getByPatientId(patientId);
          return success(invoices);
        }

        // 3. General list: /api/invoices
        if (isAdmin(identity) || (isStaff(identity) && !isPhlebotomist(identity))) {
          if (!(await hasPermission(identity, 'invoices', 'view'))) {
            return error.forbidden('Access denied: Missing invoices.view permission');
          }
          const invoices = await invoiceRepo.getAll();
          return success(invoices);
        } else if (isPhlebotomist(identity)) {
          if (!(await hasPermission(identity, 'invoices', 'view'))) {
            return error.forbidden('Access denied: Missing invoices.view permission');
          }
          // Phlebotomists don't get the broad invoice list
          return success([]);
        } else {
          // Regular patient: retrieve invoices for all owned patient records
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
          // Deduplicate by ID
          const seen = new Set();
          const unique = [];
          for (const inv of flattened) {
            if (inv && inv.id && !seen.has(inv.id)) {
              seen.add(inv.id);
              unique.push(inv);
            }
          }
          unique.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          return success(unique);
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}');

        // Verify patient ownership if caller is regular patient or phlebotomist
        if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
          if (body.patientId) {
            const patient = await patientRepo.getById(body.patientId);
            if (patient && !(await canAccessPatient(identity, patient))) {
              return error.forbidden('Access denied: Cannot create invoice for unauthorized patient.');
            }
          }
        } else {
          // Staff RBAC check
          if (!(await hasPermission(identity, 'invoices', 'create'))) {
            return error.forbidden('Access denied: Missing invoices.create permission');
          }
        }

        // Server-authoritative calculations
        const items = Array.isArray(body.items) ? body.items : [];
        const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const discount = Math.max(0, Number(body.discount) || 0);
        const tax = Math.round(subtotal * 0.05);
        const total = Math.max(0, subtotal - discount + tax);



        const newId = body.id || `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const invoiceData = {
          ...body,
          id: newId,
          subtotal,
          discount,
          tax,
          total,
          items,
          ownerSub: identity.sub,
          patientId: body.patientId || identity.primaryPatientId,
          paymentStatus: body.paymentStatus === 'Paid' && (isAdmin(identity) || isStaff(identity)) ? 'Paid' : 'Pending',
          createdAt: body.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const createdInvoice = await invoiceRepo.create(invoiceData);
        return success(createdInvoice, 201);
      }

      case 'PUT': {
        if (!invoiceId) return error.badRequest('Missing invoiceId in path');

        const existingInvoice = await invoiceRepo.getById(invoiceId);
        if (!existingInvoice) return error.notFound('Invoice not found');

        let patient = null;
        if (existingInvoice.patientId) {
          patient = await patientRepo.getById(existingInvoice.patientId);
        }

        const updateBody = JSON.parse(event.body || '{}');

        // Status update / Payment recording
        if (action === 'status' || updateBody.status) {
          const nextStatus = updateBody.status;

          // Regular patients and phlebotomists cannot directly change paymentStatus
          if (!isAdmin(identity) && !(isStaff(identity) && !isPhlebotomist(identity))) {
            return error.forbidden('Access denied: Only authorized staff or payment recording can update invoice payment status.');
          } else {
            // Staff RBAC check for editing invoices
            if (!(await hasPermission(identity, 'invoices', 'edit'))) {
              return error.forbidden('Access denied: Missing invoices.edit permission');
            }
          }

          if (!isValidInvoiceTransition(existingInvoice.paymentStatus, nextStatus)) {
            return error.badRequest(`Invalid payment status transition from ${existingInvoice.paymentStatus} to ${nextStatus}`);
          }

          const statusUpdates = {
            paymentStatus: nextStatus,
            paymentMethod: updateBody.paymentMethod || existingInvoice.paymentMethod || 'Online',
            receivedBy: updateBody.receivedBy || identity.sub,
          };

          if (nextStatus === 'Paid') {
            statusUpdates.paidAt = updateBody.paidAt || new Date().toISOString();
          }

          const updatedInvoice = await invoiceRepo.update(invoiceId, statusUpdates);
          return success(updatedInvoice);
        }


        // General update
        if (!(await canModifyInvoice(identity, existingInvoice, updateBody))) {
          return error.forbidden('Access denied: You do not have permission to modify this invoice.');
        }

        const updatedInvoice = await invoiceRepo.update(invoiceId, updateBody);
        return success(updatedInvoice);
      }

      default:
        return error.badRequest(`Unsupported method: ${event.httpMethod}`);
    }
  } catch (err) {
    logger.error('Error processing invoice request', err);
    return error.serverError('Internal Server Error');
  }
};

