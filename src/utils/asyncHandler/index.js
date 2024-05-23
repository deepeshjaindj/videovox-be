const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (err) {
    res.status(err.code || 500).json({
      success: false,
      error: err.message,
    })
  }
}

export default asyncHandler;