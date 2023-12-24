interface ValidShortenedUrlRes {
  key: string;
  longUrl: string;
  shortUrl: string;
}

export type ShortenedUrlRes = ValidShortenedUrlRes | string;
