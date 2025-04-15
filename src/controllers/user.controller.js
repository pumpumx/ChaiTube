import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js'
import generateAccessAndRefreshToken from '../utils/tokens.js'
import jwt from 'jsonwebtoken'
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
        console.log(req.body)
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
        const coverLocalPath  = req.files?.coverImage[0]?.path || ""

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

        return  res.status(201).json(
            new ApiResponse(200,createdUser , "user registered successfully")
        )
        
})

const loginUser = asyncHandler(async(req , res)=> {
    //Take userName || email  & password from the request body
    //Make sure the fields are not empty || data validation
    //Compare the Password and userName provided with the pass in backend
    //If both entries are correct -> generate accessToken and refreshToken
    //Assign the tokens to the user 
    //send cookie
    //redirect the user to the desired page and generate a success response
    const {userName , email ,password} = req.body;

   
    
    // if([userName ,email , password].some((field)=> field?.trim() === "")){
    //     throw new ApiError(400 , "All fields are required")
    // }

    if(!userName && !email){
        throw new ApiError(400 , "Enter username or email")
    }

    const user  = await User.findOne({  
        $or: [{email} , {userName}]
    })

    console.log("User ", user)

    if(!user){
        throw new ApiError(400 , "User Does not exist")
    }


    const passValidation = user.isPasswordCorrect(password)

    if(!passValidation){
        throw new ApiError(400 , "username or password is incorrect")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("username password email") 
    
    const options = {
        httpOnly: true ,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken , options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200 , loggedInUser , "User Logged in sucessfully")
    )
})

const logoutUser = asyncHandler(async(req , res) => {

    await User.findByIdAndUpdate(req.user._id , {
        $set: {
        refreshToken: undefined
        }   
    })

        const options = {
            httpOnly:true,
            secure:true,
        }
    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(200 , "User Logged Out Successfully")
    )

    
})

const refreshAccessToken = asyncHandler(async(req , res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401 , "No refresh Token recieved")
    }

    console.log("token:  " , incomingRefreshToken)
    const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
cook
    if(!decodedToken){
        throw new ApiError(400 , "Invalid decodedToken") 
    }

    const user = await User.findById(decodedToken._id)

    if(!user){
        throw new ApiError(500 , "Error finding user via decoded Token")
    }

    const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    if(!accessToken || !newRefreshToken){
        throw new ApiError(500 , "Error generating access/refreshToken ")
    }

    return res
    .status(200)
    .cookie(accessToken)
    .cookie(newRefreshToken)
    .json(
        new ApiResponse(200 , {accessToken , newRefreshToken} , "New AccessToken Generated")
    )
})

const changeCurrentUserPassword = asyncHandler(async(req , res)=> {
    const {oldPassword , newPassword , confirmPassword} = req.body

    const user = User.findById(req.user?._id);
    if(!user){
        throw new ApiError(500 , "error getting user")
    }
    const passValidation = await user.isPasswordCorrect(oldPassword)

    if(!passValidation) throw new ApiError(400 , "incorrect Old password")
    
    if(!(newPassword===confirmPassword)){
        throw new ApiError(400 , "New password does not match with confirm password")
    }

    user.password = newPassword
    await user.save({vaidateBeforeSave: false})
    
    return res
    .status(200)
    .json(
        new ApiResponse(200 , "Password Updated Successfully")
    )


})

const getCurrentUser = asyncHandler(async(req , res)=>{
    const user = req.user

    if(!user) throw ApiError(401 , "Unauthorized request")

    return res
    .status(200)
    .json(
        ApiResponse(200 , {user} , "Current user retrieved")
    )
})

const updateAccountDetails = asyncHandler(async(req , res)=>{
    const {fullName , email} = req.body

    if(!(fullName && email)) throw new ApiError(400 , "Fullname or email required")
    
    if(user.fullName===fullName || user.email === email) throw new ApiError(400 , "Different fullname or email value required")  

        const user = await User.findByIdAndUpdate(
            req.user?._id , 
            {
                $set:{
                    fullName:fullName,
                    email:email 
                }
            },
            {new:true}
        ).select("-password -refreshToken")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200 , {user} ,  "Details saved successfully")
    )
})

const deleteUserAccount = asyncHandler(async(req , res) => {
    const user  = req.user
    if(!user) throw new ApiError(400 , "User not found while deleting account")
    await User.findByIdAndDelete(user._id)

    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200 , "User account deleted successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req , res)=>{
    const updateCoverImage = req.files?.coverImage[0]?.path || ""
    if(!updateCoverImage) throw new ApiError(400 , "Upload Cover Image")

    const updatedCoverImagePath = await uploadOnCloudinary(updateCoverImage)
    if(!updatedCoverImagePath) throw new ApiError(500 , "updatedCoverImage Upload failed")

    return res
    .status(200)
    .json(
        new ApiResponse(200 , updatedCoverImagePath.url , "Cover Image updated Sucessfully")
    )
    
})


const getUserChannelProfile = asyncHandler(async(req , res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400 , "Username not found")        
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            } 
        },
        {
            $lookup : {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as : "subcribers"
            }
        },
        {
            $lookup: {
                from : "subscriptions",
                localField : "_id",
                foreignField: "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelsSubscribedTo : {
                    $size: "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        $if : {$in: [req.user?._id , "$subscribers.subscriber"]}
                    }
                }
            }
        },
        {
            $project: {
                fullName : 1,
                userName : 1 , 
                subscribersCount : 1,
                channelsSubscribedTo : 1 ,
                avatar : 1 , 
                coverImage : 1 ,
                email : 1,
                isSubscribed : 1,
            }
        }
    ])

    console.log("Channel ", channel)

    if(!channel?.length){
        throw new ApiError(404 , "Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , channel[0] , "User channel fetched  sucessfully")
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountDetails,
    deleteUserAccount,
    updateUserCoverImage

} 