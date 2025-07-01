import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { subscription } from "../models/subscription.models.js"
import {APierror} from "../utils/APierror.js"
import {APiresponse} from "../utils/APiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    const issubscribed = await subscription.findOne({subsciber:req.user?._id,channel:channelId
    })

    if(issubscribed){
        await issubscribed.deletOne()
        return res.status(200).json({"message":"unsubscribed"})
    }else{
        await subscription.create({
            subsciber: req.user?._id,
            channel:channelId
        })
    }

    return res.status(200).json({"message":"subscribed"})
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const allsubscribers = await subscription.find({channel:channelId})

    const subscribers = allsubscribers.map(subscription => subscription.subsciber)
    const subscriberlist = await User.countDocuments({_id:{$in:subscribers}})

    if(!subscriberlist){
        throw new  APierror(400,"error in finding subscriberlist")
    }
    return res.status(200).json(APiresponse(200,subscriberlist,"this is the list of your all subscribers"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const allchannels = await subscription.find({subsciber:subscriberId})

    const channels = allsubscribers.map(subscription => subscription.channel)
    const channellist = await User.countDocuments({_id:{$in:channels}})

    if(!channellist){
        throw new  APierror(400,"error in finding channellist")
    }
    return res.status(200).json(APiresponse(200,channellist,"this is the list of your all subscribed channels"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}