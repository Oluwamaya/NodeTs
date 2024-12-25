import pool from "../Config/database"; // import the database connection pool

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff";
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  // Create a new user
  static async create(name: string, email: string, password: string, role: "admin" | "staff"): Promise<User> {
    try {
      const [result] = await pool.execute(
        "INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role]
      );

      // After insertion, return the created user
      return {
        id: (result as any).insertId, // Get the auto-incremented ID
        name,
        email,
        password,
        role,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error : any) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  //find a user by Role
  static async findByRole(role: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute("SELECT * FROM Users WHERE role = ?", [role]);
      const user = (rows as any)[0];
      return user || null; 
    } catch (error) {
      console.error("Error in findByRole:", error);
      return null;
    }
  }
  

  // Find a user by email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute("SELECT * FROM Users WHERE email = ?", [email]);
      const user = (rows as any)[0]; // Only pick the first result (should be unique email)

      if (user) {
        return user;
      } else {
        return null;
      }
    } catch (error : any) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find a user by ID
  static async findById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute("SELECT * FROM Users WHERE id = ?", [id]);
      const user = (rows as any)[0];

      if (user) {
        return user;
      } else {
        return null;
      }
    } catch (error : any) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async saveToken(userId: number, token: string, tokenExpiry: Date): Promise<void> {
    await pool.execute(
      "UPDATE tokens SET token = ?, token_expiry = ? WHERE id = ?",
      [token, tokenExpiry, userId]
    );
  }


  


  // Update the user's password
  static async updatePassword(id: number, password: string): Promise<void> {
    try {
      await pool.execute("UPDATE Users SET password = ?, updated_at = NOW() WHERE id = ?", [
        password,
        id,
      ]);
    } catch (error : any) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  // Delete a user by ID
  static async deleteById(id: number): Promise<void> {
    try {
      await pool.execute("DELETE FROM Users WHERE id = ?", [id]);
    } catch (error : any) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}
