import { Router } from "express";
import { createFile } from "../controllers/fileController";
import { multerStorage } from "../middleware/fileUpload";

const router = Router();

router.post("/upload", multerStorage.single("file"), createFile);

export default router;
