import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import registerUser from "../controllers/user.controllers.js"

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
export default router