import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import { ShortenedUrlReq, ShortenedUrlRes, URLStore } from "@interfaces";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const urlStore: URLStore = {};

// Setup JSON Middleware
app.use(express.json());

app.get("/", (_: Request, res: Response) => {
  res.send("Welcome");
});

app.post(
  "/",
  (
    req: Request<unknown, ShortenedUrlRes, ShortenedUrlReq>,
    res: Response<ShortenedUrlRes>
  ) => {
    const url = req.body.url;
    const hash = crypto.createHash("shake256", { outputLength: 5 });
    const key = hash.update(url).digest("hex");

    if (!(key in urlStore)) {
      urlStore[key] = url;
      console.log("Added Key!");
    }

    res.send({
      key: key,
      longUrl: urlStore[key],
      shortUrl: `http://localhost:8000/${key}`,
    });
  }
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
