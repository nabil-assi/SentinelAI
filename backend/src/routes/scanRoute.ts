import { Router } from 'express';
import multer from "multer";
import { getScanResultsById, getLatestProjectScan, getProjectScans } from '../controllers/scanController';
import { analyzeDependencies } from "../handlers/analyzeDependencies"
// import { getScanStatus, queueScan } from '../services/queue.service.ts';
import { protect } from '../middlewares/authMiddleware';

const router = Router();



const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
router.post(
    "/analyze/:projectId",
    protect as any,
    upload.single('packageLock'),
    analyzeDependencies
);

router.get("/results/:scanId", getScanResultsById);
router.get("/project/:projectId/latest", getLatestProjectScan);
router.get("/project/:projectId/history", getProjectScans);

export default router;