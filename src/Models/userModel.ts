import { profile } from "console";
import pool from "../Config/database"; // import the database connection pool

export interface User {
  id: number;
  // profilePic : string 
  firstname: string;
  lastname : string;
  email: string;
  password: string;
  role: "admin" | "staff";
  profilePic : string,
  gender : string
  created_at: Date;
  updated_at: Date;
}

export interface userEdit  {
  id : number;
  profilePic : string;
  firstname :string;
  lastname : string;
  gender : string;


  
}

export class UserModel {
  static async create(firstname: string,lastname:string , email: string, password: string, role: "admin" | "staff" , profilePic : string ,gender : string): Promise<User> {
    const defaultProfilePic = "https://i.pinimg.com/474x/18/b5/b5/18b5b599bb873285bd4def283c0d3c09.jpg"; // Set a default profile picture URL
    const defaultGender = "Not specified"; 
    // Create a new user
    try {
      const [result] = await pool.execute(
        "INSERT INTO Users (firstname,lastname, email, password, role , profilePic , gender) VALUES (?,?, ?, ?, ?, ?,?)",
        [firstname,lastname, email, password, role ,defaultProfilePic ,defaultGender]
      );

      // After insertion, return the created user
      return {
        id: (result as any).insertId, // Get the auto-incremented ID
        firstname,
        lastname,
        email,
        password,
        role,
        profilePic ,
        gender,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error : any) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async updateUserInfo(id: number, data: userEdit): Promise<User | null> {
    const updates = [];
    const values = [];

    // Dynamically build the query based on provided fields
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error("No fields to update.");
    }

    values.push(id); // Add `id` as the last parameter for the WHERE clause

    try {
      const [result] = await pool.execute(
        `UPDATE Users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      if ((result as any).affectedRows > 0) {
        const [rows] = await pool.execute("SELECT * FROM Users WHERE id = ?", [id]);
        return (rows as any)[0] || null; // Return the updated user or null if not found
      }

      return null; // No rows were updated
    } catch (error: any) {
      throw new Error(`Error updating user: ${error.message}`);
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
    try {
      // Check if a token record exists for the userId
      const [rows]: any[] = await pool.execute(
        "SELECT 1 FROM tokens WHERE userId = ? LIMIT 1",
        [userId]
      );
  
      if (rows.length > 0) {
        console.log(rows);
        
        // Update the existing token record
        await pool.execute(
          "UPDATE tokens SET token = ?, token_expiry = ? WHERE userId = ?",
          [token, tokenExpiry, userId]
        );
        console.log("Token updated successfully for userId:", userId);
      } else {
        // Insert a new token record
        await pool.execute(
          "INSERT INTO tokens (userId, token, token_expiry) VALUES (?, ?, ?)",
          [userId, token,  tokenExpiry.toISOString().slice(0, 19).replace('T', ' ')]
        );
        console.log("Token created successfully for userId:", userId);
      }
    } catch (error) {
      console.error("Error saving token for userId:", userId, "\nError:", error);
      throw error; // Re-throw error for upstream handling
    }
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
