import { Router } from "express";
import { createUser, deleteUserById, getAllUsers, getNearestUsers, getUserById, updateUserById } from "../controllers/userController";

const router = Router();

router.get("/getNearbyUsers", getNearestUsers);
router.get("/allUsers", getAllUsers);
router.put("/userById", updateUserById);
router.delete("/userById", deleteUserById);
router.get("/userDataById", getUserById);
router.post("/createUser", createUser);

export default router;