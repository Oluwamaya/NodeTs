// src/controllers/authController.ts

import { Request, Response } from 'express';
import { UserModel } from '../Models/model';
import { hashPassword, generateToken } from '../Middleware/authMiddleware';

export const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input data
    if (!name || !email || !password || !role) {
      res.status(400).json({ message: "Please provide all required fields." });
      return;
    }

    // Validate allowed roles
    const allowedRoles = ["admin", "staff"];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role. Allowed roles are 'admin' or 'staff'." });
      return;
    }

    // Restrict multiple admin registrations
    if (role === "admin") {
      const existingAdmin = await UserModel.findByRole("admin");
      if (existingAdmin) {
        res.status(400).json({ message: "An admin account already exists." });
        return;
      }
    }

    // Check if the user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "Email already exists." });
      return;
    }

    // Hash the password using middleware
    hashPassword(req, res, async () => {
      const hashedPassword = req.body.hashedPassword;

      // Create the user with the hashed password
      const newUser = await UserModel.create(name, email, hashedPassword, role);

      // Respond with the created user
      res.status(201).json({ message: "User created successfully", user: newUser });
    });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "An error occurred during sign-up." });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve token and user details from res.locals (set by generateToken middleware)
    const token = res.locals.token;
    const user = res.locals.user;

    if (!token || !user) {
      res.status(500).json({ message: "Token or user details are missing. Please try again." });
      return;
    }

    res.status(200).json({
      message: "Sign-in successful.",
      token,
      user: {
       
        name: user.name, 
      },
    });
  } catch (error : any) {
    console.error("Error in signIn controller:", error.message);
    res.status(500).json({ message: "An error occurred during sign-in. Please try again later." });
  }
};

export const getUserDashboard = async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  res.status(200).json({
    message: "Welcome to your dashboard!",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
};