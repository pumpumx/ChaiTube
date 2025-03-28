import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";  //Production grade approach


const connectDB = async ()=> {
    try {
        const mongoURI = `${process.env.MONGODB_URL}/${DB_NAME}`
        const connectionInstance = await mongoose.connect(mongoURI)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    }  catch (error) {
        console.log("Mongo DB Connect ERROR :: ",error)
        process.exit(1)
    }
}

export default connectDB ;