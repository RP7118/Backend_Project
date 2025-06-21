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
    console.log(req.body);
    console.log('username : ',username);
    console.log(`username : ${username}`);

    if([username,email,password,fullname].some((feild)=>
        feild?.trim()==="" )){
            throw new APierror(400,"usename, email,password are nesesary feilds")
    }

    const existeduser = await User.findOne({
        $or:[{username},{email}]
    })

    console.log("working1");
    
    if(existeduser){
        console.log("user already exists");
    }
    console.log("working1");
    
    const avatarLocalpath = await req.files?.avatar[0]?.path;
    const coverimageLocalpath = await req.files?.coverImage[0]?.path;

    console.log("working1");

    if(!avatarLocalpath){
        throw new APierror(400,"Please upload Avtar file ")
    }

    const avatar =await uploadFileOnCloudinary(avatarLocalpath)
    const coverImage = await uploadFileOnCloudinary(coverimageLocalpath)

    console.log("working 1");
    
    if (!avatar){
        throw new APierror(400,"PLEASE UPLOAD AVTAR FILE")
    }

    console.log("working 1");

    const user = await User.create({
        username : username.toLowerCase(),
        email,
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password

    }) 

    console.log("working 1");

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