import { Request, Response, Router } from "express"
import {
  loginUser,
  registerUser,
  updatePassword,
  updateProfile,
} from "../controllers/user.controller"
import { upload } from "../middlewares/multer.middleware"
import { verifyJWT } from "../middlewares/auth.middleware"

const userRouter = Router()

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
)

userRouter.route("/login").post(loginUser)

// secured routes
userRouter.route("/update-profile").post(verifyJWT, updateProfile)
userRouter.route("/update-password").post(verifyJWT, updatePassword)

export { userRouter }
