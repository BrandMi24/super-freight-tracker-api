// utils/logger.js
import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const extra =
    meta && Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
  return `[${timestamp}] ${level}: ${message}${extra}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), logFormat),
  transports: [
    // consola con colores
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
    // archivo (opcional)
    new winston.transports.File({
      filename: "logs/scraper.log",
      level: "info",
    }),
  ],
});

export default logger;
