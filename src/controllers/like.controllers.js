import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {APierror, ApiError} from "../utils/APierror.js"
import {ApiResponse} from "../utils/APiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    const isLikeExists = Like.findOne({video : videoId, likedby : req.user?._id})
    
    if(!isLikeExists){
        await Like.create({
            video: videoId,
            likedby : req.user?._id
        })

        return res.status(200)
        .json({message:"video liked"})
    }else{
        await isLikeExists.deleteOne()
    }
    return res.status(200)
              .json({
                message:"video disliked"
              })
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const iscommentLiked = Like.findOne({comment:commentId,likedby:req.use?._id})

    if(!iscommentLiked){
        await Like.create({
            comment:commentId,
            likedby:req.user?._id
        })
        return res.status(200).json({"message":"comment liked"})
    }else{
        await iscommentLiked.deleteOne()
        
    }
     return res.status(200)
               .json({
                "message":"comment disliked"
               })
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const isTweetLiked = Like.findOne({tweet:tweetId,likedby:req.use?._id})

    if(!isTweetLiked){
        await Like.create({
            tweet:tweetId,
            likedby:req.user?._id
        })
        return res.status(200).json({"message":"tweet liked"})
    }else{
        await isTweetLiked.deleteOne()
        
    }
     return res.status(200)
               .json({
                "message":"Tweet disliked"
               })
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const allLikedVideos = await Like.find({likedby:req.user?._id})

    if (!allLikedVideos){
        throw new APierror(400,"error in finding all likedvideos")
    }

    return res.status(200)
              .json(allLikedVideos)
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}