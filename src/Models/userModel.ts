import pool from "../Config/database"; // Import the database connection pool
import {logger} from "../Core/logger"; // Import the logger

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: "admin" | "staff";
  profilePic: string;
  gender: string;
  created_at: Date;
  updated_at: Date;
}

export interface userEdit {
  id: number;
  profilePic: string;
  firstname: string;
  lastname: string;
  gender: string;
}

export class UserModel {
  static async create(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    role: "admin" | "staff",
    profilePic: string,
    gender: string
  ): Promise<User> {
    const defaultProfilePic = "https://i.pinimg.com/474x/18/b5/b5/18b5b599bb873285bd4def283c0d3c09.jpg";
    const defaultGender = "Not specified";

    try {
      logger.info(`Creating a new user with email: ${email}`);
      const [result] = await pool.execute(
        "INSERT INTO Users (firstname, lastname, email, password, role, profilePic, gender) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [firstname, lastname, email, password, role, defaultProfilePic, defaultGender]
      );

      logger.info(`User created successfully with ID: ${(result as any).insertId}`);
      return {
        id: (result as any).insertId,
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
    } catch (error: any) {
      logger.error(`Error creating user with email: ${email} - ${error.message}`);
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async updateUserInfo(id: number, data: userEdit): Promise<User | null> {
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      logger.warn(`No fields provided for updating user ID: ${id}`);
      throw new Error("No fields to update.");
    }

    values.push(id);

    try {
      logger.info(`Updating user info for user ID: ${id}`);
      const [result] = await pool.execute(
        `UPDATE Users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      if ((result as any).affectedRows > 0) {
        logger.info(`User ID: ${id} updated successfully`);
        const [rows] = await pool.execute("SELECT * FROM Users WHERE id = ?", [id]);
        return (rows as any)[0] || null;
      }

      logger.warn(`No rows updated for user ID: ${id}`);
      return null;
    } catch (error: any) {
      logger.error(`Error updating user ID: ${id} - ${error.message}`);
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async findByRole(role: string): Promise<User | null> {
    try {
      logger.info(`Fetching user with role: ${role}`);
      const [rows] = await pool.execute("SELECT * FROM Users WHERE role = ?", [role]);
      const user = (rows as any)[0];
      if (user) {
        logger.info(`User found with role: ${role}`);
      } else {
        logger.warn(`No user found with role: ${role}`);
      }
      return user || null;
    } catch (error: any) {
      logger.error(`Error finding user by role: ${role} - ${error.message}`);
      throw new Error(`Error finding user by role: ${error.message}`);
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      logger.info(`Fetching user with email: ${email}`);
      const [rows] = await pool.execute("SELECT * FROM Users WHERE email = ?", [email]);
      const user = (rows as any)[0];
      if (user) {
        logger.info(`User found with email: ${email}`);
      } else {
        logger.warn(`No user found with email: ${email}`);
      }
      return user || null;
    } catch (error: any) {
      logger.error(`Error finding user by email: ${email} - ${error.message}`);
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  static async findById(id: number): Promise<User | null> {
    try {
      logger.info(`Fetching user with ID: ${id}`);
      const [rows] = await pool.execute("SELECT * FROM Users WHERE id = ?", [id]);
      const user = (rows as any)[0];
      if (user) {
        logger.info(`User found with ID: ${id}`);
      } else {
        logger.warn(`No user found with ID: ${id}`);
      }
      return user || null;
    } catch (error: any) {
      logger.error(`Error finding user by ID: ${id} - ${error.message}`);
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async saveToken(userId: number, token: string, tokenExpiry: Date): Promise<void> {
    try {
      logger.info(`Saving token for user ID: ${userId}`);
      const [rows]: any[] = await pool.execute("SELECT 1 FROM tokens WHERE userId = ? LIMIT 1", [userId]);

      if (rows.length > 0) {
        await pool.execute("UPDATE tokens SET token = ?, token_expiry = ? WHERE userId = ?", [
          token,
          tokenExpiry,
          userId,
        ]);
        logger.info(`Token updated for user ID: ${userId}`);
      } else {
        await pool.execute("INSERT INTO tokens (userId, token, token_expiry) VALUES (?, ?, ?)", [
          userId,
          token,
          tokenExpiry.toISOString().slice(0, 19).replace("T", " "),
        ]);
        logger.info(`Token created for user ID: ${userId}`);
      }
    } catch (error: any) {
      logger.error(`Error saving token for user ID: ${userId} - ${error.message}`);
      throw new Error(`Error saving token: ${error.message}`);
    }
  }

  static async updatePassword(id: number, password: string): Promise<void> {
    try {
      logger.info(`Updating password for user ID: ${id}`);
      await pool.execute("UPDATE Users SET password = ?, updated_at = NOW() WHERE id = ?", [password, id]);
      logger.info(`Password updated successfully for user ID: ${id}`);
    } catch (error: any) {
      logger.error(`Error updating password for user ID: ${id} - ${error.message}`);
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  static async deleteById(id: number): Promise<void> {
    try {
      logger.info(`Deleting user with ID: ${id}`);
      await pool.execute("DELETE FROM Users WHERE id = ?", [id]);
      logger.info(`User with ID: ${id} deleted successfully`);
    } catch (error: any) {
      logger.error(`Error deleting user with ID: ${id} - ${error.message}`);
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}
