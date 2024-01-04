import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import  User  from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    const { userName, fullName, email, password } = req.body;

    if (
        [userName, fullName, email, password].some((f) => {
            f?.trim() === "";
        })
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // const existingEmail = User.findOne({
    //     $or:[{email},{userName}]
    // })
    // if (existingEmail){
    //     throw new ApiError(409,"")
    // }
    const existingEmail =await User.findOne({ email });
    if (existingEmail) {
        throw new ApiError(409, "Email already exist");
    }
    const existingUserName =await User.findOne({ email });
    if (existingUserName) {
        throw new ApiError(409, "username already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Profile pic is required");
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    if (coverImageLocalPath) {
        const coverImage = await uploadCloudinary(coverImageLocalPath);
    }

    if (!avatar) {
        throw new ApiError(400, "Profile pic is requiredd");
    }

    const user=await User.create({ 
        fullName, 
        userName, 
        password, 
        email,
        avatar:avatar.url,
        coverImage: coverImage?.url || "" 
    });

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(400,"something went wrong")
    }

    return res.status(201).json(
        new ApiError(200,createdUser,"user registered successfully")
    )

});

const login=asyncHandler(async (req,res)=>{
    const {email,password}=req.body;
    const existingEmail =await User.findOne({ email });
    return res.status(200).json({massage:"successfullt logged in"})

})
export { registerUser ,login};
