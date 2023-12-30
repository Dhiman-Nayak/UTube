import mongoose, { Schema } from "mongoose";

const userSchema= new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        // lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,    //cloudinary url
        required:true,        
    },
    coverImage:{
        type:String,
        // required:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],

    },
    refreshToken:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],

},{timestamps:true})

export default User=mongoose.model("User",userSchema)