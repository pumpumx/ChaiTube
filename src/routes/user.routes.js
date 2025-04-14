import { Router } from "express";
import {loginUser, logoutUser, registerUser , refreshAccessToken , changeCurrentUserPassword, getCurrentUser, deleteUserAccount , updateUserCoverImage} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"coverImage",
            maxCount:1,
        },
        {
            name: "avatar",
            maxCount:1,
        }
        ]),
    registerUser)

router.route("/login").post(loginUser)
//Secured routes 
router.route("/logout").post(verifyJWT , logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-pass").post(verifyJWT , changeCurrentUserPassword)
router.route("/get-current-user").post(verifyJWT , getCurrentUser)
router.route("/delete-user").post(verifyJWT , deleteUserAccount)
router.route("/new-cover-image").post(
    upload.fields([
        {
            name: "coverImage",
            maxCount:1,
        }
    ]) , 
    updateUserCoverImage
)
export default router