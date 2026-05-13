import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        return next(new ApiError(400, "Validation Error", error.errors));
    }
};
