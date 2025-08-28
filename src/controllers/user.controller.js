import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user  = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})

        return {accessToken,refreshToken}

    }catch{
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async(req,res) =>{
   // get user detail from frontend
   // validation - not empty
   // check if user already exist:username,email
   // check for images,check for avatar
   // upload them to cloudinary,avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return response,error

   const {fullName,email ,username ,password}= req.body
   //console.log("email",email);
   if(
    [fullName,email,username,password].some((field) => field?.trim() === "")
   ){
    throw new ApiError(400,"All fileds are required")
   }

//    if(fullName == ""){
//         throw new ApiError(400,"fullName is required")
//    }

   const existedUser = await User.findOne({
    $or: [{username},{email}]
    })

    if (existedUser){
        throw new ApiError(409, "User with email or username already exist ")
    }
    //console.log("req.files =>", req.files);
    // console.log("avatarLocalPath =>", avatarLocalPath);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    //this may lead to error because we are not checking it like avatar  
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage ) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar ){
         throw new ApiError(400,"avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url ||"", //return empty if no cover image otherwise retunr cover image url
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" // this .select remove password and refreshToken to bre shown
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

}) 

const loginUser = asyncHandler(async ( req,res) =>{
    // req body-> data
    // username or email 
    // find the user
    // password check
    // access and refresh token
    // send cookies
    //successfully login
    const {email,usename,password} = req.body

    if(!username || !email) {
        throw new ApiError(400,"username or email required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user) {
        throw new ApiError(400,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401,"Invalid user credentials")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-passwrord -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged In Successfully"
        ) 
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    // get user id from req.user
    // find the user from db
    // remove refresh token from db
    // remove cookies
    // return response
// 1st method to logout user
    // const userId = req.user._id

    // const user = await User.findById(userId)

    // if(!user) {
    //     throw new ApiError(404,"User not found")
    // }

    // user.refreshToken = null
    // await user.save({validateBeforeSave: false})

    // res.clearCookie("accessToken")
    // res.clearCookie("refreshToken")

    // return res.status(200).json(
    //     new ApiResponse(200, null, "User logged out successfully")
    // )

    await User.findByIdAndUpdate(
        req.user._id,
        { 
            $set: { refreshToken: undefined}
        },
        
        {
            new: true
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
        // expires: new Date(0) // Expire the cookie immediately
    };  
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully")) 
})

const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken =req.cookies.
    refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
     )
     const user = await User.findById(decodedToken?._id)
 
     if(!user){
         throw new ApiError(401, "Invalid refresh token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh token is expired or used")
     }
 
     const options = {
         httpOnly: true,
         secure: true
     }
 
     const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken",newRefreshToken, options)
     .json(
         new ApiResponse(
             200,
             {accessToken, refreshToken:newRefreshToken},
             "Access token refreshed successfully"
         )
     )
   } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")

   }





})
export { 
    registerUser,loginUser,logoutUser,refreshAccessToken,

}
