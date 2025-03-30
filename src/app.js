import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN , 
    credentials: true
}))

app.use(express.json({
    limit:"16kb",
}))
app.use(express.urlencoded({
    extended: true,
    limit:"16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

<<<<<<< HEAD
=======
//Importing Routers , Good practice to import all router down , helps in file seggregation
import userRouter from './routes/user.routes.js'
app.use("/api/vi/users" , userRouter) 

>>>>>>> 4a81c8a (Repo reinitialised)
export default app