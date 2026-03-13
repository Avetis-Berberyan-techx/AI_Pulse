import { Router } from "express";
import {
  getDocuments,
  getDocument,
  uploadDocument,
  removeDocument,
} from "../controllers/documentController.js";
import { upload } from "../middleware/upload.js";
import { validateUploadedFile } from "../middleware/fileValidation.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

const uploadRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
});

router.get("/documents", getDocuments);
router.get("/documents/:id", getDocument);
router.post(
  "/documents",
  uploadRateLimiter,
  upload.single("file"),
  validateUploadedFile,
  uploadDocument,
);
router.delete("/documents/:id", removeDocument);

export default router;
