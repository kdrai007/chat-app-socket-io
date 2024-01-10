import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  return (
    secret &&
    jwt.sign({ id }, secret, {
      expiresIn: "30d",
    })
  );
};
