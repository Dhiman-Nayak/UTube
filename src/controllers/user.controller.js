import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import User from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const options = {
    httpOnly: true,
    secure: true,
};

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access Token"
        );
    }
};

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
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        throw new ApiError(409, "Email already exist");
    }
    const existingUserName = await User.findOne({ email });
    if (existingUserName) {
        throw new ApiError(409, "username already exist");
    }
    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Profile pic is required");
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    let coverImagee = "";
    if (coverImageLocalPath) {
        const coverImage = await uploadCloudinary(coverImageLocalPath);
        coverImagee = coverImage.url;
    } else {
        coverImagee = "";
    }

    if (!avatar) {
        throw new ApiError(400, "Profile pic is requiredd");
    }

    const user = await User.create({
        fullName,
        userName,
        password,
        email,
        avatar: avatar.url,
        coverImage: coverImagee,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(400, "something went wrong");
    }

    return res
        .status(201)
        .json(new ApiError(200, createdUser, "user registered successfully"));
});

const login = asyncHandler(async (req, res) => {
    const { email, password, userName } = req.body;
    console.log(email,password,userName);
    // if (!userName && !email) {
    //     throw new ApiError(400, "Username or email is required");
    // }

    const user = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Password is not correct");
    }
    // console.log(existingEmail);
    // const isPasswordCorrect = await existingEmail.isPasswordCorrect(password);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // const options = {
    //     httpOnly: true,
    //     secure: true,
    // };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            
            new ApiResponse(200,{
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            "User successfully logged in")
        );
});

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        {
            new: true,
        }
    );

    

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                { },
                "User successfully logged out"
            )
        );
});

const refreshAccessTokene=asyncHandler(async(req,res)=>{
    const incomingRefreshToken= req.cookie.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorised token")
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(400, "invalid refresh token");
        }
    
        if(incomingRefreshToken !==user.refreshToken){
            throw new ApiError(400, "refresh token is expired");
        }
    
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json( 
                new ApiResponse(200,{
                    // user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "Access Token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401,"unauthorised token")
    }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    if(oldPassword === newPassword) throw new ApiError(400,"Both are same password")
    const user= await User.findById(req.user?.id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
            .status(200)
            .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

export { 
    registerUser, 
    login, 
    logout,
    refreshAccessTokene ,
    changeCurrentPassword,
    getCurrentUser,
    
};
