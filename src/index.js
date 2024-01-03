import dotenv from "dotenv";
dotenv.config({path:"./.env"})
import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})





/*
require("dotenv").config({path:"./env"})
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("Errorr" , error);
            throw error;
        });
        app.listen(`${process.env.PORT}`,()=>{
            console.log(`${process.env.PORT}`)
        })
    } catch (error) {
        console.log("Error", error)
        throw error;
    }
})()*/