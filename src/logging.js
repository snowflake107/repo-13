const { createLogger, format, transports } = require('winston');
const { combine } = format;
const logger = createLogger({
    defaultMeta: { exporter: 'logzio-nodejs-exporter' },
    format: combine(
        format.simple(),
        format.timestamp(),
        format.printf(info => `[${info.timestamp}][${info.level}] - ${info.message}`)
    ),
    transports: [new transports.Console()]
})
exports.logger = logger;
