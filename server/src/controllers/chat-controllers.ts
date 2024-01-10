import { Response } from "express";
import { RequestProps } from "../middlewares/auth-middleware";
import db from "../../lib/utils";

export const AccessChat = async (req: RequestProps, res: Response) => {
  const { userId } = req.body;
  if (!userId)
    return res
      .status(400)
      .json({ message: "please provide userId", success: false });
  const user = req.user;
  if (!user)
    return res
      .status(404)
      .json({ message: "User's not Authenticated", success: false });

  try {
    console.log(user.id);
    const chat = await db.chat.findMany({
      where: {
        users: {
          some: {
            id: {
              in: [userId, user.id],
            },
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            profileUrl: true,
            email: true,
          },
        },
        latestMessage: true,
      },
    });
    if (chat.length > 0) {
      res.status(200).send(chat[0]);
    } else {
      const chat = await db.chat.create({
        data: {
          chatName: "sender",
          users: {
            connect: [
              {
                id: userId,
              },
              {
                id: user.id,
              },
            ],
          },
        },
      });
      res.status(200).json({ message: "created Chat", chat });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  } finally {
    db.$disconnect();
  }
};

export const FetchChats = async (req: RequestProps, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};

export const GroupChat = async (req: RequestProps, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};

export const RenameGroup = async (req: RequestProps, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};
export const AddToGroup = async (req: RequestProps, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};

export const RemoveFromGroup = async (req: RequestProps, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};
