import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { URLStore } from "./interfaces/url-store.js";
import { ShortenedUrlReq } from "./interfaces/shortened-url-req.js";
import { ShortenedUrlRes } from "./interfaces/shortened-url-res.js";
import crypto from "crypto";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const urlStore: URLStore = {};

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome");
});

app.post(
  "/",
  (
    req: Request<unknown, ShortenedUrlRes, ShortenedUrlReq>,
    res: Response<ShortenedUrlRes>
  ) => {
    console.log(req.body);

    const url = req.body.url;

    const hash = crypto.createHash("shake256", { outputLength: 12 });
    const key = hash.update(url).digest().toString();

    if (!(key in urlStore)) {
      urlStore[key] = url;
    }

    res.send({
      key: key,
      longUrl: urlStore[key],
      shortUrl: `http://localhost:8000/key`,
    });
  }
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
