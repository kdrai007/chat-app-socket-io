import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import db from "../../lib/utils";
import { generateToken } from "../../lib/generate-token";
import { RequestProps } from "../middlewares/auth-middleware";

const saltRound = 10;

export const UserRegistration = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    //checking if there's any missing field
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "fill required field", success: false });
    }
    // checking if user already exist in database
    const userExist = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (userExist) {
      return res.status(400).json({
        message: "User with this email already exist",
        success: false,
      });
    }

    // hashing password using bcrypt library;
    const hash = await bcrypt.hash(password, saltRound);
    let user = await db.user.create({
      data: {
        username,
        email,
        password: hash,
      },
    });
    const token = generateToken(user.id);
    res
      .status(200)
      .json({ message: "user created", user, token, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong", sccuess: false });
  } finally {
    db.$disconnect();
  }
};

export const UserAuth = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "fill required field", success: false });
    }
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user)
      return res
        .status(401)
        .json({ message: "please enter valid email", success: false });
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res
        .status(404)
        .json({ message: "please enter valid password", success: false });
    }
    // Generating jwt token
    const token = generateToken(user.id);
    res
      .status(200)
      .json({ message: "logged in successfully", user, token, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong", sccuess: false });
  } finally {
    db.$disconnect();
  }
};

export const GetUser = async (req: RequestProps, res: Response) => {
  try {
    const { name }: { name?: string } = req.query;
    const user = name
      ? await db.user.findMany({
          where: {
            username: {
              contains: name,
            },
          },
          select: {
            id: true,
            email: true,
            username: true,
            profileUrl: true,
          },
        })
      : await db.user.findUnique({
          where: {
            id: req.user?.id,
          },
        });
    if (user) {
      return res
        .status(200)
        .json({ message: "founded User", user, success: true });
    }
    res.status(401).json({ message: "not found", success: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong", sccuess: false });
  } finally {
    db.$disconnect();
  }
};
