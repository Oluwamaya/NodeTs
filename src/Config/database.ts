import mysql from 'mysql2/promise'

import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
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
    } catch (error : any) {
        console.error("Error connecting to the database:", error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("Access denied! Check your username and password.");
        }
    }
};

// Test the connection on initialization
testConnection();

export default pool