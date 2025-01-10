import express from "express";
import dotenv from "dotenv";
import pool from "./src/Config/database";
import userRouter from "./src/Router/Router";
import { logger, requestLogger, errorHandler } from "./src/Core/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Logger for incoming requests
app.use(requestLogger);

// Routes
app.use("/api", userRouter);

app.get("/", (req, res) => {
  res.send("Maya is here");
});

// Global error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, async () => {
  try {
    logger.info(`Server is starting on port ${port}`);
    await pool; // Ensuring database pool connection is active
    logger.info("Database connection established successfully");
    logger.info(`Server is running on port ${port}`);
  } catch (error) {
    logger.error("Error starting the server: ", error);
    process.exit(1); // Exit the process if server startup fails
  }
});

// Graceful shutdown logic to handle process termination
process.on("SIGINT", async () => {
  logger.info("Shutting down server gracefully...");
  try {
    await pool.end(); // Close the database connection gracefully
    logger.info("Database connection closed successfully");
    process.exit(0); // Exit the process
  } catch (error) {
    logger.error("Error during shutdown: ", error);
    process.exit(1);
  }
});
