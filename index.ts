import  express  from "express";
const app = express()
import  dotenv from "dotenv"

dotenv.config()

const port  = process.env.port  ;

app.use(express.json())

app.get("/", (req , res) =>{
    res.send("maya is here")
})

app.listen(port, () =>{
 console.log(`Server is running on port ${port}`);
 
})