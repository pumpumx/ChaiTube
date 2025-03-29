
import dotenv from "dotenv"
import connectDB from "./db/connection.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(()=>{
    try {
        app.listen(process.env.PORT || 8000 , ()=>{
            console.log(`Server is running at port${process.env.PORT} `)
        })
    } catch (error) {
        console.log("App listening ERROR:: " , err)
    }
})
.catch((err) => {
    console.log("MongoDB ERROR:: Connection Failed", err)
})