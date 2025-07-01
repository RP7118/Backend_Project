import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {APierror, ApiError} from "../utils/APierror.js"
import {ApiResponse} from "../utils/APiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const playList = await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })

    const checkForplayList = await Playlist.findByid(playList.owner)

    if(!checkForplayList){
        throw new APierror(400,"error in creating playlist")
    }

    return res.status(200)
              .json({
                "playlist":checkForplayList
              })
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playLists = await Playlist.find({
        owner:userId
    })

    if(!playLists){
        throw new APierror(400,"error in finding all playlists")
    }

    return res.status(200)
              .json({playLists})
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playList = await new Playlist.findByid(playlistId)

    if(!playList){
        throw new  APierror(400,"error in finding playlist by id")
    }

    return res.status(200)
              .json({playList})
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playList = await Playlist.findByid(playlistId)
    if(!playList){
        throw new  APierror(400,"error in finding playlist by id for addvideo")
    }

    const isvideoinplaylist = playList.videos.include(videoId)

    if(!isvideoinplaylist){
        throw new  APierror(400,"video already exist in playlist")
    }

    await playList.push(videoId);
    await playList.save()

    return res.status(200)
              .json({"message":"video added in playlist"})
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playList = await Playlist.findByid(playlistId)
    if(!playList){
        throw new  APierror(400,"error in finding playlist by id for removing playlist")
    }

    const indexofvideo = await playList.videos.indexOf(videoId)
    if(!indexofvideo){
        throw new  APierror(400,"error in finding indexofvideo for removing playlist")
    }

    await playList.videos.splice(indexofvideo,1)
    await playList.save();

    return res.status(200)
              .json({"message":"video remover from playlist"})
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    await Playlist.findByidAndDelete(playlistId)
    
    return res.status(200)
              .json({"message":"playlist deleted"})

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    const updatedPlaylist = await Playlist.findByidAndUpdate(playlistId,{
        name,
        description
    },{new : true})

    return res.status(200)
              .json({"message":"playlist updated"})
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}