import { z } from "zod";

export const addCommentSchema = z.object({
    params: z.object({
        videoId: z.string().min(1, "Video ID is required"),
    }),
    body: z.object({
        content: z.string().min(1, "Comment content cannot be empty"),
    }),
});

export const updateCommentSchema = z.object({
    params: z.object({
        commentId: z.string().min(1, "Comment ID is required"),
    }),
    body: z.object({
        content: z.string().min(1, "Comment content cannot be empty"),
    }),
});
