import { z } from "zod";

export const publishVideoSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(100, "Title is too long"),
        description: z.string().min(1, "Description is required"),
    }),
});

export const updateVideoSchema = z.object({
    params: z.object({
        videoId: z.string().min(1, "Video ID is required"),
    }),
    body: z.object({
        title: z.string().min(1, "Title cannot be empty").max(100, "Title is too long").optional(),
        description: z.string().min(1, "Description cannot be empty").optional(),
    })
});
