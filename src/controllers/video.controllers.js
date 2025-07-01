import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {APierror} from "../utils/APierror.js"
import {APiresponse} from "../utils/APiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deletFileFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = {
        ispublised:true
    }

    if(query){
        filter.$or=[
            {title:{$regex:query,$options:"i"}},
            {description:{$regex:query,$options:"i"}}]
    }

    if(userId){
        filter.owner=userId
    }
    const sortorder = sortType=== "asc" ? 1: -1 
    const skip = (page-1)*limit

    const [videos,total] = await Promise.all([
        Video.find(filter)
             .sort({[sortBy]:sortorder})
             .limit(limit
             .skip(skip)
             .populate("owner","usernane fullname"),
        Video.countDocuments(filter)
             )
    ])
    return res.status(200).json({
    message: "Videos fetched successfully",
    data: videos,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoFile = await req.files?.videoFile[0].path
    const thumbnail = await req.files?.thumbnail[0].path

    if(!videoFile || !thumbnail){
        throw new APierror(400,"error in taking videofile or thumbnail")
    }
    const videofileoncloudinary = await uploadOnCloudinary(videoFile)
    const thumbnailoncloudinary = await uploadOnCloudinary(thumbnail)

    if(!videofileoncloudinary || !thumbnailoncloudinary){
        throw new APierror(400,"error in taking videofile or thumbnail to cloudinary")
    }  
    
    const video = await Video.create({
        videofile:videofileoncloudinary,
        thumbnail:thumbnailoncloudinary,
        title,
        description,
        owner:req.user?._id
    })

    return res.status(200).json({
        message:"video published",
        data:video,
    })
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if(!video){
        throw new APierror(400,"error in findind video by id")
    }

    return res.status(200).json({video})
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description} = req.body
    const thumbnail = req.files?.thumbnail[0].path
    const oldthumbnail = await Video.findById(videoId).select(thumbnail)
    await deletFileFromCloudinary(oldthumbnail)
    const newthumbnail = await uploadOnCloudinary(thumbnail)

    if(!title || !description || !thumbnail){
        throw new APierror(400,"error in finding title description and thumbnail")
    }      

    const newVideo = await Video.findByIdAndUpdate(videoId,{
        title,
        description,
        thumbnail:newthumbnail
    },{new:true})

    return res.status.json(
    APiresponse(200,newVideo,"video details updated"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new APierror(400,"can't find videoId")
    }
    const isvideoexist = await Video.findById(videoId)
    if(!isvideoexist){
        throw new APierror(400,"video does not exist")
    }

    await isvideoexist.deleteOne()

    return res.status(200)
              .json({
                message:"video deleted"
              })
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new APierror(400,"error in togglepublucstatus")
    }
    
    video.ispublised = !video.ispublised

    await video.save()

    return res.status(200).json({
        message:`videos is ${video.ispublised ? "published":"unpublished"} successfully`
    })
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}