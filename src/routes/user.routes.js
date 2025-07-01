import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import {registerUser,loginUser,logout,RefreshAccessToken} from "../controllers/user.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router()
router.route("/RegisterUser").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logout)
router.route("/refreshAccessToken").post(RefreshAccessToken)


export default router