"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Ensures proper connection handling
    connectionLimit: 10, // Max simultaneous connections
    queueLimit: 0 // Unlimited connection queue
});
// console.log("Database configuration file loaded");
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully!");
        connection.release();
    }
    catch (error) {
        console.error("Error connecting to the database:", error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("Access denied! Check your username and password.");
        }
    }
};
// Test the connection on initialization
testConnection();
exports.default = pool;
//# sourceMappingURL=database.js.map