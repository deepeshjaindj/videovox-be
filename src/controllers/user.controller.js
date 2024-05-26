import { ApiError, ApiResponse, asyncHandler, uploadOnCloudinary } from "../utils/index.js";
import { User } from '../models/user.model.js';

const userController = asyncHandler(async (req, res) => {
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

export default userController;
