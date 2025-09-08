
import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    //TODO: toggle like on video
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User must be authenticated");
    }
    // Check if video exists
    const video = await video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if user already liked this video
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // Unlike → remove like
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, "Video unliked successfully"));
    } else {
        // Like → create new like
        await Like.create({ video: videoId, likedBy: userId });
        return res
            .status(200)
            .json(new ApiResponse(200, { liked: true }, "Video liked successfully"));
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User must be authenticated");
    }   
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }   
    // Check if user already liked this comment
    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });   
    if (existingLike) {
        // Unlike → remove like
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, "Comment unliked successfully"));
    } else {
        // Like → create new like
        await Like.create({ comment: commentId, likedBy: userId });
        return res
            .status(200)
            .json(new ApiResponse(200, { liked: true }, "Comment liked successfully"));
    }
       // After the like/unlike operation
    const likeCount = await Like.countDocuments({ comment: commentId });
    return res.status(200).json(
        new ApiResponse(200, { 
            liked: true, 
            likeCount 
        }, "Comment liked successfully")
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
