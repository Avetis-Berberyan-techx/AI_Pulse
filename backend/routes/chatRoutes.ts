import { Router } from "express";
import { chatDocument, chatGeneralHandler } from "../controllers/chatController.js";

const router = Router();

router.post("/chat", chatDocument);
router.post("/chat/general", chatGeneralHandler);

export default router;
