import asyncHandler from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import {APierror} from "../utils/APierror.js"
import {APiResponse} from "../utils/APiresponse.js"


const registerUser = asyncHandler( async(req, res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    
    
    const {username, email, password, fullname} = req.body
    console.log('username : ',username);
    console.log(`username : ${username}`);

    if([username,email,password,fullname].some((feild)=>
        feild?.trim()==="" )){
            throw new APierror(400,"usename, email,password are nesesary feilds")
    }

    if (email != "this"){
        console.log("complete nahu");
    }else{
        console.log("this is goofy");
    }

    const existeduser = User.findOne({
        $or:[username,email]})

    if(!existeduser){
        console.log("user does not exists");
    }
    const avatarLocalpath = req.files?.avtar[0]?.path;
    const coverimageLocalpath = req.files?.coverimage[0]?.path;

    if(!avatarLocalpath){
        throw new APierror(400,"Please upload Avtar file ")
    }

    const avatar =await uploadFileOnCloudinary(avatarLocalpath)
    const coverimage = await uploadFileOnCloudinary(coverimageLocalpath)

    if (!avatar){
        throw new APierror(400,"PLEASE UPLOAD AVTAR FILE")
    }

    const user = User.create({
        username : username.toLowercase(),
        email,
        fullname,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password

    }) 

    const checkforUser = await User.findById(user._id).select(
        "-password -refresedToken"
    )

    if(!checkforUser){
        throw new APierror(500,"this is my mistake and im sorry and server")
    }

    return res.status(200).json(
        new APiResponse(200,checkforUser,"this is user registerd",)
    )
})

export default registerUser