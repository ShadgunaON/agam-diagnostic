const { extractIdentity, isAdmin, isStaff, canAccessNotification, canCreateNotification } = require('../shared/auth');
const { success, error } = require('../shared/response');
const { logger } = require('../shared/logger');
const notificationRepo = require('../repositories/dynamo-notification');

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
    const notificationId = pathParameters.notificationId || (segments.length > 0 && segments[0] !== 'notifications' ? segments[0] : undefined);
    const action = segments.length > 1 ? segments[1] : undefined;
    const queryStringParameters = event.queryStringParameters || {};

    switch (event.httpMethod) {
      case 'GET': {
        // Individual notification lookup by ID
        if (notificationId && notificationId !== 'read') {
          const notification = await notificationRepo.getById(notificationId);
          if (!notification) {
            return error.notFound('Notification not found');
          }
          if (!(await canAccessNotification(identity, notification))) {
            return error.forbidden('Access denied: Cannot view foreign notification.');
          }
          return success(notification);
        }

        // List notifications
        const requestedUserId = queryStringParameters.userId;
        let targetUserId = identity.sub;

        if (requestedUserId) {
          if ((await isAdmin(identity)) || (await isStaff(identity))) {
            const { hasPermission } = require('../shared/auth');
            if (!(await hasPermission(identity, 'notifications', 'view'))) {
              return error.forbidden('Access denied: Missing notifications.view permission');
            }
            targetUserId = requestedUserId;
          } else {
            // Check if requested userId belongs to caller
            const isSelf =
              requestedUserId === identity.sub ||
              requestedUserId === identity.primaryPatientId ||
              requestedUserId === identity.username ||
              requestedUserId === `pat_${identity.sub}`;

            if (!isSelf) {
              return error.forbidden('Access denied: Cannot query notifications for foreign user.');
            }
            targetUserId = requestedUserId;
          }
        } else {
          // Default to caller identity
          targetUserId = identity.sub || identity.username;
        }

        const notifications = await notificationRepo.getByUserId(targetUserId);
        return success(notifications);
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}');

        if (!(await canCreateNotification(identity, body))) {
          return error.forbidden('Access denied: Unauthorized to create notifications for target recipient.');
        }

        const notificationData = {
          ...body,
          userId: body.userId || identity.sub,
          ownerSub: body.ownerSub || body.userId || identity.sub,
          createdBy: identity.sub,
        };

        const newNotification = await notificationRepo.create(notificationData);
        return success(newNotification, 201);
      }

      case 'PUT': {
        if (!notificationId) {
          return error.badRequest('Missing notificationId in path');
        }

        const existingNotification = await notificationRepo.getById(notificationId);
        if (!existingNotification) {
          return error.notFound('Notification not found');
        }

        if (!(await canAccessNotification(identity, existingNotification))) {
          return error.forbidden('Access denied: Cannot modify foreign notification.');
        }

        const body = JSON.parse(event.body || '{}');
        const isReadRequest = action === 'read' || event.path.endsWith('/read') || body.isRead === true;

        if (isReadRequest) {
          const result = await notificationRepo.markAsRead(notificationId);
          return success(result);
        }

        return error.badRequest('Unsupported PUT route for notifications');
      }

      default:
        return error.badRequest(`Unsupported method: ${event.httpMethod}`);
    }
  } catch (err) {
    logger.error('Error processing notification request', err);
    return error.serverError('Internal Server Error');
  }
};
