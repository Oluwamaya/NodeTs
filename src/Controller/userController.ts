// src/controllers/authController.ts

import { Request, Response } from 'express';
import { UserModel } from '../Models/userModel';
import { hashPassword, generateToken } from '../Middleware/authMiddleware';
import { promises } from 'dns';
import cloudinary from '../Utils/cloudinaryConfig';
import { profile } from 'console';

export const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstname,lastname, email, password, role , gender } = req.body;

    // Validate input data
    if (!firstname || !lastname || !email || !password || !role) {
      res.status(400).json({ message: "Please provide all required fields." });
      return;
    }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Invalid email format." });
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
      const profilePic = "https://i.pinimg.com/474x/18/b5/b5/18b5b599bb873285bd4def283c0d3c09.jpg"; // Set a default profile picture URL
     

      // Create the user with the hashed password
      const newUser = await UserModel.create(firstname ,lastname, email, hashedPassword, role , profilePic ,gender);

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
       
        firstname: user.firstname, 
        lastname: user.lastname, 
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
   user
  });
};



export const updateInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body);
    
    const { profilePic, firstname, lastname, gender, id } = req.body;
    console.log(res.locals.user);
    
    const { userId: requesterId, role: requesterRole } = res.locals.user; 


    // Validate ID field
    if (!id) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Enforce role-based permissions
    // if (requesterRole === "staff" && requesterId !== id) {
    //   res.status(403).json({ error: "Access denied. Staff can only update their own profile." });
    //   return;
    // }

    if (requesterRole === "staff" && (firstname || lastname || gender)) {
      res.status(403).json({ error: "Staff can only update their profile picture." });
      return;
    }

    let uploadedImageUrl = profilePic;

    if (profilePic) {
      // Upload new profile picture if provided
      const uploadResult = await cloudinary.uploader.upload(profilePic, {
        folder: "user_profiles",
        transformation: [{ width: 300, height: 300, crop: "limit" }],
      });
      uploadedImageUrl = uploadResult.secure_url;
    }

    const updatedFields: any = { profilePic: uploadedImageUrl };

    if (requesterRole === "admin") {
      // Admins can update all fields
      updatedFields.firstname = firstname;
      updatedFields.lastname = lastname;
      updatedFields.gender = gender;
      // updatedFields.profilePic = profilePic
    }

    // Perform the update
    const updatedUser = await UserModel.updateUserInfo(id, updatedFields);

    if (!updatedUser) {
      res.status(404).json({ error: "User not found or not updated" });
      return;
    }

    res.status(200).json({
      message: "User information updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: `Error updating user info: ${error.message}` });
  }
};

