import  express  from "express";
const app = express()
import  dotenv from "dotenv"
import pool from "./src/Config/database";
import userRouter from "./src/Router/Router";


dotenv.config()

const port  = process.env.port || 3000 ;

app.use(express.json())
app.use("/api", userRouter)

app.get("/", (req , res) =>{
    res.send("maya is here")
})


app.listen(port, async () =>{
 console.log(`Server is running on port ${port}`);
 await pool
 
})

// Graceful shutdown logic to handle process termination
process.on('SIGINT', async () => {
    console.log("Shutting down server...");
    await pool.end();  // Close the database connection gracefully
    process.exit(0);   // Exit the process
});