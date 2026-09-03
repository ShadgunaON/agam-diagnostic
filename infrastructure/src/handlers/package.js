const { extractIdentity, hasPermission, isSuperAdmin } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const packageRepo = require('../repositories/dynamo-package');

exports.handler = async (event) => {
  logger.info('Incoming package request', {
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
        
        const existing = await packageRepo.getBySlug(body.slug);
        if (existing) {
          return error.badRequest('A package with this slug already exists');
        }
        
        const created = await packageRepo.upsert(body);
        return success(created, 201);
      }

      if (method === 'PUT') {
        if (!isAdmin && !(await hasPermission(identity, 'catalog', 'edit'))) {
          return error.forbidden('Access denied: Requires catalog edit permission');
        }
        
        if (!slugOrId) return error.badRequest('Missing package ID');
        
        try {
          const updated = await packageRepo.update(slugOrId, body);
          return success(updated);
        } catch (err) {
          if (err.message === 'Package not found') return error.notFound('Package not found');
          throw err;
        }
      }

      if (method === 'PATCH' && action === 'status') {
        if (!isAdmin && !(await hasPermission(identity, 'catalog', 'edit'))) {
          return error.forbidden('Access denied: Requires catalog edit permission');
        }
        
        if (!slugOrId) return error.badRequest('Missing package ID');
        if (!body.status) return error.badRequest('Missing status field');
        
        try {
          await packageRepo.updateStatus(slugOrId, body.status);
          return success({ success: true, message: 'Status updated' });
        } catch (err) {
          if (err.message === 'Package not found') return error.notFound('Package not found');
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

      if (!slugOrId) return error.badRequest('Missing package ID');

      try {
        const existing = await packageRepo.getBySlug(slugOrId) || await packageRepo.getById(slugOrId);
        if (!existing) return error.notFound('Package not found');
        await packageRepo.delete(existing.id);
        return success({ success: true, message: 'Package deleted' });
      } catch (err) {
        logger.error('Delete package error', { error: err.message });
        return error.serverError('Failed to delete package');
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
        if (slugOrId === 'featured') {
          const featured = await packageRepo.getFeaturedPackages();
          return success({ data: featured });
        }
        if (slugOrId === 'benefits') {
          const benefits = await packageRepo.getBenefits();
          return success({ data: benefits });
        }
        if (slugOrId === 'process') {
          const process = await packageRepo.getProcessSteps();
          return success({ data: process });
        }

        const pkg = await packageRepo.getBySlug(slugOrId) || await packageRepo.getById(slugOrId);
        if (!pkg) {
          return error.notFound(`Package '${slugOrId}' not found`);
        }
        
        if (!canViewInactive && pkg.status && pkg.status !== 'ACTIVE') {
          return error.notFound(`Package '${slugOrId}' not found`);
        }
        
        return success(pkg);
      }

      const allItems = await packageRepo.getCatalog();
      let filteredItems = allItems;
      
      if (!canViewInactive) {
        filteredItems = allItems.filter(item => !item.status || item.status === 'ACTIVE');
      }

      if (queryParams.q) {
        const lowerQuery = queryParams.q.toLowerCase().trim();
        filteredItems = filteredItems.filter(
          (item) =>
            (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
            (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
            (item.tag && item.tag.toLowerCase().includes(lowerQuery)) ||
            (item.category && item.category.toLowerCase().includes(lowerQuery))
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
    logger.error('Error handling package request', { error: err.message, stack: err.stack });
    return error.serverError('Internal server error');
  }
};
