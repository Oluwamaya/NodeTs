"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./src/Config/database"));
const Router_1 = __importDefault(require("./src/Router/Router"));
const logger_1 = require("./src/Core/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware to parse JSON
app.use(express_1.default.json());
// Logger for incoming requests
app.use(logger_1.requestLogger);
// Routes
app.use("/api", Router_1.default);
app.get("/", (req, res) => {
    res.send("Maya is here");
});
// Global error handling middleware
app.use(logger_1.errorHandler);
// Start the server
app.listen(port, async () => {
    try {
        logger_1.logger.info(`Server is starting on port ${port}`);
        await database_1.default; // Ensuring database pool connection is active
        logger_1.logger.info("Database connection established successfully");
        logger_1.logger.info(`Server is running on port ${port}`);
    }
    catch (error) {
        logger_1.logger.error("Error starting the server: ", error);
        process.exit(1); // Exit the process if server startup fails
    }
});
// Graceful shutdown logic to handle process termination
process.on("SIGINT", async () => {
    logger_1.logger.info("Shutting down server gracefully...");
    try {
        await database_1.default.end(); // Close the database connection gracefully
        logger_1.logger.info("Database connection closed successfully");
        process.exit(0); // Exit the process
    }
    catch (error) {
        logger_1.logger.error("Error during shutdown: ", error);
        process.exit(1);
    }
});
//# sourceMappingURL=index.js.map