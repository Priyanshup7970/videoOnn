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
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    // Check if video file is uploaded
    if (!req.files || !req.files.videoFile) {
        throw new ApiError(400, "Video file is required");
    }

    const videoFile = req.files.videoFile[0]; // assuming multer middleware

    // Validate video file
    if (!videoFile) {
        throw new ApiError(400, "Video file is required");
    }

    // Optional: Validate file type and size
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv', 'video/flv', 'video/webm'];
    if (!allowedTypes.includes(videoFile.mimetype)) {
        throw new ApiError(400, "Invalid video format. Only MP4, AVI, MOV, WMV, MKV, FLV and WEBM are allowed");
    }

    // Optional: Check file size (e.g., max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (videoFile.size > maxSize) {
        throw new ApiError(400, "Video file size should not exceed 100MB");
    }

    try {
        // Upload video to Cloudinary
        const uploadResult = await uploadOnCloudinary(
            videoFile.path, // temporary file path from multer
            {
                resource_type: "video",
                folder: "videos", // organize videos in a folder
                quality: "auto", // automatic quality optimization
                format: "mp4" // convert to mp4 for better compatibility
            }
        );

        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload video to Cloudinary");
        }

        // Create video record in database
        const video = await Video.create({
            title: title.trim(),
            description: description.trim(),
            videoFile: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            duration: uploadResult.duration || 0,
            thumbnail: uploadResult.secure_url.replace(/\.[^/.]+$/, ".jpg"), // Cloudinary auto-generates thumbnails
            owner: req.user._id, // assuming user authentication middleware
            views: 0,
            isPublished: true
        });

        if (!video) {
            // Clean up uploaded file if database creation fails
            await deleteFromCloudinary(uploadResult.public_id, "video");
            throw new ApiError(500, "Failed to create video record");
        }

        // Clean up temporary file
        if (videoFile.path && fs.existsSync(videoFile.path)) {
            fs.unlinkSync(videoFile.path);
        }

        // Return success response
        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    video: {
                        _id: video._id,
                        title: video.title,
                        description: video.description,
                        videoFile: video.videoFile,
                        thumbnail: video.thumbnail,
                        duration: video.duration,
                        views: video.views,
                        isPublished: video.isPublished,
                        createdAt: video.createdAt
                    }
                },
                "Video published successfully"
            )
        );

    } catch (error) {
        // Clean up temporary file in case of error
        if (videoFile.path && fs.existsSync(videoFile.path)) {
            fs.unlinkSync(videoFile.path);
        }

        // If it's already an ApiError, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle unexpected errors
        console.error("Error publishing video:", error);
        throw new ApiError(500, "An error occurred while publishing the video");
    }
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