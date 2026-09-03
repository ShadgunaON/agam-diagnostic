const { extractIdentity, hasPermission, isSuperAdmin } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const serviceRepo = require('../repositories/dynamo-service');

exports.handler = async (event) => {
  logger.info('Incoming service request', {
    httpMethod: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
  });

  const method = event.httpMethod;
  const proxy = event.pathParameters?.proxy || '';
  const segments = proxy.split('/').filter(Boolean);
  const slugOrId = segments[0] ? decodeURIComponent(segments[0]) : null;
  const action = segments[1];

  try {
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const identity = extractIdentity(event);
      if (!identity) {
        return error.unauthorized('Missing or invalid authentication token');
      }

      const isAdmin = await isSuperAdmin(identity);
      
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (err) {
        return error.badRequest('Invalid JSON body');
      }

      if (method === 'POST') {
        if (!isAdmin && !(await hasPermission(identity, 'catalog', 'create'))) {
          return error.forbidden('Access denied: Requires catalog create permission');
        }
        
        if (!body.slug || !body.title) {
          return error.badRequest('Missing required fields (slug, title)');
        }
        
        const existing = await serviceRepo.getBySlug(body.slug);
        if (existing) {
          return error.badRequest('A service with this slug already exists');
        }
        
        const created = await serviceRepo.upsert(body);
        return success(created, 201);
      }

      if (method === 'PUT') {
        if (!isAdmin && !(await hasPermission(identity, 'catalog', 'edit'))) {
          return error.forbidden('Access denied: Requires catalog edit permission');
        }
        
        if (!slugOrId) return error.badRequest('Missing service ID');
        
        try {
          const updated = await serviceRepo.update(slugOrId, body);
          return success(updated);
        } catch (err) {
          if (err.message === 'Service not found') return error.notFound('Service not found');
          throw err;
        }
      }

      if (method === 'PATCH' && action === 'status') {
        if (!isAdmin && !(await hasPermission(identity, 'catalog', 'edit'))) {
          return error.forbidden('Access denied: Requires catalog edit permission');
        }
        
        if (!slugOrId) return error.badRequest('Missing service ID');
        if (!body.status) return error.badRequest('Missing status field');
        
        try {
          await serviceRepo.updateStatus(slugOrId, body.status);
          return success({ success: true, message: 'Status updated' });
        } catch (err) {
          if (err.message === 'Service not found') return error.notFound('Service not found');
          throw err;
        }
      }
      
      return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed');
    }

    // ----------------------------------------------------------------
    // DELETE OPERATION - Requires Authentication & RBAC
    // ----------------------------------------------------------------
    if (method === 'DELETE') {
      const identity = extractIdentity(event);
      if (!identity) {
        return error.unauthorized('Missing or invalid authentication token');
      }

      const isAdmin = await isSuperAdmin(identity);
      if (!isAdmin && !(await hasPermission(identity, 'catalog', 'delete'))) {
        return error.forbidden('Access denied: Requires catalog delete permission');
      }

      if (!slugOrId) return error.badRequest('Missing service ID');

      try {
        const existing = await serviceRepo.getBySlug(slugOrId) || await serviceRepo.getById(slugOrId);
        if (!existing) return error.notFound('Service not found');
        await serviceRepo.delete(existing.id);
        return success({ success: true, message: 'Service deleted' });
      } catch (err) {
        logger.error('Delete service error', { error: err.message });
        return error.serverError('Failed to delete service');
      }
    }

    if (method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      
      const identity = extractIdentity(event);
      let canViewInactive = false;
      if (identity) {
        if (await isSuperAdmin(identity)) {
          canViewInactive = true;
        } else if (await hasPermission(identity, 'catalog', 'view')) {
          canViewInactive = true;
        }
      }

      if (slugOrId) {
        const service = await serviceRepo.getBySlug(slugOrId) || await serviceRepo.getById(slugOrId);
        if (!service) {
          return error.notFound(`Service '${slugOrId}' not found`);
        }
        
        if (!canViewInactive && service.status && service.status !== 'ACTIVE') {
          return error.notFound(`Service '${slugOrId}' not found`);
        }
        
        return success(service);
      }

      const allItems = await serviceRepo.getCatalog();
      let filteredItems = allItems;
      
      if (!canViewInactive) {
        filteredItems = allItems.filter(item => !item.status || item.status === 'ACTIVE');
      }

      if (queryParams.q) {
        const query = queryParams.q.toLowerCase().trim();
        filteredItems = filteredItems.filter(
          (item) =>
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.category && item.category.toLowerCase().includes(query))
        );
      }

      const page = Math.max(1, parseInt(queryParams.page || '1', 10));
      const limit = Math.min(200, Math.max(1, parseInt(queryParams.limit || '100', 10)));
      const total = filteredItems.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const data = filteredItems.slice(start, start + limit);

      return success({
        data,
        meta: { total, page, limit, totalPages },
      });
    }

    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed');

  } catch (err) {
    logger.error('Error handling service request', { error: err.message, stack: err.stack });
    return error.serverError('Internal server error');
  }
};
