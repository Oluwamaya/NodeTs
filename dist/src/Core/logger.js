"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.requestLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const { combine, timestamp, printf, colorize } = winston_1.default.format;
// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});
// Create a logger instance with Daily Rotate File
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug", // Dynamic log level
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), colorize(), // Adds color to logs
    logFormat),
    transports: [
        new winston_1.default.transports.Console(), // Log to console
        new winston_daily_rotate_file_1.default({
            filename: "logs/error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxSize: "20m", // Max size of each log file
            maxFiles: "10d", // Keep logs for 10 days
        }),
        new winston_daily_rotate_file_1.default({
            filename: "logs/combined-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "10d",
        }),
    ],
});
const requestLogger = (req, res, next) => {
    exports.logger.info(`Incoming request: ${req.method} ${req.url} - Body: ${JSON.stringify(req.body)} - Query: ${JSON.stringify(req.query)}`);
    next();
};
exports.requestLogger = requestLogger;
const errorHandler = (err, req, res, next) => {
    exports.logger.error(`Unhandled error: ${err.message} - Stack: ${err.stack}`);
    res.status(500).json({ error: "An unexpected error occurred." });
};
exports.errorHandler = errorHandler;
exports.default = { logger: exports.logger, requestLogger: exports.requestLogger, errorHandler: exports.errorHandler };
//# sourceMappingURL=logger.js.map