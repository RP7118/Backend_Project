import asyncHandler from "../utils/asyncHandler"
import {APierror} from "../utils/APierror.js"
import Jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"

export const verifyJWT = asyncHandler(async (req,res,next)=>{
   try {
      const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
   
      if(!Token){
         throw new APierror(200,"Unauthoried access")
      }
   
      const decodedToken = Jwt.verify(Token,process.env.ACCESS_TOKEN)
   
      const user = await User.findById(decodedToken?._id).select("-password -refresedToken")
   
      if(!user){
         throw new APierror(200,"invalid accesstoken")
      }
   
      req.user = user
   
      next();
   } catch (error) {
      throw new APierror(400,error?.message || "invalid access token")
      
   }
})