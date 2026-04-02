import "dotenv/config";
import express from "express";
import type { 
	Request, 
	Response,  
} from "express";

const PORT = process.env.PORT || 5000;
const app = express();

app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
