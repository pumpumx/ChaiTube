class ApiResponse{
    constructor(statusCode , data , message="Success" , token , refreshToken){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 
        this.token  = token
        this.refreshToken = refreshToken

    }
}

export {ApiResponse}