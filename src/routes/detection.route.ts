import { Router } from "express";
import { detectSpam } from "../controllers/detection.controller";

const router = Router();

router.post("/spam", detectSpam);

export default router;