import asyncHandler from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import {APierror} from "../utils/APierror.js"
import {APiResponse} from "../utils/APiresponse.js"


const generateAccessTokenAndRefreshToken = async(userId) =>{
    try{
        
    const user = User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refresedToken = user.generateRefreshToken()

    user.refresedToken= refresedToken
    await user.save({validateBeforeSave : false})

    return{accessToken,refresedToken}
    }catch(error){
        throw new APierror(500,"something went wrong with the generation of accesstoken or refreshtoken")
    }
}
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
 
const loginUser = asyncHandler(async (req,res)=>
{
     // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email,username,password} = req.body

    if([email,username,password].some((feild)=>
        feild?.trim()==="")){
            throw new APierror(400,"email,username,password are requried feild")
        }

    const user = await User.findOne({
        $or:[{emai},{username}]
    })

    if(!user){
        throw new APierror(200,"user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new APierror(400,"Wrong password Try again")
    }

    const {accessToken,refresedToken} = generateAccessTokenAndRefreshToken(user._id)

    const loggedInuser = await User.findById(user._id).select(
    "-password -refresedToken"
    )

    const option ={
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refresedToken,option)
    .json(
        new APiResponse(
            200,
            {
                user: loggedInuser,accessToken,refresedToken
            },
            "You have logged in successfully"
        )
    )
    
})

const logout = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset:{
            refresedToken:1
            }
        },{
            new: true
        }
    )

    const option ={
        httpOnly:true,
        secure:true

    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new APiResponse(
            200,
            {},
            "You have been successfully logged out"
        )
    )
}
)
export { registerUser ,loginUser ,logout }