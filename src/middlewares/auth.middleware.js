import User from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
        if(!token){
            throw new ApiError(400,"Unauthorised request")
        }
    
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)    
    
        const userr =await User.findById(decodeToken?._id).select("-password -refreshToken")
        if(!userr){
            throw new ApiError(400,"Invalid Access token")
        }
        req.user=userr;
        next()
    } catch (error) {
        throw new ApiError(401,"invalid access token")
    }

})

export default verifyJWT;