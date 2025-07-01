import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {APierror} from "../utils/APierror.js"
import {APiresponse} from "../utils/APiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = req.user?._id
    const content = req.body
    
    if(!userId || !content){
        throw new APierror(400,"all feilds are reqired")
    }

    const tweet = await Tweet.create({
        content,
        owner:userId
    })

    if(!tweet){
        throw new APierror(400,"error in creating tweet")
    }

    return res.status(200)
              .json(
                APiresponse(200,tweet,"tweet created successfully")
              )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.user?._id

    const usertweets = await Tweet.find({owner:userId})

    if(!usertweets){
        throw new APierror(400,"error in finding all tweet")
    }

    return res.status(200)
              .json(
                APiresponse(200,usertweets,"these are all your tweets")
              )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const tweetId = req.body
    const content = req.body
    const usertweet = await Tweet.findByIdAndUpdate(tweetId,{
        content,
    },{new:true})

    if(!usertweet){
        throw new APierror(400,"error in finding tweet")
    }

    return res.status(200)
              .json(
                APiresponse(200,usertweet,"these is your updated tweet")
              )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const tweetId = req.param

    const usertweet = await Tweet.findByIdAndDelete(tweetId)

    if(!usertweet){
        throw new APierror(400,"error in deletin tweet")
    }

    return res.status(200)
              .json(
                {"message":"tweet deleted"}
              )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}