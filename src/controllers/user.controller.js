import jwt from 'jsonwebtoken';
import { ApiError, ApiResponse, asyncHandler, uploadOnCloudinary } from "../utils/index.js";
import { User } from '../models/user.model.js';
import { COOKIE_OPTIONS, REFRESH_TOKEN_SECRET } from "../constants.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, error?.message || "Something went wrong while generating the access tokens")
  }
}

const registerController = asyncHandler(async (req, res) => {
  // get user details from the frontend
  const { username, email, fullname, password } = req.body;

  const fetchedFields = { username, email, fullname, password };

  // validation - Not empty
  if (Object.keys(fetchedFields).some((field) => !fetchedFields[field]?.trim())) {
    const validationErrors = [];
    Object.keys(fetchedFields).forEach((field) => !fetchedFields[field]?.trim() 
      && validationErrors.push(`${field} is required`))

    throw new ApiError(400, "Validation Error", validationErrors);
  }

  // check if user already exists - username, email
  const existingUser = await User.findOne({
    $or: [{ username }, { email } ]
  })

  if (existingUser) {
    throw new ApiError(409, "Username or Email already existing");
  }

  // check for images, check for avatar
  const avatarLocalFilePath = req.files?.avatar[0]?.path;
  const coverImageLocalFilePath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalFilePath) {
    throw new ApiError(400, "avatar is required")
  }

  // upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalFilePath);
  const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

  if (!avatar) {
    throw new ApiError(400, "avatar is required")
  }

  // create user object - crete entry in db
  const user = await User.create({
    username: username?.toLowerCase(),
    email,
    fullname,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url,
  })

  // check for user creation
  // remove password and refreshToken field from response
  const createdUser = await User.findById(user?._id, { password: 0, refreshToken: 0 });

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.")
  }

  // return res
  res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  )
})

const loginController = asyncHandler(async (req, res) => {
  // gather information from the FE
  const { username, email, password } = req.body;

  // validate information
  if (!username && !email) {
    throw new ApiError(401, "Either username or email is required")
  }

  if (!password) {
    throw new ApiError(401, "Password is required")
  }

  // check whether user exists in DB 
  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  // check password
  const isValidUser = await user.isPasswordCorrect(String(password));

  if (!isValidUser) {
    throw new ApiError(401, "Unauthorized Access")
  }

  // generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id);

  const loggedInUser = await User.findById(user?._id, { password: 0, refreshToken: 0 })

  // update client cookies and send response
  res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(200, {
      user: loggedInUser,
      accessToken,
      refreshToken,
    }, "User logged In Successfully"))
})

const logoutController = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined
      }
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(
      new ApiResponse(200, {}, "User logged out")
    )
})

const refreshAccessTokenController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken?.replace("Bearer ", "");

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized Access");
  }

  const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid or expired refresh token")
  }

  if (refreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used")
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user?._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", newRefreshToken)
    .json(
      new ApiResponse(
        200, 
        { accessToken, refreshToken: newRefreshToken }, 
        "Access token refreshed"
      )
    )
})

const changePasswordController = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both old and new password are required")
  }

  // Ensure verifyJWT middleware is used for this route
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const isValidPassword = await user.isPasswordCorrect(String(oldPassword));

  if (!isValidPassword) {
    throw new ApiError(401, "Unauthorized Access! Invalid Old Password")
  }

  user.password = String(newPassword);
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(
    new ApiResponse(200, {}, "Password Updated Successfully")
  )
})

const getCurrentUserController = asyncHandler(async(req, res) => {
  // Ensure verifyJWT middleware is used for this route
  return res.status(200).json(
    new ApiResponse(200, req.user, "User fetched successfully")
  )
})

const updateAccountDetailsController = asyncHandler(async(req, res) => {
  const {fullname, email} = req.body

  if (!fullname || !email) {
      throw new ApiError(400, "Both full name and email are required")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              fullname,
              email
          }
      },
      {new: true}
      
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatarController = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
      throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              avatar: avatar.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
  )
})

const updateUserCoverImageController = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              coverImage: coverImage.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Cover image updated successfully")
  )
})

export { registerController, loginController, logoutController, refreshAccessTokenController, changePasswordController, getCurrentUserController, updateAccountDetailsController, updateUserAvatarController, updateUserCoverImageController };
