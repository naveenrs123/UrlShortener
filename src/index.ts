import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { ShortenedUrlReq, ShortenedUrlRes, URLStore } from '@interfaces';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const urlStore: URLStore = {};

// Setup JSON Middleware
app.use(express.json());

app.get('/', (_: Request, res: Response) => {
  console.log(crypto.getHashes());
  res.send('Welcome');
});

app.post('/', (req: Request<unknown, ShortenedUrlRes, ShortenedUrlReq>, res: Response<ShortenedUrlRes>) => {
  const url = req.body.url;

  if (url == null || url.trim().length === 0) {
    res.status(400).send('Missing field: url\n');
    return;
  }

  const hasInvalidHttpPrefix = !(url.startsWith('http://') || url.startsWith('https://'));
  if (hasInvalidHttpPrefix) {
    res.status(400).send('URLs must start with "http://" or "https://" for successful redirection.');
  }

  const keyCollisionRetries = tryRetrieveValidShortUrl(url, res);
  if (keyCollisionRetries === 3) {
    res.status(500).send('ERROR: Unable to save. Exceeded maximum number of key collision retries.');
  }
});

app.get('/:shortUrl', (req: Request, res: Response) => {
  const key = req.params['shortUrl'];
  const errorMessage = 'No long URL matches this short URL.';

  console.log(key);

  if (key == null || key.trim().length === 0 || !(key in urlStore)) {
    res.setHeader('Content-Length', errorMessage.length).status(404).send('No long URL matches this short URL.');
    return;
  }

  res.redirect(urlStore[key]);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

function tryRetrieveValidShortUrl(url: string, res: express.Response<ShortenedUrlRes, Record<string, unknown>>) {
  let keyCollisionRetries = 0;

  while (keyCollisionRetries < 3) {
    const urlHash = crypto.createHash('shake128', { outputLength: 5 + keyCollisionRetries });
    const key = urlHash.update(url).digest('hex');

    if (key in urlStore) {
      if (urlStore[key] !== url) {
        keyCollisionRetries++;
        continue;
      }
    } else {
      urlStore[key] = url;
    }

    res.send({
      key: key,
      longUrl: urlStore[key],
      shortUrl: `http://localhost:${port}/${key}`,
    });

    break;
  }

  return keyCollisionRetries;
}
