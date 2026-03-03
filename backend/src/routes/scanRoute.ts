import { Router } from 'express';
import multer from "multer";
import { analyzeDependencies, getScanResults } from '../controllers/scanController.ts'; // تأكد من الامتداد حسب إعدادات مشروعك

const router = Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }   
});

router.post("/analyze/:projectId", upload.single("file"), analyzeDependencies);
router.get("/results/:scanId", getScanResults);
export default router;