"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInfo = exports.getUserDashboard = exports.signIn = exports.signupUser = void 0;
const userModel_1 = require("../Models/userModel");
const authMiddleware_1 = require("../Middleware/authMiddleware");
const cloudinaryConfig_1 = __importDefault(require("../Utils/cloudinaryConfig"));
const logger_1 = require("../Core/logger");
const signupUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role, gender } = req.body;
        // Validate input data
        if (!firstname || !lastname || !email || !password || !role) {
            logger_1.logger.warn("Sign-Up Validation Failed: Missing required fields.", { firstname, lastname, email, role });
            res.status(400).json({ message: "Please provide all required fields." });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            logger_1.logger.warn("Invalid Email Format Provided", { email });
            res.status(400).json({ message: "Invalid email format." });
            return;
        }
        // Validate allowed roles
        const allowedRoles = ["admin", "staff"];
        if (!allowedRoles.includes(role)) {
            logger_1.logger.warn("Invalid Role Provided", { role });
            res.status(400).json({ message: "Invalid role. Allowed roles are 'admin' or 'staff'." });
            return;
        }
        // Restrict multiple admin registrations
        if (role === "admin") {
            const existingAdmin = await userModel_1.UserModel.findByRole("admin");
            if (existingAdmin) {
                logger_1.logger.warn("Admin Registration Attempted When Admin Already Exists.");
                res.status(400).json({ message: "An admin account already exists." });
                return;
            }
        }
        // Check if the user already exists
        const existingUser = await userModel_1.UserModel.findByEmail(email);
        if (existingUser) {
            logger_1.logger.warn("Sign-Up Attempt with Existing Email", { email });
            res.status(400).json({ message: "Email already exists." });
            return;
        }
        // Hash the password using middleware
        (0, authMiddleware_1.hashPassword)(req, res, async () => {
            const hashedPassword = req.body.hashedPassword;
            const profilePic = "https://i.pinimg.com/474x/18/b5/b5/18b5b599bb873285bd4def283c0d3c09.jpg"; // Default profile picture URL
            // Create the user with the hashed password
            const newUser = await userModel_1.UserModel.create(firstname, lastname, email, hashedPassword, role, profilePic, gender);
            logger_1.logger.info("User Created Successfully", { userId: newUser.id, email: newUser.email });
            res.status(201).json({ message: "User created successfully", user: newUser });
        });
    }
    catch (error) {
        logger_1.logger.error("Sign-Up Error", { error: error.message });
        res.status(500).json({ message: "An error occurred during sign-up." });
    }
};
exports.signupUser = signupUser;
const signIn = async (req, res) => {
    try {
        const token = res.locals.token;
        const user = res.locals.user;
        if (!token || !user) {
            logger_1.logger.warn("Sign-In Failed: Missing Token or User Details.");
            res.status(500).json({ message: "Token or user details are missing. Please try again." });
            return;
        }
        logger_1.logger.info("Sign-In Successful", { userId: user.id, email: user.email });
        res.status(200).json({
            message: "Sign-in successful.",
            token,
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Sign-In Error", { error: error.message });
        res.status(500).json({ message: "An error occurred during sign-in. Please try again later." });
    }
};
exports.signIn = signIn;
const getUserDashboard = async (req, res) => {
    const user = res.locals.user;
    logger_1.logger.info("Dashboard Accessed", { userId: user.id, email: user.email });
    res.status(200).json({
        message: "Welcome to your dashboard!",
        user,
    });
};
exports.getUserDashboard = getUserDashboard;
const updateInfo = async (req, res) => {
    try {
        const { profilePic, firstname, lastname, gender, id } = req.body;
        const { userId: requesterId, role: requesterRole } = res.locals.user;
        if (!id) {
            logger_1.logger.warn("Update Info Failed: Missing User ID.", { requesterId });
            res.status(400).json({ error: "User ID is required" });
            return;
        }
        if (requesterRole === "staff" && (firstname || lastname || gender)) {
            logger_1.logger.warn("Unauthorized Update Attempt by Staff", { requesterId });
            res.status(403).json({ error: "Staff can only update their profile picture." });
            return;
        }
        let uploadedImageUrl = profilePic;
        if (profilePic) {
            const uploadResult = await cloudinaryConfig_1.default.uploader.upload(profilePic, {
                folder: "user_profiles",
                transformation: [{ width: 300, height: 300, crop: "limit" }],
            });
            uploadedImageUrl = uploadResult.secure_url;
            logger_1.logger.info("Profile Picture Uploaded", { userId: requesterId, imageUrl: uploadedImageUrl });
        }
        const updatedFields = { profilePic: uploadedImageUrl };
        if (requesterRole === "admin") {
            updatedFields.firstname = firstname;
            updatedFields.lastname = lastname;
            updatedFields.gender = gender;
        }
        const updatedUser = await userModel_1.UserModel.updateUserInfo(id, updatedFields);
        if (!updatedUser) {
            logger_1.logger.warn("Update Failed: User Not Found or Not Updated", { id });
            res.status(404).json({ error: "User not found or not updated" });
            return;
        }
        logger_1.logger.info("User Information Updated Successfully", { userId: id, updatedFields });
        res.status(200).json({
            message: "User information updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        logger_1.logger.error("Error Updating User Info", { error: error.message });
        res.status(500).json({ error: `Error updating user info: ${error.message}` });
    }
};
exports.updateInfo = updateInfo;
//# sourceMappingURL=userController.js.map