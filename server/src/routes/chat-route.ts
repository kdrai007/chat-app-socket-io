import express from "express";
import { Authenticate } from "../middlewares/auth-middleware";
import {
  AccessChat,
  AddToGroup,
  FetchChats,
  GroupChat,
  RemoveFromGroup,
  RenameGroup,
} from "../controllers/chat-controllers";
const router = express.Router();
// Routes for managing chats
router.post("/", Authenticate, AccessChat);
router.get("/", Authenticate, FetchChats);
// routes for handling group chat
router.post("/group", Authenticate, GroupChat);
router.put("/group/rename", Authenticate, RenameGroup);
// routes for managing chats's users
router.put("/group/add", Authenticate, AddToGroup);
router.delete("/group/remove", Authenticate, RemoveFromGroup);

export default router;
