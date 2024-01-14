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
    if (userId === req.user?.id) {
      return res
        .status(200)
        .json({ message: "You can't chat with yourself", success: false });
    }
    const chat = await db.chat.findMany({
      where: {
        users: {
          every: {
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
      res
        .status(200)
        .json({ message: "found chat", chat: chat[0], success: true });
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
      res.status(200).json({ message: "created Chat", chat, success: true });
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
    const chat = await db.chat.findMany({
      where: {
        users: {
          some: {
            id: req.user?.id,
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
        groupAdmin: {
          select: {
            id: true,
            username: true,
            profileUrl: true,
            email: true,
          },
        },
        latestMessage: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.status(200).json({
      message: "fetched chats",
      chat,
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};

export const GroupChat = async (req: RequestProps, res: Response) => {
  const { users, name } = req.body;
  if (!users || !name) {
    return res.status(400).json({ message: "Plese fill required fields" });
  }
  var usersData = JSON.parse(users);
  if (usersData.length < 2) {
    return res.status(400).json({
      message: "more than two users required to form a group chat",
      success: false,
    });
  }
  usersData.push(req.user?.id);
  const usersDataInObjectForm = usersData.map((usr: any) => ({
    id: usr,
  }));

  try {
    const chat = await db.chat.create({
      data: {
        chatName: name,
        users: {
          connect: usersDataInObjectForm,
        },
        isGroupChat: true,
        groupAdmin: {
          connect: {
            id: req.user?.id,
          },
        },
      },
    });
    const foundChat = await db.chat.findUnique({
      where: {
        id: chat.id,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            profileUrl: true,
          },
        },
        groupAdmin: {
          select: {
            id: true,
            username: true,
            email: true,
            profileUrl: true,
          },
        },
      },
    });
    res
      .status(200)
      .json({ message: "group created", chat: foundChat, success: true });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};

export const RenameGroup = async (req: RequestProps, res: Response) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName) {
    return res
      .status(400)
      .json({ message: "fill required fields", success: false });
  }
  try {
    const foundChat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
    });
    if (chatName === foundChat?.chatName) {
      return res
        .status(400)
        .json({ message: "you can't use same name", success: false });
    }
    const chat = await db.chat.update({
      where: {
        id: chatId,
      },
      data: {
        chatName,
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
        groupAdmin: {
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
    res.status(200).json({
      message: "group name changed successfully",
      chat,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};
export const AddToGroup = async (req: RequestProps, res: Response) => {
  const { userId, chatId } = req.body;
  if (!userId || !chatId) {
    return res
      .status(400)
      .json({ message: "please provide require fields", success: false });
  }
  try {
    const isChat = await db.chat.findUnique({
      where: {
        id: chatId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });
    if (isChat) {
      return res
        .status(400)
        .json({ message: "You can't add existing user again", success: false });
    }
    const chat = await db.chat.update({
      where: {
        id: chatId,
      },
      data: {
        users: {
          connect: [{ id: userId }],
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
        groupAdmin: {
          select: {
            id: true,
            username: true,
            profileUrl: true,
            email: true,
          },
        },
      },
    });
    if (!chat) {
      return res
        .status(400)
        .json({ message: "chat not found", success: false });
    }
    res.status(200).json({
      message: "user added to group",
      updatedChat: chat,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};

export const RemoveFromGroup = async (req: RequestProps, res: Response) => {
  const { userId, chatId } = req.body;
  if (!chatId || !chatId) {
    return res
      .status(400)
      .json({ message: "fill required fields", success: false });
  }
  try {
    const chat = await db.chat.update({
      where: {
        id: chatId,
      },
      data: {
        users: {
          disconnect: [{ id: userId }],
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
        groupAdmin: {
          select: {
            id: true,
            username: true,
            profileUrl: true,
            email: true,
          },
        },
      },
    });
    if (!chat) {
      return res
        .status(400)
        .json({ message: "chat not found", success: false });
    }
    res
      .status(200)
      .json({ message: "user removed", updatedChat: chat, success: true });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "something went wrong", success: false });
  }
};
