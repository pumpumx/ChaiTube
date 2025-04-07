import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import { ApiError } from "../utils/apiError.js";
export const verifyJWT = asyncHandler(async(req , _ , next) => {
    try {
        const token =  req.cookies?.accessToken || req.header("Authorisation"?.replace("bearer ",""))
    
        if(!token){
            throw new ApiError(401 , "Token not valid")
        }
        const decodedToken =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        if(!decodedToken){
            throw new ApiError(401 , "Access Token not valid")
        }
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401 , "Invalid AccessToken")
        }
        req.user = user
        next()
        
    } catch (error) {
        throw new ApiError(401 , "Invalid AccessToken")
    }
})
