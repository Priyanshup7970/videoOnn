import mongoose, {isValidObjectId} from "mongoose"
import {Subscription} from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId = req.user?._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
    } else {
        await Subscription.create({
            channel: channelId,
            subscriber: subscriberId
        });
        return res.status(200).json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                subscriber: {
                    _id: "$subscriberDetails._id",
                    username: "$subscriberDetails.username",
                    avatar: "$subscriberDetails.avatar"
                }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                channel: {
                    _id: "$channelDetails._id",
                    username: "$channelDetails.username",
                    avatar: "$channelDetails.avatar"
                }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
