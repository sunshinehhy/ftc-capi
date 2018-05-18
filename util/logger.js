const winston = require('winston');
const logDir = process.env.LOG_DIR || '.';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: `${logDir}/cms-api-error.log`, level: 'error'}),
    new winston.transports.File({ filename: `${logDir}/cms-api-combined.log`})
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;