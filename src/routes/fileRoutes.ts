import { Router } from "express";
import { createFile } from "../controllers/fileController";
import { multerStorage } from "../middleware/fileUpload";

const router = Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/upload", multerStorage.single("file"), createFile);

export default router;
