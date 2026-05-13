import { Router } from "express";
import { 
    getAllVideos, 
    publishAVideo, 
    getVideoById, 
    updateVideo, 
    deleteVideo, 
    togglePublishStatus 
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { publishVideoSchema, updateVideoSchema } from "../validations/video.validation.js";

const router = Router();

router.route("/")
    .get(getAllVideos)
    .post(
        verifyJWT,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        validate(publishVideoSchema),
        publishAVideo
    );

router.route("/:videoId")
    .get(optionalAuth, getVideoById)
    .patch(verifyJWT, upload.single("thumbnail"), validate(updateVideoSchema), updateVideo)
    .delete(verifyJWT, deleteVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
