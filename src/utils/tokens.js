import { ApiError } from "./apiError.js"
import { User } from "../models/user.model.js"

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user  = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generatng refresh and access token")
    }
}

export default generateAccessAndRefreshToken;