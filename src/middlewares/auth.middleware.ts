import { NextFunction, Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { IUser, User } from "../models/user.model"
import { ApiResponse } from "../utils/ApiResponse"
import jwt from "jsonwebtoken"

const AccessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET ?? "My Default Access Token Secret"

interface CustomRequest extends Request {
  user?: IUser
}

export const verifyJWT = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

      if (!token) {
        res
          .status(401)
          .json(
            new ApiResponse(
              401,
              { message: "The token is either wrong or expired!" },
              "Unauthorized request!"
            )
          )
      }

      const decodedToken: any = jwt.verify(token, AccessTokenSecret)

      const user: IUser = await User.findById(decodedToken._id).select(
        "-password"
      )

      if (!user) {
        res
          .status(401)
          .json(
            new ApiResponse(
              401,
              { message: "Unauthorized request!" },
              "Unauthorized request!"
            )
          )
      }

      req.user = user

      next()
    } catch (err) {}
  }
)
