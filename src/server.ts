import "dotenv/config";
import express from "express";
import type { 
	Request, 
	Response,  
} from "express";
import pubsubRouter from "./routes/pubsub.route";
import detectionRouter from "./routes/detection.route";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req: Request, res: Response) => {
	res.send("Phishing API backend is running.");
});

app.get("/health", (_req: Request, res: Response) => {
	res.json({ ok: true });
});

app.use("/pubsub", pubsubRouter);
app.use("/detect", detectionRouter);

app.use((err: unknown, _req: Request, res: Response, _next: unknown) => {
	console.error(err);
	res.status(500).json({ ok: false, error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
