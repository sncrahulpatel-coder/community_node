import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/uploadMiddleware.js";
import { adminLogin, deleteUser, editUser, getStudents, registerAdmin, registerUser, usersList } from "../controller/adminControllers.js";


const router = express.Router();
const excelUpload = createUploader("uploads/excel", "snc-kit-upload");

router.post("/register", registerAdmin);
router.post("/login",adminLogin);

router.post("/registerUser", authenticate, authorize(["admin"]), registerUser);
router.get("/users", authenticate, authorize(["admin"]), usersList);
router.put("/user/:id", authenticate, authorize(["admin"]), editUser);
router.delete("/user/:id", authenticate, authorize(["admin"]), deleteUser);

export default router;
