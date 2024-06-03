import jwt from 'jsonwebtoken';
import { ApiError, asyncHandler } from "../utils/index.js";
import { ACCESS_TOKEN_SECRET } from '../constants.js';
import { User } from '../models/user.model.js';

const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request")
  }

  const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken._id, { password: 0, refreshToken: 0 });

  if (!user) {
    throw new ApiError(401, "Invalid Access Token")
  }

  req.user = user;
  next(); 
});

export { verifyJWT };