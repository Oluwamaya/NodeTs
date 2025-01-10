"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = __importDefault(require("../Config/database")); // Import the database connection pool
const logger_1 = require("../Core/logger"); // Import the logger
class UserModel {
    static async create(firstname, lastname, email, password, role, profilePic, gender) {
        const defaultProfilePic = "https://i.pinimg.com/474x/18/b5/b5/18b5b599bb873285bd4def283c0d3c09.jpg";
        const defaultGender = "Not specified";
        try {
            logger_1.logger.info(`Creating a new user with email: ${email}`);
            const [result] = await database_1.default.execute("INSERT INTO Users (firstname, lastname, email, password, role, profilePic, gender) VALUES (?, ?, ?, ?, ?, ?, ?)", [firstname, lastname, email, password, role, defaultProfilePic, defaultGender]);
            logger_1.logger.info(`User created successfully with ID: ${result.insertId}`);
            return {
                id: result.insertId,
                firstname,
                lastname,
                email,
                password,
                role,
                profilePic,
                gender,
                created_at: new Date(),
                updated_at: new Date(),
            };
        }
        catch (error) {
            logger_1.logger.error(`Error creating user with email: ${email} - ${error.message}`);
            throw new Error(`Error creating user: ${error.message}`);
        }
    }
    static async updateUserInfo(id, data) {
        const updates = [];
        const values = [];
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }
        if (updates.length === 0) {
            logger_1.logger.warn(`No fields provided for updating user ID: ${id}`);
            throw new Error("No fields to update.");
        }
        values.push(id);
        try {
            logger_1.logger.info(`Updating user info for user ID: ${id}`);
            const [result] = await database_1.default.execute(`UPDATE Users SET ${updates.join(", ")} WHERE id = ?`, values);
            if (result.affectedRows > 0) {
                logger_1.logger.info(`User ID: ${id} updated successfully`);
                const [rows] = await database_1.default.execute("SELECT * FROM Users WHERE id = ?", [id]);
                return rows[0] || null;
            }
            logger_1.logger.warn(`No rows updated for user ID: ${id}`);
            return null;
        }
        catch (error) {
            logger_1.logger.error(`Error updating user ID: ${id} - ${error.message}`);
            throw new Error(`Error updating user: ${error.message}`);
        }
    }
    static async findByRole(role) {
        try {
            logger_1.logger.info(`Fetching user with role: ${role}`);
            const [rows] = await database_1.default.execute("SELECT * FROM Users WHERE role = ?", [role]);
            const user = rows[0];
            if (user) {
                logger_1.logger.info(`User found with role: ${role}`);
            }
            else {
                logger_1.logger.warn(`No user found with role: ${role}`);
            }
            return user || null;
        }
        catch (error) {
            logger_1.logger.error(`Error finding user by role: ${role} - ${error.message}`);
            throw new Error(`Error finding user by role: ${error.message}`);
        }
    }
    static async findByEmail(email) {
        try {
            logger_1.logger.info(`Fetching user with email: ${email}`);
            const [rows] = await database_1.default.execute("SELECT * FROM Users WHERE email = ?", [email]);
            const user = rows[0];
            if (user) {
                logger_1.logger.info(`User found with email: ${email}`);
            }
            else {
                logger_1.logger.warn(`No user found with email: ${email}`);
            }
            return user || null;
        }
        catch (error) {
            logger_1.logger.error(`Error finding user by email: ${email} - ${error.message}`);
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }
    static async findById(id) {
        try {
            logger_1.logger.info(`Fetching user with ID: ${id}`);
            const [rows] = await database_1.default.execute("SELECT * FROM Users WHERE id = ?", [id]);
            const user = rows[0];
            if (user) {
                logger_1.logger.info(`User found with ID: ${id}`);
            }
            else {
                logger_1.logger.warn(`No user found with ID: ${id}`);
            }
            return user || null;
        }
        catch (error) {
            logger_1.logger.error(`Error finding user by ID: ${id} - ${error.message}`);
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }
    static async saveToken(userId, token, tokenExpiry) {
        try {
            logger_1.logger.info(`Saving token for user ID: ${userId}`);
            const [rows] = await database_1.default.execute("SELECT 1 FROM tokens WHERE userId = ? LIMIT 1", [userId]);
            if (rows.length > 0) {
                await database_1.default.execute("UPDATE tokens SET token = ?, token_expiry = ? WHERE userId = ?", [
                    token,
                    tokenExpiry,
                    userId,
                ]);
                logger_1.logger.info(`Token updated for user ID: ${userId}`);
            }
            else {
                await database_1.default.execute("INSERT INTO tokens (userId, token, token_expiry) VALUES (?, ?, ?)", [
                    userId,
                    token,
                    tokenExpiry.toISOString().slice(0, 19).replace("T", " "),
                ]);
                logger_1.logger.info(`Token created for user ID: ${userId}`);
            }
        }
        catch (error) {
            logger_1.logger.error(`Error saving token for user ID: ${userId} - ${error.message}`);
            throw new Error(`Error saving token: ${error.message}`);
        }
    }
    static async updatePassword(id, password) {
        try {
            logger_1.logger.info(`Updating password for user ID: ${id}`);
            await database_1.default.execute("UPDATE Users SET password = ?, updated_at = NOW() WHERE id = ?", [password, id]);
            logger_1.logger.info(`Password updated successfully for user ID: ${id}`);
        }
        catch (error) {
            logger_1.logger.error(`Error updating password for user ID: ${id} - ${error.message}`);
            throw new Error(`Error updating password: ${error.message}`);
        }
    }
    static async deleteById(id) {
        try {
            logger_1.logger.info(`Deleting user with ID: ${id}`);
            await database_1.default.execute("DELETE FROM Users WHERE id = ?", [id]);
            logger_1.logger.info(`User with ID: ${id} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error(`Error deleting user with ID: ${id} - ${error.message}`);
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=userModel.js.map