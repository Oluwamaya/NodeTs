import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Request, Response, NextFunction } from "express";

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// Create a logger instance with Daily Rotate File
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug", // Dynamic log level
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(), // Adds color to logs
    logFormat
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m", // Max size of each log file
      maxFiles: "10d", // Keep logs for 10 days
    }),
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "10d",
    }),
  ],
});


export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(
    `Incoming request: ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)} - Query: ${JSON.stringify(req.query)}`
  );
  next();
};


export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message} - Stack: ${err.stack}`);
  res.status(500).json({ error: "An unexpected error occurred." });
};

export default { logger, requestLogger, errorHandler };
