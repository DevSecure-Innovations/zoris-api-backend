import { Request, Response } from "express";
import { analyzeEmail } from "../services/sample-detection.service";

export const detectSpam = (req: Request, res: Response) => {
  const analysis = analyzeEmail(req.body ?? {});

  res.status(200).json({
    ok: true,
    analysis,
  });
};