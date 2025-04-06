import { ApiError } from "./apiError"
import { User } from "../models/user.model"

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user  = User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({validateBeforeSave: false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generatng refresh and access token")
    }
}