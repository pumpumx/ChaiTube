
const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler()).catch((err)=> next(err)) 
    }
}

export {asyncHandler}

//TRY CATCH METHOD 

// const asyncHandler = (fn) => async(req , res , next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             status: false,
//             message: err.message
//         })
//     }
// }