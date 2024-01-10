import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import Router from "./routes/user-route";
import { errorHandler, notFound } from "./middlewares/errorMiddleware";
import chatRouter from "./routes/chat-route";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("hello world");
});
app.use("/api/user", Router);
app.use("/chat", chatRouter);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
