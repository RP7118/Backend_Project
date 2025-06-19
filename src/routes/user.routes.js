import { Router } from "express"
import registerUser from "../controllers/user.controllers.js"

const router = Router()
router.route('/RegisterUser').post(registerUser)
export default router