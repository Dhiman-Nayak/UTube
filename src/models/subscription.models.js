import mongoose from "mongoose";

const subscriptionSchema=mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)