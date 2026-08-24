/**
 * Standardized HTTP Response Utilities for Agam Lambda Handlers.
 */

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify({ success: true, data }),
  };
}

function error(statusCode, code, message) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify({
      success: false,
      error: { code, message },
    }),
  };
}

error.badRequest = (message = 'Bad Request') => error(400, 'BAD_REQUEST', message);
error.unauthorized = (message = 'Unauthorized') => error(401, 'UNAUTHORIZED', message);
error.forbidden = (message = 'Forbidden') => error(403, 'FORBIDDEN', message);
error.notFound = (message = 'Not Found') => error(404, 'NOT_FOUND', message);
error.serverError = (message = 'Internal Server Error') => error(500, 'INTERNAL_ERROR', message);

module.exports = {
  HEADERS,
  success,
  error,
};
