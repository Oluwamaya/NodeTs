import express from 'express'
const userRouter = express.Router()

userRouter.get("/dboy" , (req,res)=>{
    res.send("router page connected")
})

export default userRouter