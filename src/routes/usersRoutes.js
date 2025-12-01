import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { createUploader } from "../middleware/uploadMiddleware.js";
import { userLogin, userRegister } from "../controller/usersControllers.js";


const router = express.Router();
const excelUpload = createUploader("uploads/excel", "snc-kit-upload");

router.post("/register", userRegister);
router.post("/login",userLogin);

router.post("/", authenticate, authorize(["teacher", "admin"]), userRegister);
router.get("/checkToken", authenticate, authorize(["user"]), (req,res)=>{
    res.json({})
});

export default router;
