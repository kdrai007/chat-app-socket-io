import * as express from "express";
import {
  GetUser,
  UserAuth,
  UserRegistration,
} from "../controllers/user-controllers";
import { Authenticate } from "../middlewares/auth-middleware";
const router = express.Router();

router.post("/", UserRegistration);
router.get("/", Authenticate, GetUser);
router.post("/login", UserAuth);

export default router;
