import { Router } from 'express';
import multer from "multer";
import { getScanResultsById, getLatestProjectScan, getProjectScans } from '../controllers/scanController.ts';
import { analyzeDependencies } from "../handlers/analyzeDependencies.ts"
import { getScanStatus, queueScan } from '../services/queue.service.ts';

const router = Router();



const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
router.post(
    "/analyze/:projectId",
    upload.single('packageLock'),
    analyzeDependencies
);
 
router.get("/results/:scanId", getScanResultsById);
router.get("/project/:projectId/latest", getLatestProjectScan);
router.get("/project/:projectId/history", getProjectScans);

export default router;