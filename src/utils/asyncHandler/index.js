import ApiError from "../ApiError/index.js";

const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (err) {
    res.status(err.statusCode || 500).json(
      new ApiError(err.statusCode || 500, err.message, err.errors)
    )
  }
}

export default asyncHandler;