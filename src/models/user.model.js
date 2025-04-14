import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim:true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim:true,
        },
        fullName: {
            type: String,
            required: true,
            trim:true,
            index:true,
        },
        avatar:{
            type: String,  //Cloudinary url
            required: true,
        },
        coverImage:{
            type:String,
        },
        watchHistory:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password:{
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken:{
            type: String,
            required:true,
        }
    } , {timestamps:true})



userSchema.pre("save",  async function(next){
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return  bcrypt.compareSync(password , this.password)
}


userSchema.methods.generateAccessToken = function(){  //Short Lived
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function(){  //Long Lived
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        },
    )
}
export const User = mongoose.model('User' , userSchema)