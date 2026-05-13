import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User must be authenticated");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
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
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User must be authenticated");
    }   
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
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
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User must be authenticated");
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });
    
    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Tweet unliked successfully"));
    } else {
        await Like.create({ tweet: tweetId, likedBy: userId });
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Tweet liked successfully"));
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User must be authenticated");
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $lookup: {
                from: "users",
                localField: "videoDetails.owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                _id: 1,
                video: "$videoDetails",
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    fullName: "$ownerDetails.fullName",
                    avatar: "$ownerDetails.avatar"
                }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
