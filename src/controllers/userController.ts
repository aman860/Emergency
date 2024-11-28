
import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcryptjs";

export const getNearestUsers = async (req: Request, res: Response) => {
    const { latitude, longitude, pageNumber, perPageData } = req.query;
    const page = pageNumber ? pageNumber : 1;
    const limit = perPageData ? perPageData : 10;


    if (!latitude || !longitude) {
        res.status(400).json({ error: "Latitude and longitude are required." });
        return
    }

    const skip = (Number(page) - 1) * Number(limit);

    try {
        const users = await User.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(`${longitude}`), parseFloat(`${latitude}`)],
                    },
                    distanceField: "distance", // Field to store calculated distance
                    spherical: true,
                },
            },
            {
                $project: {
                    username: 1,
                    phone: 1,
                    description: 1,
                    title: 1,
                    location: 1
                }
            },
            { $skip: skip }, // Pagination
            { $limit: parseInt(`${limit}`) }, // Limit results
        ]);
        const totalUsers = users.length;
        res.json({
            users,
            totalPages: Math.ceil(totalUsers / Number(limit)),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching nearest users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    const { pageNumber, perPageData } = req.query;
    const page = pageNumber ? pageNumber : 1;
    const limit = perPageData ? perPageData : 10;
    const skip = (Number(page) - 1) * Number(limit);

    try {
        const users = await User.aggregate([
            {
                $project: {
                    username: 1,
                    phoneNumber: 1,
                    description: 1,
                    title: 1,
                    location: 1
                }
            },
            { $skip: skip }, // Pagination
            { $limit: parseInt(`${limit}`) }, // Limit results
        ]);

        const totalUsers = users.length;
        res.json({
            users,
            totalPages: Math.ceil(totalUsers / Number(limit)),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching nearest users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateUserById = async (req: Request, res: Response) => {


    try {
        const updatedUser = await User.findByIdAndUpdate(req.query.id, req.body, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error("Error fetching nearest users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const deleteUserById = async (req: Request, res: Response) => {


    try {
        const deletedUser = await User.findByIdAndDelete(req.query.id);
        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error("Error fetching nearest users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserById = async (req: Request, res: Response) => {


    try {
        const user = await User.findById(req.query.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching nearest users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createUser = async (req: Request, res: Response) => {

    const { username,   phoneNumber, title, description, role } = req.body;
  
    
  
    try {
      const hashedPassword = await bcrypt.hash("123", 10);
      const newUser: IUser = new User({
        username, password: hashedPassword, phoneNumber, title, description, location: {
          type: "Point",
          coordinates: [ 76.717873 ,  30.704649], 
        }, role: role
      });
      await newUser.save();
       
  
      res.status(201).json({ message: `${role} registered successfully` });
    } catch (err) {
      res.status(500).json({ message: `Error registering ${role}` });
    }
  };