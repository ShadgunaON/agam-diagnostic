const { success } = require('../shared/response');
const { handleError } = require('../shared/errors');
const { logger } = require('../shared/logger');
const { extractAuthContext } = require('../shared/auth');

exports.handler = async (event) => {
  try {
    logger.info('Version check request received', { path: event.path });

    // Auth context extraction foundation
    const authContext = extractAuthContext(event);

    return success({
      service: 'agam-api',
      version: '1.0.0',
      authenticated: !!authContext,
    });
  } catch (err) {
    return handleError(err);
  }
};
