import { Router } from "express";
import { handlePubSub } from "../controllers/pubsub.controller";

const router = Router();

router.post("/", handlePubSub);

export default router;