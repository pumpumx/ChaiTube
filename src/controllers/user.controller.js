import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
import fs from 'fs'

const registerUser = asyncHandler( async (req , res)=>{
        
        //Take data from user 
        //Check for data validation 
        //check if user already exits
        //Store files like avatar and cover image
        //Upload on cloudinary
        //Unlink file from server storage after uploading on cloudinary
        //Store data in database by creating userObject
        // dont return password and refreshToken back to the user 
        //Send response of user registered sucessfully 

        const {fullName ,email , userName , password} = req.body
        console.log("email ",email);
        
        if([fullName , email , userName,password].some((field)=>!field?.trim()))  {
            throw new ApiError(400 , "All fields are required") 
        }

        const userReValidation = await User.findOne({
            $or: [{email},{userName}]
        })

        if(userReValidation){
            throw new ApiError(409 , "userName or email already exists")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path
        const coverLocalPath  = req.files?.coverImage[0]?.path

        if(!avatarLocalPath) throw new ApiError(400 , "Avatar is required")

        const avatarResponse= await uploadOnCloudinary(avatarLocalPath) 
        const coverResponse = await uploadOnCloudinary(coverLocalPath)

        if(!avatarResponse) throw new ApiError(400, "Avatar not uploaded")

        const user = await User.create({
            fullName,
            avatar: avatarResponse.url,
            coverImage: coverResponse?.url || "",
            email,
            password,
            userName: userName.toLowerCase()
        })
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
       )
        if(!createdUser) throw new ApiError(500 , "Something went wrong while registering user")

        fs.unlinkSync(avatarLocalPath)
        fs.unlinkSync(coverLocalPath)

        return  res.status(201).json(
            new ApiResponse(200,createdUser , "user registered successfully")
        )
        
})
export {
    registerUser
} 