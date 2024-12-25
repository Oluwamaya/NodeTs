import express from 'express'
import {  getUserDashboard, signIn, signupUser } from '../Controller/userController'
import { generateToken, validateToken } from '../Middleware/authMiddleware'


const userRouter = express.Router()

userRouter.get("/dboy" , (req,res)=>{
    res.send("router page connected")
})

userRouter.post("/register", signupUser);

userRouter.post("/signIn" , generateToken , signIn)

userRouter.get("/getUserInfo" , validateToken , getUserDashboard)

export default userRouter