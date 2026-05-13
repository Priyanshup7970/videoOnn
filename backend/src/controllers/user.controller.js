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
    const {email,username,password} = req.body

    if((!username && !email) || (username && email)) {
        throw new ApiError(400,"username or email required")
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
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
    select("-password -refreshToken")

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
            $unset:{ 
                refreshToken: 1 // unset operator to remove the field from document
            }
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

const changeCurrentPassword = asyncHandler(async(req,res) =>{
    // get user id from req.user
    // get old password and new password from req.body  
    const {oldPassword,newPassword,confPassword} = req.body
    // if(!(newPassword === confPassword)){
    //     throw new ApiError(400,"New password and confirm password do not match")
    // }
    const user = await User.findById(req.user?._id)
    isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Old password is incorrect")
    }
    user.password = newPassword
    user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"Current user fetched successfully")  
    )     
})

const updateAccountDetails = asyncHandler(async(req,res) =>{
    // get user id from req.user
    // get user details from req.body   
    const {fullName,email} = req.body
    if(!fullName || !email) {
        throw new ApiError(400,"All fields are required")
    }

    // const {fullName,username,email,bio} = req.body
    // if(!fullName || !email || !username) {
    //     throw new ApiError(400,"All fields are required")
    // }
    // const updatedDetails = {}
    // if(fullName) updatedDetails.fullName = fullName
    // if(username) updatedDetails.username = username
    // if(email) updatedDetails.email = email
    // if(bio) updatedDetails.bio = bio
    // if(req.files?.avatar?.[0]?.path){
    //     const avatarLocalPath = req.files?.avatar?.[0]?.path
    //     const avatar = await uploadOnCloudinary(avatarLocalPath)
    //     if(avatar) updatedDetails.avatar = avatar.url
    // }
    // if(req.files?.coverImage?.[0]?.path){
    //     const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    //     const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //     if(coverImage) updatedDetails.coverImage = coverImage.url
    // }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                //fullName,username,email,bio
                fullName,
                email: email
            }

        },
        {new: true}
    
    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Account details updated successfully")
    )

    // const updatedUser = await User.findByIdAndUpdate(
    //     req.user._id,
    //     {
    //         $set: updatedDetails
    //     },
    //     {
    //         new: true
    //     }
    // ).select("-password -refreshToken")
    // return res
    // .status(200)
    // .json(
    //     new ApiResponse(200,updatedUser,"User details updated successfully")
    // )   
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
    // get user id from req.user
    // get avatar from req.file
    // upload avatar to cloudinary
    // update user document in db
    // return response
    const avatarLocalPath = req.file.path
    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    if(!avatar.url) {
        throw new ApiError(400,"Something went wrong while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { 
                avatar: avatar.url
            }
        },
        { new: true}
    ).select("-password") 

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )
    // now we have deleted the old avatar from cloudinary but we can also delete it from db
    // by storing the public id of the image in db while uploading it to cloudinary 
    

})

const updateUserCoverImage = asyncHandler(async(req,res) =>{
    // get user id from req.user
    // get cover image from req.file
    // upload cover image to cloudinary
    // update user document in db
    // return response
    const coverImageLocalPath = req.file.path
    if(!coverImageLocalPath) {
        throw new ApiError(400,"Cover image file is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!coverImage.url) {
        throw new ApiError(400,"Something went wrong while uploading cover image")
    }   
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { 
                coverImage: coverImage.url
            }
        },
        { new: true}
    ).select("-password")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover image updated successfully")
    )  
})

const getUserChannelProfile  = asyncHandler(async(req,res) =>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username:username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                 from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addField: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond : {
                        if: {$in: [req.user?.id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1                 
            }
        }
    ])
    console.log("channel",channel);
    if (!channel?.length) {
        throw new ApiError(404,"channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async(req,res) =>{
    // get user id from req.user
    // get watch history from user document
    // populate the video details from watch history
    // return response
    const user = await User.aggregate([
        {
        $match: {
             _id: new mongoose.Types.ObjectId(req.user._id) 
            }
        },
        {
            $lookup: { 
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id", 
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [{
                            $project: {
                                fullName: 1,
                                username:1,
                                avatar:1
                            }
                        }]
                    },
                    {
                        $addField: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ] 
            }
        },
    ])
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully")
    )

})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
}
