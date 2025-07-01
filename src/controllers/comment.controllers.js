import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {APiError} from "../utils/APierror.js"
import {APiResponse} from "../utils/APiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        APiError(400,"can't get videoId")
    }

    const pageNumber = parseInt(page,10)
    const commentlimits = parseInt(limit,10)
    const skip = (pageNumber-1)*commentlimits;

    const totalComments = await Comment.countDocuments({video:videoId})

    if(!totalComments){
        throw new APiError(400,"error in finding totalcomments")
    }

    const comments = Comment.find({video:videoId})
                            .populate("user","username avatar")
                            .skip(skip)
                            .limit(commentlimits)
                            .sort({createdAt:-1})

    return res.status(200)
              .json({
                Total_comments : totalComments,
                Page : pageNumber,
                Limit : commentlimits,
                comments : comments

              })
    
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {content} = req.body
    const {videoId} = req.params

    if(!content){
        throw new APiError(400,"can't get content of comment")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new APiError(500,"can't find video")
    }

    const owner = await User.findById(video.owner)

    if(!owner){
        throw new APiError(500,"can't find owner")
    }

    const comment = await Comment.create({
        content: content,
        video: video,
        owner: owner
    })


    return res.status(200)
              .json({
                Comment: comment,
                message:"Comment added successfully"
              })
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {content} = req.body
    const {commentId} = req.params
    const user = req.user

    if(!content || !commentId){
        throw new APiError(400,"erroe in fatching of content and commentId")
    }

    const owner = await Comment.findById(commentId).select("owner")

    if(owner !== user?._id){
        throw new APiError(400,"you are not allowed to update this comment")
    }


    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content
        }
    },{new:true}).select("-video")

    return res.status(200)
              .json(
                APiResponse(200,updateComment,"comment updated successfully")
              )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const commentId = req.params

    await Comment.deleteOne({_id:req,owner:req.user})//this will only delete the comment if the user is logedin

    return res.status(200)
              .json({
                message:"your comment has been deleted"}
              )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }