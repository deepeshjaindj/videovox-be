import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from '../constants.js';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    }, 
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video'
      }
    ],
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true,
  }
)

/**
 * Middleware function to hash the user's password before saving it to the database.
 * It checks if the password field has been modified before hashing it.
 */
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
})


userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

/**
 * Method to generate an access token using JWT for the user.
 * 
 * @returns {string} Access token for the user with specified expiry.
 */
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY
    }
  )
}

/**
 * Method to generate a refresh token using the user's _id with specified expiry time and secret.
 * @returns {string} The generated refresh token.
 */
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model('User', userSchema);
