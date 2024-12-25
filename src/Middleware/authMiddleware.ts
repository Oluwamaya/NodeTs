// src/middleware/authMiddleware.ts

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../Models/model';
import pool from '../Config/database';

const JWT_SECRET = process.env.JWT_SECRET || ""; 
console.log(JWT_SECRET)// JWT secret key

// Middleware to hash the user's password
export const hashPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ message: "Password is required." });
      return;
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Attach the hashed password to the request object
    req.body.hashedPassword = hashedPassword;

    next(); // Move to the next middleware or controller
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ message: "Error hashing password" });
  }
};

export const generateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  // Check for missing email or password
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  try {
    // Find user by email
    const user = await UserModel.findByEmail(email);

    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Verify the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Token expiry time
    );

    // Save token and expiry time in the database
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    await UserModel.saveToken(user.id, token, tokenExpiry);

    // Attach the token to the response
    res.locals.token = token;
    res.locals.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next(); // Proceed to the next middleware or controller
  } catch (error: any) {
    console.error("Error generating token:", error.message);
    res.status(500).json({ message: "An error occurred during token generation." });
  }
};


export const validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
 console.log(req.headers.authorization)
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token is required." });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Check token validity in the database
    const [rows]: any = await pool.execute(
      "SELECT * FROM tokens WHERE userId = ? AND token = ? AND token_expiry > ?",
      [decoded.id, token, new Date()]
    );

    if (!rows.length) {
      res.status(401).json({ message: "Invalid or expired token." });
      return;
    }

    res.locals.user = rows[0]; // Attach user details to locals
    next();
  } catch (error : any) {
    console.error("Token validation error:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

