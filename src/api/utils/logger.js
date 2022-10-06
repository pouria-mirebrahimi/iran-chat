require("winston-daily-rotate-file");
const config = require("config");
const winston = require("winston");
const moment = require("moment-timezone");

const { combine, timestamp, label, printf } = winston.format;

const appendTimestamp = () => moment().tz(opts.tz).format();

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  defaultMeta: { service: "user-service" },

  format: combine(
    label({ label: config.get("Logging.label") }),
    // timestamp(),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      level: config.get("Logging.level"),
      colorize: true,
    }),

    //new files will be generated each day, the date patter indicates the frequency of creating a file.
    new winston.transports.DailyRotateFile({
      name: "error-log",
      filename: "logs/errors/errors.log",
      level: "error",
      prepend: true,
      frequency: "1m",
      maxSize: "20m",
      maxFiles: "900d",
    }),
    new winston.transports.DailyRotateFile({
      name: "combined-log",
      filename: "logs/combined/combined.log",
      level: "debug",
      prepend: true,
      frequency: "1m",
      maxSize: "20m",
      maxFiles: "90d",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: "logs/exceptions/exceptions.log",
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: "logs/rejections/rejections.log",
    }),
  ],
  exitOnError: false,
});

// var logger = winston.loggers.get("logger");
module.exports = logger;
