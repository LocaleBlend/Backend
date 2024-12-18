import { NextFunction, Request, Response } from "express"

type asyncHandlerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void

const asyncHandler = (requestHandler: asyncHandlerType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  }
}

export { asyncHandler }