const logger = {
  info: (msg, meta = {}) => console.log(JSON.stringify({ level: 'INFO', msg, ...meta })),
  error: (msg, err = {}) => console.error(JSON.stringify({ level: 'ERROR', msg, error: err?.message, stack: err?.stack, code: err?.code })),
  warn: (msg, meta = {}) => console.warn(JSON.stringify({ level: 'WARN', msg, ...meta })),
};

module.exports = {
  logger,
};
