import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {APierror} from "../utils/APierror.js"
import {APiresponse} from "../utils/APiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.user

    // const channel = await Video.aggregate(
    //     {
    //         $match:{
    //             owner:channelId
    //         }
    //     }
    // )

    const channelVideos = await Video.find({owner:channelId})
    const totalviews = channelVideos.reduce((acc,curr)=>{
    return curr.view+acc
    },0)
    const totalVideo = channelVideos.length;

    const channelSubscribers = await Subscription.find({channel:channelId})
    const totalsubscribers = channelSubscribers.length;

    const videoIds = channelVideos.map(video=>video._id)
    const totallikes = await Like.countDocument({video:{$in : videoIds}})

    return res.status(200)
              .json({
                totalVideo,
                totallikes,
                totalsubscribers,
                totalviews

              })

    // await User.aggregate([
    //     {
    //         $match:{
    //             _id: channelId
    //         }
    //     },
    //     {
    //         $lookup:{
    //             from:"Video",
    //             localField:"_id",
    //             foreignField:"owner",
    //             as:"allvideos",
    //             pipeline:[
    //                 {
    //                     $lookup:{
    //                         from:"Like",
    //                         localField:"_id",
    //                         foreignField:"video",
    //                         as:"likesofvideos"
    //                     }
    //                 }
    //             ]
    //         }
    //     }

    // ])
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user
    const channelVideos = await Video.find({owner:channelId})

    if(!channelVideos){
        throw new APierror(404,"Videos not found")
    }

    return res.status(200)
              .json({
                channelVideos
              })
})

export {
    getChannelStats, 
    getChannelVideos
    }