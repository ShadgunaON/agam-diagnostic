const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const testRepo = require('../repositories/dynamo-test');

/**
 * TestFunction — public read-only catalog handler.
 *
 * Routes (all public, no Cognito auth required):
 *   GET /api/tests              → paginated catalog list
 *   GET /api/tests?q=<query>    → search within catalog
 *   GET /api/tests/{slug}       → single test detail by slug
 *
 * Authorization:
 *   Catalog reads are public — no identity is required.
 *   Write operations (create/update/delete) are NOT exposed via this handler.
 *   Catalog management is performed via the seed script or a future Admin API.
 *
 * Response envelope (matches all other Agam Lambda handlers):
 *   { success: true, data: <payload> }         — 200
 *   { success: false, error: { code, message } } — 4xx/5xx
 *
 * Pagination:
 *   Accepts ?page=<n>&limit=<n> query parameters.
 *   Returns { data: [...], meta: { total, page, limit, totalPages } }.
 */
exports.handler = async (event) => {
  logger.info('Incoming test request', {
    httpMethod: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
    queryStringParameters: event.queryStringParameters,
  });

  const method = event.httpMethod;

  // Only GET is supported — catalog is read-only via API
  if (method !== 'GET') {
    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed');
  }

  try {
    const proxy = event.pathParameters?.proxy || '';
    const segments = proxy.split('/').filter(Boolean);
    const slug = segments[0] ? decodeURIComponent(segments[0]) : null;
    const queryParams = event.queryStringParameters || {};

    // ----------------------------------------------------------------
    // GET /api/tests/{slug}  →  single test detail
    // ----------------------------------------------------------------
    if (slug) {
      const test = await testRepo.getBySlug(slug);
      if (!test) {
        return error.notFound(`Test '${slug}' not found`);
      }
      return success(test);
    }

    // ----------------------------------------------------------------
    // GET /api/tests?q=<query>  →  search
    // ----------------------------------------------------------------
    if (queryParams.q) {
      const results = await testRepo.searchTests(queryParams.q);
      return success({
        data: results,
        meta: {
          total: results.length,
          page: 1,
          limit: results.length,
          totalPages: 1,
        },
      });
    }

    // ----------------------------------------------------------------
    // GET /api/tests  →  paginated catalog list
    // ----------------------------------------------------------------
    const page = Math.max(1, parseInt(queryParams.page || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(queryParams.limit || '100', 10)));

    const allItems = await testRepo.getCatalog();
    const total = allItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = allItems.slice(start, start + limit);

    return success({
      data,
      meta: { total, page, limit, totalPages },
    });
  } catch (err) {
    logger.error('Error handling test request', { error: err.message, stack: err.stack });
    return error.serverError('Internal server error');
  }
};
