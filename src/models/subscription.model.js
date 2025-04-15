import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        channel:{                           //one to who subscriber is subscribing
            type:mongoose.Schema.ObjectId,
            ref: "User",
            required:true,
        },
        subscriber:{                        //One who is subscribing
            type:mongoose.Schema.Types,
            ref: "User",
            required:true,
            default:0
        }

    },{Timestamps:true})


export const Subscription = mongoose.model("Subscription" , subscriptionSchema)