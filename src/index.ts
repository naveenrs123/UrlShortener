import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { ShortenedUrlReq, ShortenedUrlRes } from '@interfaces';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const urlStore: Map<string, string> = new Map();

// Setup JSON Middleware
app.use(express.json());

app.get('/', (_: Request, res: Response) => {
  res.send('Welcome');
});

/**
 * Create a shortened URL.
 */
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

/**
 * Perform a redirect with the provided shortened URL.
 */
app.get('/:shortUrl', (req: Request, res: Response) => {
  const key = req.params['shortUrl'];
  const errorMessage = 'No long URL matches this short URL.';

  console.log(key);

  if (key == null || key.trim().length === 0 || !urlStore.has(key)) {
    res.setHeader('Content-Length', errorMessage.length).status(404).send('No long URL matches this short URL.');
    return;
  }

  res.redirect(urlStore.get(key)!);
});

app.delete('/:shortUrl', (req: Request, res: Response) => {
  const key = req.params['shortUrl'];
  urlStore.delete(key);
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

function tryRetrieveValidShortUrl(url: string, res: express.Response<ShortenedUrlRes, Record<string, unknown>>) {
  let keyCollisionRetries = 0;

  while (keyCollisionRetries < 3) {
    const urlHash = crypto.createHash('shake128', { outputLength: 5 + keyCollisionRetries });
    const key = urlHash.update(url).digest('hex');

    if (urlStore.has(key)) {
      if (urlStore.get(key) !== url) {
        keyCollisionRetries++;
        continue;
      }
    } else {
      urlStore.set(key, url);
    }

    res.send({
      key: key,
      longUrl: urlStore.get(key)!,
      shortUrl: `http://localhost:${port}/${key}`,
    });

    break;
  }

  return keyCollisionRetries;
}
