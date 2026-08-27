const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const serviceRepo = require('../repositories/dynamo-service');

exports.handler = async (event) => {
  logger.info('Incoming service request', {
    httpMethod: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
    queryStringParameters: event.queryStringParameters,
  });

  const method = event.httpMethod;

  if (method !== 'GET') {
    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed');
  }

  try {
    const proxy = event.pathParameters?.proxy || '';
    const segments = proxy.split('/').filter(Boolean);
    const slug = segments[0] ? decodeURIComponent(segments[0]) : null;
    const queryParams = event.queryStringParameters || {};

    if (slug) {
      const service = await serviceRepo.getBySlug(slug);
      if (!service) {
        return error.notFound(`Service '${slug}' not found`);
      }
      return success(service);
    }

    if (queryParams.q) {
      const results = await serviceRepo.searchServices(queryParams.q);
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

    const page = Math.max(1, parseInt(queryParams.page || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(queryParams.limit || '100', 10)));

    const allItems = await serviceRepo.getCatalog();
    const total = allItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = allItems.slice(start, start + limit);

    return success({
      data,
      meta: { total, page, limit, totalPages },
    });
  } catch (err) {
    logger.error('Error handling service request', { error: err.message, stack: err.stack });
    return error.serverError('Internal server error');
  }
};
