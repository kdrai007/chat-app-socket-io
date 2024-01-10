import jwt from "jsonwebtoken";
import db from "../../lib/utils";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";

export type RequestProps = Request & {
  user?: {
    id: string;
    email: string;
    username: string;
    profileUrl: string;
  } | null;
};

dotenv.config();
const secret = process.env.JWT_SECRET || "";
export const Authenticate = async (
  req: RequestProps,
  res: Response,
  next: NextFunction
) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded: any = jwt.verify(token, secret);
      req.user = await db.user.findUnique({
        where: {
          id: decoded.id,
        },
        select: {
          id: true,
          email: true,
          username: true,
          profileUrl: true,
        },
      });
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "authentication failed", success: false });
    }
  }
  if (!token) {
    res
      .status(401)
      .json({ message: "authentication failed,no token", success: false });
  }
};
