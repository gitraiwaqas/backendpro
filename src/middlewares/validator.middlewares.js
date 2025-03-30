import Joi from "joi";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const validateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must be at most 30 characters",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Invalid email format",
    }),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
}).strict();

const validateUser = async (req, res, next) => {
  const { username, email, password, fullName } = req.body; // Extract necessary fields

  const { error } = validateUserSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = error.details
      .map((err) => err.message)
      .filter((msg) => !msg.includes("is not allowed"));

    return res.status(400).json({ errors });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        errors: ["Username or email already exists"],
      });
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
      return res.status(400).json({ error: "Avatar is required" });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : null;

    if (!avatar) {
      return res.status(400).json({ error: "Failed to upload avatar" });
    }

    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password, // Store hashed password instead of plain text in a real app
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshTokens"
    );

    if (!createdUser) {
      return res
        .status(500)
        .json({ error: "Something went wrong while creating the user" });
    }

    return res
      .status(201)
      .json({ message: "User created successfully", user: createdUser });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { validateUser };
