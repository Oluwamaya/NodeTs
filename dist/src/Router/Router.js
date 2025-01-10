"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../Controller/userController");
const authMiddleware_1 = require("../Middleware/authMiddleware");
const multer_1 = require("../Utils/multer");
const productController_1 = require("../Controller/productController");
const userRouter = express_1.default.Router();
userRouter.get("/dboy", (req, res) => {
    res.send("router page connected");
});
userRouter.post("/register", userController_1.signupUser);
userRouter.post("/signIn", authMiddleware_1.generateToken, userController_1.signIn);
userRouter.get("/getUserInfo", authMiddleware_1.validateToken, userController_1.getUserDashboard);
userRouter.post("/userEdit", authMiddleware_1.validateToken, userController_1.updateInfo);
userRouter.post("/productUpload", authMiddleware_1.validateToken, multer_1.upload.array("images", 5), productController_1.uploadProduct);
exports.default = userRouter;
//# sourceMappingURL=Router.js.map