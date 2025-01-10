"use strict";
// src/middleware/authMiddleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.generateToken = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../Models/userModel");
const database_1 = __importDefault(require("../Config/database"));
const JWT_SECRET = process.env.JWT_SECRET || "";
// Middleware to hash the user's password
const hashPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) {
            res.status(400).json({ message: "Password is required." });
            return;
        }
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Attach the hashed password to the request object
        req.body.hashedPassword = hashedPassword;
        next(); // Move to the next middleware or controller
    }
    catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ message: "Error hashing password" });
    }
};
exports.hashPassword = hashPassword;
const generateToken = async (req, res, next) => {
    const { email, password } = req.body;
    // Check for missing email or password
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." });
        return;
    }
    try {
        // Find user by email
        const user = await userModel_1.UserModel.findByEmail(email);
        if (!user) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        // Verify the hashed password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        // Generate JWT token
        const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 1 min from now
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, exp: Math.floor(tokenExpiry.getTime() / 1000) }, // Payload with expiry
        JWT_SECRET // Secret key
        );
        // Save token and expiry time in the database
        await userModel_1.UserModel.saveToken(user.id, token, tokenExpiry);
        // Attach the token to the response
        res.locals.token = token;
        res.locals.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
        };
        next(); // Proceed to the next middleware or controller
    }
    catch (error) {
        console.error("Error generating token:", error.message);
        res.status(500).json({ message: "An error occurred during token generation." });
    }
};
exports.generateToken = generateToken;
const validateToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Token is required." });
        return;
    }
    try {
        // Decode and verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const now = new Date();
        // Check token validity in the database
        const [rows] = await database_1.default.execute("SELECT * FROM tokens WHERE userId = ? AND token = ? AND token_expiry > ?", [decoded.id, token, now.toISOString()]);
        if (!rows.length) {
            res.status(401).json({ message: "Invalid or expired token in the database." });
            return;
        }
        const [fetchInfo] = await database_1.default.execute("SELECT * FROM users WHERE id = ?  ", [rows[0].userId]);
        if (!fetchInfo) {
            res.status(404).send({ message: "User Not found", status: false });
            return;
        }
        // Attach user details to locals
        res.locals.user = fetchInfo[0];
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ message: "JWT token has expired." });
            console.log(error.message);
        }
        else {
            console.error("Token validation error:", error.message);
            res.status(401).json({ message: "Invalid or expired token." });
        }
    }
};
exports.validateToken = validateToken;
//# sourceMappingURL=authMiddleware.js.map