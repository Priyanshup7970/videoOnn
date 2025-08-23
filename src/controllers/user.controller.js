import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"


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
   console.log("email",email);
   if(
    [fullName,email,username,password].some((field) => field?.trim() == "")
   ){
    throw new ApiError(400,"All fileds are required")
   }

//    if(fullName == ""){
//         throw new ApiError(400,"fullName is required")
//    }

   const existedUser = User.findOne({
    $or: [{username},{email}]
    })

    if (existedUser){
        throw new ApiError(409, "User with email or username already exist ")
    }

    req.files?.avatar


}) 


export { 
    registerUser,

}
