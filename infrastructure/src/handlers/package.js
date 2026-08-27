const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const packageRepo = require('../repositories/dynamo-package');

exports.handler = async (event) => {
  logger.info('Incoming package request', {
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
      if (slug === 'featured') {
        const featured = await packageRepo.getFeaturedPackages();
        return success({ data: featured });
      }
      if (slug === 'benefits') {
        const benefits = await packageRepo.getBenefits();
        return success({ data: benefits });
      }
      if (slug === 'process') {
        const process = await packageRepo.getProcessSteps();
        return success({ data: process });
      }

      const pkg = await packageRepo.getBySlug(slug);
      if (!pkg) {
        return error.notFound(`Package '${slug}' not found`);
      }
      return success(pkg);
    }

    if (queryParams.q) {
      const allItems = await packageRepo.getCatalog();
      const lowerQuery = queryParams.q.toLowerCase().trim();
      const results = allItems.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
          (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
          (item.tag && item.tag.toLowerCase().includes(lowerQuery)) ||
          (item.category && item.category.toLowerCase().includes(lowerQuery))
      );
      
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

    const allItems = await packageRepo.getCatalog();
    const total = allItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = allItems.slice(start, start + limit);

    return success({
      data,
      meta: { total, page, limit, totalPages },
    });
  } catch (err) {
    logger.error('Error handling package request', { error: err.message, stack: err.stack });
    return error.serverError('Internal server error');
  }
};
