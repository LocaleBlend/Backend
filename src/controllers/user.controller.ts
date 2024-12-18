import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { User, IUser } from "../models/user.model"
import { ApiResponse } from "../utils/ApiResponse"
import { uploadOnCloudinary } from "../utils/cloudinary"
import bcrypt from "bcrypt"

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, age } = req.body

  if (
    [firstName, lastName, email, password, age].some(
      (field) => field?.trim() === ""
    )
  ) {
    return res.status(401).json(
      new ApiResponse(
        401,
        {
          message: "All fields are required!",
        },
        "All fields are required"
      )
    )
  }

  const existedUser = await User.findOne({ email: email })

  if (existedUser) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          { message: "A user already exist with this email!" },
          "A user already exists with this email!"
        )
      )
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  const avatarLocalPath = files?.avatar[0].path

  let coverImageLocalPath = ""

  if (
    files &&
    Array.isArray(files?.coverImage) &&
    files?.coverImage.length > 0
  ) {
    coverImageLocalPath = files?.coverImage[0].path
  }

  if (!avatarLocalPath) {
    return res.status(401).json(
      new ApiResponse(
        401,
        {
          message: "Avatar image is required!",
        },
        "Avatar image is required!"
      )
    )
  }

  const cloudinaryAvatarPath = await uploadOnCloudinary(avatarLocalPath)
  const cloudinaryCoverPath = await uploadOnCloudinary(coverImageLocalPath)

  if (!cloudinaryAvatarPath) {
    return res.status(400).json(
      new ApiResponse(
        400,
        {
          message: "Avatar file is required!",
        },
        "Avatar file is required!"
      )
    )
  }

  const user = await User.create({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    age: age,
    avatar: cloudinaryAvatarPath?.url,
    coverImage: cloudinaryCoverPath?.url || "",
  })

  const createdUser = await User.findOne(user._id).select("-password")

  if (!createdUser) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          { message: "Something went wrong while registering the user!" },
          "Something went wrong while registering the user!"
        )
      )
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { createdUser }, "User created successfully!"))
})

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          { message: "Email and password is required!" },
          "Email and password is required!"
        )
      )
  }

  const user = await User.findOne({ email: email })

  if (!user) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          { message: "Email entered might be wrong!" },
          "Email entered might be wrong!"
        )
      )
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password)

  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          { message: "Incorrect password" },
          "Incorrect password"
        )
      )
  }

  const accessToken = user.generateAccessToken()
  const returnUser = await User.findById(user._id).select("-password")

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: returnUser,
        accessToken,
      },
      "You logged in successfully!"
    )
  )
})

interface CustomRequest extends Request {
  user?: IUser
}

const updateProfile = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { firstName, lastName, email, age } = req.body

    if ([firstName, lastName, email, age].some((field) => field === "")) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            { message: "You can't set any field to empty!" },
            "You can't set any field to empty!"
          )
        )
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          firstName,
          lastName,
          email,
          age,
        },
      },
      { new: true }
    ).select("-password")

    return res
      .status(200)
      .json(new ApiResponse(200, { user }, "Profile update successfully!"))
  }
)

const updatePassword = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body

    const user: IUser | null = await User.findById(req.user?._id)
    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "The given user id is incorrect!"))
    }

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "The password is incorrect!"))
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Password updated successfully!" },
          "Password changed successfully"
        )
      )
  }
)

export { registerUser, loginUser, updateProfile, updatePassword }
