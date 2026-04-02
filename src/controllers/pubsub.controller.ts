import { Request, Response } from "express";
import * as gmailService from "../services/gmail.service";

export const handlePubSub = async (req: Request, res: Response) => {
  try {
    const message = req.body.message;

    if (!message) return res.sendStatus(400);

    const decoded = JSON.parse(
      Buffer.from(message.data, "base64").toString()
    );

    console.log("📩 Gmail Notification:", decoded);

    const processHistory = (
      gmailService as { processHistory?: (historyId: string) => Promise<unknown[]> }
    ).processHistory;

    if (!processHistory) return res.sendStatus(500);

    const analyses = await processHistory(decoded.historyId);
    console.log("📨 Email analysis:", analyses);

    res.status(200).json({
      ok: true,
      historyId: decoded.historyId,
      processed: analyses.length,
      analyses,
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};