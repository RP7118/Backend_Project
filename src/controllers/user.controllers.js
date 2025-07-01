import asyncHandler from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import { uploadFileOnCloudinary,deletFileFromCloudinary } from "../utils/cloudinary.js"
import {APierror} from "../utils/APierror.js"
import {APiResponse} from "../utils/APiresponse.js"
import jwt from "jsonwebtoken"
import { subscription } from "../models/subscription.models.js"
import mongoose from "mongoose"


const generateAccessTokenAndRefreshToken = async(userId) =>{
    try{
        
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refresedToken = user.generateRefreshToken()

        user.refresedToken= refresedToken
        await user.save({validateBeforeSave : false})

        return{ accessToken , refresedToken }
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
    
    if(existeduser){
        console.log("user already exists");
    }
    
    const avatarLocalpath = await req.files?.avatar[0]?.path;
    const coverimageLocalpath = await req.files?.coverImage[0]?.path;

    if(!avatarLocalpath){
        throw new APierror(400,"Please upload Avtar file ")
    }

    const avatar =await uploadFileOnCloudinary(avatarLocalpath)
    const coverImage = await uploadFileOnCloudinary(coverimageLocalpath)
    
    if (!avatar){
        throw new APierror(400,"PLEASE UPLOAD AVTAR FILE")
    }

    const user = await User.create({
        username : username.toLowerCase(),
        email,
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
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
 
const loginUser = asyncHandler(async (req,res)=>
{
     // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if([email,username,password].some((feild)=>
        feild?.trim()==="")){
            throw new APierror(400,"email,username,password are requried feild")
        }

    const user = await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new APierror(200,"user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new APierror(400,"Wrong password Try again")
    }
    
    const {accessToken,refresedToken} = await generateAccessTokenAndRefreshToken(user._id)
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
            refresedToken: undefined
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

const RefreshAccessToken = asyncHandler(async(req,res)=>{

    try {
        const IncomingRefreshToken = req.cookies.refreshToken || req.body?.refreshToken
    
        if(!IncomingRefreshToken){
            throw new APierror(400,"Invalid RefreshToken")
        }
    
        const deocdedRefreshToken = await jwt.verify(IncomingRefreshToken,process.env.ACCESS_TOKEN)
    
        const user = awaitUser.findById(deocdedRefreshToken?._id)
    
        if (!user){
            throw new APierror(400,"Invalid AccessToken")
        }
    
        if (deocdedRefreshToken !== user.refreshToken){
            throw new APierror(400,"AccessToken expired or Invalid accesstoken")
        }
    
        const {accessToken,newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshtoken",newRefreshToken)
        .json(
            new APiResponse(200,
                {accessToken,"newrefreshToken":newRefreshToken},
                "new refreshToken is created"
            )
        )
    } catch (error) {
        throw new APierror(400,"something went wrong in RefreshToken generation")
    }
})


const changePassword = asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword} = req.body

    if([oldPassword,newPassword].some((feild)=>
    feild?.trim()==="")){
        throw new APierror(400,"Please enter oldpassword and new password")
    }

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new APierror(400,"Invalid crencials")
    }

    const isoldPasswordRight = await user.isPasswordCorrect(oldPassword)

    if (!isoldPasswordRight){
        throw new APierror(400,"Wrong oldPassword")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        APiResponse(200,"Password has been changed")
    )

})

const updateAccountDetails = asyncHandler(async(req,res)=>{

    const {username,fullname,email} = req.body

    if ([username,fullname,email].some((feild)=>
    feild?.trim()==="")){
        throw new APierror(400,"please give the feilds that you want to change")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullname,
            email
        }
    },{new:true}).select("-password")

    return res
    .status(200)
    .json(APiResponse(200,user,"Account details updated"))
})

const currentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(APiResponse(200,req.user,"this is current user"))
})

const changeAvatar = asyncHandler(async(req,res)=>{
    const {avatar} = req.files?.path

    const {oldAvatar} = req.user?.avatar

    await deletFileFromCloudinary(oldAvatar)



    if(!avatar){
        throw new APierror(400,"upload right document")
    }

    const newavatar = await uploadFileOnCloudinary(avatar)
    const user = await User.findByIdAndUpdate(req.user?._id,{

        $set:{

            avatar: newavatar
        }},{new:true}).select("-password")

    return res.status(200)
    .json(APiResponse(200,user,"updatation of avatar has completed"))

})

const changeCoverImage = asyncHandler(async(req,res)=>
{
    const {coverImage} = req.files?.path

    const oldCoverImage = req.user?.coverImage

    if(!coverImage){
        throw new APierror(400,"please upload coverimage")
    }

    await deletFileFromCloudinary(oldCoverImage)

    const newCoverImage = await uploadFileOnCloudinary(coverImage)

    if(!newCoverImage){
        throw new APierror(400,"coveeimage is not uploading on cloudinary")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage: newCoverImage.url
        }
    },
    {new:true})
    .select("-password")

    return res.status(200)
    .json(
        APiResponse(200,user,"coverImage changed successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new APierror(400,"could not find the user") 
    }

    const channel = await User.aggregate([
        {
            $match:{
                usename : username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"subsciber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriptionCount:{
                    $size:"$subscribers"
                },
                channelsubscribedcount:{
                    $size:"$subscribedTo"
                },
                issubscribed:{
                    $con: {
                        if:{$in:[req.user?._id,"subscribers.subscriber"]},
                        then:true,
                        else:false

                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                usename:1,
                subscriptionCount:1,
                channelsubscribedcount:1,
                issubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new APierror(200,"channel not created")
    }

    return res.status(200)
    .json(
        APiResponse(200,channel[0],"channel has been shown")
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{

    await User.aggregate(
        {
            $match:{
                _id:req.user?._id
            }
        },
        {
            
        }
    )
})
export { registerUser ,loginUser ,logout,RefreshAccessToken }