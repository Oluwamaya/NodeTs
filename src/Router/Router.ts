import express from 'express'
import {  getUserDashboard, signIn, signupUser, updateInfo } from '../Controller/userController'
import { generateToken, validateToken } from '../Middleware/authMiddleware'
import { upload } from '../Utils/multer'
import { uploadProduct } from '../Controller/productController'


const userRouter = express.Router()

userRouter.get("/dboy" , (req,res)=>{
    res.send("router page connected")
})

userRouter.post("/register", signupUser);

userRouter.post("/signIn" , generateToken , signIn)

userRouter.get("/getUserInfo" , validateToken , getUserDashboard)
userRouter.post("/userEdit" ,validateToken , updateInfo) 
userRouter.post("/productUpload" ,validateToken , upload.array("images", 5), uploadProduct )
export default userRouter