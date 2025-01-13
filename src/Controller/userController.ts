import { Request, Response } from 'express';
import { UserModel } from '../Models/userModel';
import { hashPassword, generateToken } from '../Middleware/authMiddleware';
import cloudinary from '../Utils/cloudinaryConfig';
import { logger } from '../Core/logger';

import { signInSchema, signupSchema, updateInfoSchema } from '../Middleware/ValidationSchema';




export const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data with Joi
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      logger.warn("Sign-Up Validation Failed", { details: error.details });
      res.status(400).json({ message: error.message });
      return;
    }

    const { firstname, lastname, email, password, role, gender } = value;

    // Restrict multiple admin registrations
    if (role === "admin") {
      const existingAdmin = await UserModel.findByRole("admin");
      if (existingAdmin) {
        logger.warn("Admin Registration Attempted When Admin Already Exists.");
        res.status(400).json({ message: "An admin account already exists." });
        return;
      }
    }

    // Check if the user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      logger.warn("Sign-Up Attempt with Existing Email", { email });
      res.status(400).json({ message: "Email already exists." });
      return;
    }

    // Hash the password using middleware
    hashPassword(req, res, async () => {
      const hashedPassword = req.body.hashedPassword;
      const profilePic = "https://i.pinimg.com/474x/18/b5/b5/18b5b599bb873285bd4def283c0d3c09.jpg"; // Default profile picture URL

      const newUser = await UserModel.create(firstname, lastname, email, hashedPassword, role, profilePic, gender);

      logger.info("User Created Successfully", { userId: newUser.id, email: newUser.email });
      res.status(201).json({ message: "User created successfully", status : true });
    });
  } catch (error: any) {
    logger.error("Sign-Up Error", { error: error.message });
    res.status(500).json({ message: "An error occurred during sign-up." });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data with Joi
    const { error, value } = signInSchema.validate(req.body);
    if (error) {
      logger.warn("Sign-In Validation Failed", { details: error.details });
      res.status(400).json({ message: error.message });
      return;
    }

    const token = res.locals.token;
    const user = res.locals.user;

    if (!token || !user) {
      logger.warn("Sign-In Failed: Missing Token or User Details.");
      res.status(500).json({ message: "Token or user details are missing. Please try again." });
      return;
    }

    logger.info("Sign-In Successful", { userId: user.id, email: user.email });
    res.status(200).json({
      message: "Sign-in successful.",
      token,
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
      },
    });
  } catch (error: any) {
    logger.error("Sign-In Error", { error: error.message });
    res.status(500).json({ message: "An error occurred during sign-in. Please try again later." });
  }
};

export const getUserDashboard = async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  logger.info("Dashboard Accessed", { userInfo : user});
  res.status(200).json({
    message: "Welcome to your dashboard!",
    user,
  });
};


export const updateInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data with Joi
    const { error, value } = updateInfoSchema.validate(req.body);
    if (error) {
      logger.warn("Update Info Validation Failed", { details: error.details });
      res.status(400).json({ message: error.message });
      return;
    }

    const { id, profilePic, firstname, lastname, gender } = value;
    const { userId: requesterId, role: requesterRole } = res.locals.user;

    if (requesterRole === "staff" && (firstname || lastname || gender)) {
      logger.warn("Unauthorized Update Attempt by Staff", { requesterId });
      res.status(403).json({ error: "Staff can only update their profile picture." });
      return;
    }

    let uploadedImageUrl = profilePic;
    if (profilePic) {
      const uploadResult = await cloudinary.uploader.upload(profilePic, {
        folder: "user_profiles",
        transformation: [{ width: 300, height: 300, crop: "limit" }],
      });
      uploadedImageUrl = uploadResult.secure_url;
      logger.info("Profile Picture Uploaded", { userId: requesterId, imageUrl: uploadedImageUrl });
    }

    const updatedFields: any = { profilePic: uploadedImageUrl };
    if (requesterRole === "admin") {
      updatedFields.firstname = firstname;
      updatedFields.lastname = lastname;
      updatedFields.gender = gender;
    }

    const updatedUser = await UserModel.updateUserInfo(id, updatedFields);
    if (!updatedUser) {
      logger.warn("Update Failed: User Not Found or Not Updated", { id });
      res.status(404).json({ error: "User not found or not updated" });
      return;
    }

    logger.info("User Information Updated Successfully", { userId: id, updatedFields });
    res.status(200).json({
      message: "User information updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    logger.error("Error Updating User Info", { error: error.message });
    res.status(500).json({ error: `Error updating user info: ${error.message}` });
  }
};
