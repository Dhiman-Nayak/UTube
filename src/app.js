import express, { urlencoded }  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config({path:"./env"});

const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}));

app.use(express.json({limit:"16Kb"}));
app.use(express.urlencoded({extended:true,limit:"16Kb"}));
app.use(express.static("public"));
app.use(cookieParser())

//routes
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users",userRouter)





export {app};