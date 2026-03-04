import { Router } from 'express';
import multer from "multer";
import { getScanResultsById, getLatestProjectScan, getProjectScans } from '../controllers/scanController.ts';
import { analyzeDependencies } from "../handlers/analyzeDependencies.ts"

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
    "/analyze/:projectId",
    upload.any(),
    (req, res, next) => {
        // تأكد من وجود files قبل استخدام Object.keys
        const files = req.files as Express.Multer.File[] | undefined;
        
        if (files && files.length > 0) {
            console.log("📁 Files received:", files.map(f => ({
                fieldname: f.fieldname,
                originalname: f.originalname,
                size: f.size
            })));
        } else {
            console.log("📁 No files received in request");
        }
        
        next();
    },
    analyzeDependencies
);
router.get("/results/:scanId", getScanResultsById);
router.get("/project/:projectId/latest", getLatestProjectScan);
router.get("/project/:projectId/history", getProjectScans);

export default router;