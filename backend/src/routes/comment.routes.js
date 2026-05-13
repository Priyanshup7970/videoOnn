import { Router } from "express";
import { 
    getVideoComments, 
    addComment, 
    updateComment, 
    deleteComment 
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { addCommentSchema, updateCommentSchema } from "../validations/comment.validation.js";

const router = Router();

router.route("/:videoId")
    .get(getVideoComments)
    .post(verifyJWT, validate(addCommentSchema), addComment);

router.route("/c/:commentId")
    .patch(verifyJWT, validate(updateCommentSchema), updateComment)
    .delete(verifyJWT, deleteComment);

export default router;
