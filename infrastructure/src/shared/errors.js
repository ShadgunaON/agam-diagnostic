const { error } = require('./response');
const { logger } = require('./logger');

function handleError(err) {
  logger.error('Unhandled error', err);

  if (err.name === 'ValidationError') {
    return error(400, 'INVALID_REQUEST', err.message);
  }
  if (err.name === 'UnauthorizedError') {
    return error(401, 'UNAUTHORIZED', err.message);
  }
  if (err.name === 'ForbiddenError') {
    return error(403, 'FORBIDDEN', err.message);
  }
  if (err.name === 'NotFoundError') {
    return error(404, 'NOT_FOUND', err.message);
  }
  if (err.name === 'ConflictError') {
    return error(409, 'CONFLICT', err.message);
  }
  if (err.name === 'DomainValidationError') {
    return error(422, 'DOMAIN_VALIDATION_FAILED', err.message);
  }
  return error(500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');
}

module.exports = {
  handleError,
};
