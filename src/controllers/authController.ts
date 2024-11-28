import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

export const register = async (req: Request, res: Response) => {

  const { username, password, phoneNumber, title, description, longitude, latitude } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "All fields are required" });
    return
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: IUser = new User({
      username, password: hashedPassword, phoneNumber, title, description, location: {
        type: "Point",
        coordinates: [longitude ? longitude : 76.717873 , latitude ? latitude : 30.704649], 
      }, role: "user"
    });
    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "All fields are required" });
    return
  }

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return
    }

    const token = generateToken(user);

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
};

const generateToken = (user: IUser) => {
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
  return token
}