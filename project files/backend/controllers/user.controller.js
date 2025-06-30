import cloudinary from "cloudinary";
import crypto from "crypto";
import fs from "fs/promises";

import asyncHandler from "../middlewares/asyncHAndler.middleware.js";
import User from "../models/usermodel.js";
import AppError from "../utils/error.util.js";
import sendEmail from "../utils/sendEmail.js";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true
};

/**
 * @REGISTER - Registers a new user (no avatar upload)
 */
export const register = asyncHandler(async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("Email already exists", 409));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url:
        "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg"
    }
  });

  if (!user) {
    return next(new AppError("User registration failed, please try again", 400));
  }

  await user.save();

  const token = await user.generateJWTToken();
  user.password = undefined;

  res.cookie("token", token, { ...cookieOptions, sameSite: "None" });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user
  });
});

/**
 * @LOGIN - Logs in an existing user
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and Password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!(user && (await user.comparePassword(password)))) {
    return next(new AppError("Email or password does not match", 400));
  }

  const token = await user.generateJWTToken();
  user.password = undefined;

  res.cookie("token", token, { ...cookieOptions, sameSite: "None" });

  res.status(200).json({
    success: true,
    message: "User logged in Successfully",
    user
  });
});

/**
 * @LOGOUT - Clears token cookie
 */
export const logout = asyncHandler(async (_req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: "User logged out Successfully"
  });
});

/**
 * @GET_PROFILE - Returns logged-in user's profile
 */
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    success: true,
    message: "User details",
    user
  });
});

/**
 * @FORGOT_PASSWORD - Sends reset email
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email is required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Email not registered", 400));

  const resetToken = await user.generatePasswordResetToken();
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = "Reset Password";
  const message = `Reset your password by clicking <a href="${resetUrl}">here</a>.`;

  try {
    await sendEmail(email, subject, message);
    res.status(200).json({
      success: true,
      message: `Reset token sent to ${email}`
    });
  } catch (err) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    return next(new AppError("Failed to send email", 500));
  }
});

/**
 * @RESET_PASSWORD
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() }
  });

  if (!user) return next(new AppError("Invalid or expired token", 400));

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully"
  });
});

/**
 * @CHANGE_PASSWORD
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  if (!user) return next(new AppError("User not found", 400));
  if (!(await user.comparePassword(oldPassword))) {
    return next(new AppError("Old password is incorrect", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  });
});

/**
 * @UPDATE_USER - Updates name and/or avatar
 */
export const updateUser = asyncHandler(async (req, res, next) => {
  const { fullName } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return next(new AppError("User not found", 404));

  if (fullName) user.fullName = fullName;

  if (req.file) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill"
      });

      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
        await fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (err) {
      return next(new AppError("File upload failed", 500));
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User profile updated"
  });
});
