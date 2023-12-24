import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import crypto from 'crypto';
import { ShortenedUrlRes } from './interfaces/shortened-url-res.js';

const app: Express = express();
const port = process.env.PORT;

// Setup JSON Middleware
app.use(express.json());

const urlStore2 = new Map<string, string>();

/**
 * Create a shortened URL.
 */
app.post('/', (req: Request, res: Response) => {
  const url: string = req.body.url;

  if (url == null || url.trim().length === 0) {
    res.status(400).send('Missing field: url\n');
    return;
  }

  const hasInvalidHttpPrefix = /^http(s)?:\/\//.test(url);
  if (hasInvalidHttpPrefix) {
    res.status(400).send('URLs must start with "http://" or "https://" for successful redirection.');
  }

  const keyCollisionRetries = tryRetrieveValidShortUrl(url, res);
  if (keyCollisionRetries === 3) {
    res.status(500).send('ERROR: Unable to save. Exceeded maximum number of key collision retries.');
  }
});

function tryRetrieveValidShortUrl(url: string, res: Response<ShortenedUrlRes>) {
  let keyCollisionRetries = 0;

  while (keyCollisionRetries < 3) {
    const urlHash = crypto.createHash('shake128', { outputLength: 5 + keyCollisionRetries });
    const key = urlHash.update(url).digest('hex');

    if (urlStore2.has(key)) {
      if (urlStore2.get(key) !== url) {
        keyCollisionRetries++;
        continue;
      }
    } else {
      urlStore2.set(key, url);
    }

    res.send({
      key: key,
      longUrl: urlStore2.get(key)!,
      shortUrl: `http://localhost:${port}/${key}`,
    });

    break;
  }

  return keyCollisionRetries;
}

/**
 * Perform a redirect with the provided shortened URL.
 */
app.get('/:shortUrl', (req: Request, res: Response) => {
  const key = req.params['shortUrl'];
  const errorMessage = 'No matching redirect could be found for the requested shortened URL.';

  if (key == null || key.trim().length === 0 || !urlStore2.has(key)) {
    res.setHeader('Content-Length', errorMessage.length).status(404).send(errorMessage);
    return;
  }

  res.redirect(urlStore2.get(key)!);
});

app.delete('/:shortUrl', (req: Request, res: Response) => {
  const key = req.params['shortUrl'];
  urlStore2.delete(key);
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
