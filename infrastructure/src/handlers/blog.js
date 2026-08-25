const { extractIdentity, isAdmin, canAccessBlog, hasPermission } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const blogRepo = require('../repositories/dynamo-blog');

function sanitizePublicBlog(article) {
  if (!article) return null;
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    content: article.content,
    date: article.date,
    category: article.category,
    author: article.author || 'Medical Editorial Team',
    authorId: article.authorId,
    icon: article.icon || 'fileText',
    colorPrimary: article.colorPrimary || '#3b82f6',
    colorSecondary: article.colorSecondary || '#bfdbfe',
    imageUrl: article.imageUrl || article.image || '',
    image: article.image || article.imageUrl || '',
    status: article.status || 'Published',
    views: article.views || 0,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
  };
}

exports.handler = async (event) => {
  logger.info('Incoming blog request', {
    httpMethod: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
    queryStringParameters: event.queryStringParameters,
  });

  const method = event.httpMethod;
  const identity = extractIdentity(event);

  try {
    const proxy = event.pathParameters?.proxy || '';
    const segments = proxy.split('/').filter(Boolean);
    const resourceId = segments[0] ? decodeURIComponent(segments[0]) : null;
    const isCollection = !resourceId;

    // ----------------------------------------------------
    // GET /api/blogs or GET /api/blogs/{slugOrId}
    // ----------------------------------------------------
    if (method === 'GET') {
      // 1. GET /api/blogs (Collection)
      if (isCollection) {
        const queryParams = event.queryStringParameters || {};
        const requestedStatus = queryParams.status;

        // Anonymous or Non-Admin/Non-Staff user without view permission -> Always return Published articles only
        const canManageBlogs = await hasPermission(identity, 'blogs', 'view');
        if (!canManageBlogs) {
          const publishedArticles = await blogRepo.getPublicPublished();
          return success(publishedArticles.map(sanitizePublicBlog));
        }

        // Staff/Admin access -> Can filter by status or view all
        if (requestedStatus) {
          const statusArticles = await blogRepo.getByStatus(requestedStatus);
          return success(statusArticles);
        }

        const allArticles = await blogRepo.getAll();
        return success(allArticles);
      }

      // 2. GET /api/blogs/{slugOrId}
      if (resourceId) {
        let article = await blogRepo.getBySlug(resourceId);
        if (!article) {
          article = await blogRepo.getById(resourceId);
        }

        if (!article) {
          return error.notFound('Article not found');
        }

        if (!(await canAccessBlog(identity, article))) {
          return error.notFound('Article not found or access denied');
        }

        const canManageBlogs = await hasPermission(identity, 'blogs', 'view');
        if (!canManageBlogs) {
          return success(sanitizePublicBlog(article));
        }

        return success(article);
      }
    }

    // ----------------------------------------------------
    // POST /api/blogs (Admin Only)
    // ----------------------------------------------------
    if (method === 'POST' && isCollection) {
      if (!identity) {
        return error.unauthorized('Unauthorized');
      }

      if (!(await hasPermission(identity, 'blogs', 'create'))) {
        return error.forbidden('Forbidden: Missing blogs.create permission');
      }

      let body = {};
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return error.badRequest('Invalid JSON body');
      }

      if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
        return error.badRequest('Article title is required');
      }

      // Strip forbidden/system fields
      const {
        id: _id,
        PK: _pk,
        SK: _sk,
        GSI1PK: _g1pk,
        GSI1SK: _g1sk,
        GSI2PK: _g2pk,
        GSI2SK: _g2sk,
        createdAt: _ca,
        updatedAt: _ua,
        publishedAt: _pa,
        createdBy: _cb,
        ownerSub: _os,
        ...allowedFields
      } = body;

      const newArticle = await blogRepo.create({
        ...allowedFields,
        createdBy: identity.sub,
        ownerSub: identity.sub,
        author: allowedFields.author || identity.username || 'Admin User',
        authorId: identity.sub,
      });

      return success(newArticle, 201);
    }

    // ----------------------------------------------------
    // PUT /api/blogs/{id} (Admin Only)
    // ----------------------------------------------------
    if (method === 'PUT' && resourceId) {
      if (!identity) {
        return error.unauthorized('Unauthorized');
      }

      if (!(await hasPermission(identity, 'blogs', 'edit'))) {
        return error.forbidden('Forbidden: Missing blogs.edit permission');
      }

      let body = {};
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return error.badRequest('Invalid JSON body');
      }

      let existing = await blogRepo.getById(resourceId);
      if (!existing) {
        existing = await blogRepo.getBySlug(resourceId);
      }

      if (!existing) {
        return error.notFound('Article not found');
      }

      // Strip forbidden/immutable system fields
      const {
        id: _id,
        PK: _pk,
        SK: _sk,
        GSI1PK: _g1pk,
        GSI1SK: _g1sk,
        GSI2PK: _g2pk,
        GSI2SK: _g2sk,
        createdAt: _ca,
        createdBy: _cb,
        ownerSub: _os,
        ...updates
      } = body;

      updates.updatedBy = identity.sub;

      const updated = await blogRepo.update(existing.id, updates);
      return success(updated);
    }

    // ----------------------------------------------------
    // DELETE /api/blogs/{id} (Admin Only)
    // ----------------------------------------------------
    if (method === 'DELETE' && resourceId) {
      if (!identity) {
        return error.unauthorized('Unauthorized');
      }

      if (!(await hasPermission(identity, 'blogs', 'del'))) {
        return error.forbidden('Forbidden: Missing blogs.del permission');
      }

      let existing = await blogRepo.getById(resourceId);
      if (!existing) {
        existing = await blogRepo.getBySlug(resourceId);
      }

      if (!existing) {
        return error.notFound('Article not found');
      }

      await blogRepo.delete(existing.id);
      return success({ message: 'Article deleted successfully', id: existing.id });
    }

    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed');
  } catch (err) {
    logger.error('Error handling blog request', { error: err.message, stack: err.stack });
    return error.serverError('Internal server error');
  }
};
