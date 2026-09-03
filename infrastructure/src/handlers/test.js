const { extractIdentity, hasPermission, isSuperAdmin } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const testRepo = require('../repositories/dynamo-test');

exports.handler = async (event) => {
  logger.info('Incoming test request', {
    httpMethod: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
  });

  const method = event.httpMethod;
  const proxy = event.pathParameters?.proxy || '';
  const segments = proxy.split('/').filter(Boolean);
  const slugOrId = segments[0] ? decodeURIComponent(segments[0]) : null;
  const action = segments[1]; // e.g. "status"

  try {
    // ----------------------------------------------------------------
    // WRITE OPERATIONS (POST, PUT, PATCH) - Require Authentication & RBAC
    // ----------------------------------------------------------------
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const identity = extractIdentity(event);
      if (!identity) {
        return error.unauthorized('Missing or invalid authentication token');
      }

      // Allow superadmin or users with 'catalog' module permission
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
        
        const existing = await testRepo.getBySlug(body.slug);
        if (existing) {
          return error.badRequest('A test with this slug already exists');
        }
        
        const created = await testRepo.upsert(body);
        return success(created, 201);
      }

      if (method === 'PUT') {
        if (!isAdmin && !(await hasPermission(identity, 'catalog', 'edit'))) {
          return error.forbidden('Access denied: Requires catalog edit permission');
        }
        
        if (!slugOrId) return error.badRequest('Missing test ID');
        
        try {
          const updated = await testRepo.update(slugOrId, body);
          return success(updated);
        } catch (err) {
          if (err.message === 'Test not found') return error.notFound('Test not found');
          throw err;
        }
      }

      if (method === 'PATCH' && action === 'status') {
        if (!isAdmin && !(await hasPermission(identity, 'catalog', 'edit'))) {
          return error.forbidden('Access denied: Requires catalog edit permission');
        }
        
        if (!slugOrId) return error.badRequest('Missing test ID');
        if (!body.status) return error.badRequest('Missing status field');
        
        try {
          await testRepo.updateStatus(slugOrId, body.status);
          return success({ success: true, message: 'Status updated' });
        } catch (err) {
          if (err.message === 'Test not found') return error.notFound('Test not found');
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

      if (!slugOrId) return error.badRequest('Missing test ID');

      try {
        const existing = await testRepo.getById(slugOrId) || await testRepo.getBySlug(slugOrId);
        if (!existing) return error.notFound('Test not found');
        await testRepo.delete(existing.id);
        return success({ success: true, message: 'Test deleted' });
      } catch (err) {
        logger.error('Delete test error', { error: err.message });
        return error.serverError('Failed to delete test');
      }
    }

    // ----------------------------------------------------------------
    // READ OPERATIONS (GET) - Public or Admin
    // ----------------------------------------------------------------
    if (method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      
      // Determine if requester is an admin (to see INACTIVE/DRAFT)
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
        const test = await testRepo.getBySlug(slugOrId) || await testRepo.getById(slugOrId);
        if (!test) {
          return error.notFound(`Test '${slugOrId}' not found`);
        }
        
        // Hide inactive/draft from public
        if (!canViewInactive && test.status && test.status !== 'ACTIVE') {
          return error.notFound(`Test '${slugOrId}' not found`);
        }
        
        return success(test);
      }

      const allItems = await testRepo.getCatalog();
      let filteredItems = allItems;
      
      // Public view filters to ACTIVE only. Treat missing status as ACTIVE for legacy.
      if (!canViewInactive) {
        filteredItems = allItems.filter(item => !item.status || item.status === 'ACTIVE');
      }

      if (queryParams.q) {
        const query = queryParams.q.toLowerCase().trim();
        filteredItems = filteredItems.filter(
          (item) =>
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.tag && item.tag.toLowerCase().includes(query)) ||
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
    logger.error('Error handling test request', { error: err.message, stack: err.stack });
    return error.serverError('Internal server error');
  }
};
