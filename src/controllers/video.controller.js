import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    // try {
//     // Parse and validate inputs
//     const parsedPage = parseInt(page) || 1;
//     const parsedLimit = parseInt(limit) || 10;
    
//     // Build filter object
//     const filter = {};
    
//     // Search query filter
//     if (query && query.trim()) {
//         filter.$or = [
//             { title: { $regex: query.trim(), $options: 'i' } },
//             { description: { $regex: query.trim(), $options: 'i' } }
//         ];
//     }
    
//     // User filter
//     if (userId) {
//         if (!isValidObjectId(userId)) {
//             throw new ApiError(400, 'Invalid userId format');
//         }
        
//         // Check if user exists
//         const user = await User.findById(userId);
//         if (!user) {
//             throw new ApiError(404, 'User not found');
//         }
        
//         filter.uploadedBy = userId;
//     }
    
//     // Build sort object
//     const sort = {};
//     if (sortBy) {
//         sort[sortBy] = sortType === 'desc' ? -1 : 1;
//     } else {
//         sort.createdAt = -1; // default sort by createdAt desc
//     }
    
//     // Execute queries in parallel for better performance
//     const [videos, total] = await Promise.all([
//         Video.find(filter)
//             .sort(sort)
//             .skip((parsedPage - 1) * parsedLimit)
//             .limit(parsedLimit)
//             .populate('uploadedBy', 'name email')
//             .lean(), // Add .lean() for better performance if you don't need full Mongoose documents
//         Video.countDocuments(filter)
//     ]);
    
//     const totalPages = Math.ceil(total / parsedLimit);
    
//     res.json(new ApiResponse(true, 'Videos fetched successfully', {
//         videos,
//         total,
//         page: parsedPage,
//         limit: parsedLimit,
//         totalPages,
//         hasNextPage: parsedPage < totalPages,
//         hasPrevPage: parsedPage > 1
//     }));
    
// } catch (error) {
//     // Handle different types of errors appropriately
//     if (error instanceof ApiError) {
//         throw error; // Re-throw ApiError as-is
//     }
    
//     // Log unexpected errors and throw generic error
//     console.error('Error fetching videos:', error);
//     throw new ApiError(500, 'Failed to fetch videos');
// }
    // Parse and validate inputs
    const parsedPage = Math.max(parseInt(page) || 1, 1); // Ensure minimum page is 1
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100); // Limit between 1-100
    
    // Build filter object
    const filter = {};
    
    // Search query filter
    if (query && query.trim()) {
        const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
        filter.$or = [
            { title: { $regex: escapedQuery, $options: 'i' } },
            { description: { $regex: escapedQuery, $options: 'i' } }
        ];
    }
    
    // User filter
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, 'Invalid userId format');
        }
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        
        filter.uploadedBy = userId;
    }
    
    // Build sort object with validation
    const sort = {};
    const allowedSortFields = ['createdAt', 'title', 'views', 'duration']; // Define allowed sort fields
    
    if (sortBy && allowedSortFields.includes(sortBy)) {
        sort[sortBy] = sortType === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1; // default sort by createdAt desc
    }
    
    // Execute queries in parallel for better performance
    const [videos, total] = await Promise.all([
        Video.find(filter)
            .sort(sort)
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit)
            .populate('uploadedBy', 'name email avatar') // Added avatar field
            .lean(), // Better performance when you don't need full Mongoose documents
        Video.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / parsedLimit);
    
    res.json(new ApiResponse(true, 'Videos fetched successfully', {
        videos,
        pagination: {
            total,
            page: parsedPage,
            limit: parsedLimit,
            totalPages,
            hasNextPage: parsedPage < totalPages,
            hasPrevPage: parsedPage > 1
        }
    }));
})



const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}