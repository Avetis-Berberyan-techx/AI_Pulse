import type { Request, Response, NextFunction } from "express";
import type { RateLimitOptions, RateLimitEntry } from "../types/rateLimit.js";

export const createRateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, keyGenerator } = options;
  const hits = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : (req.ip ?? "unknown");
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      hits.set(key, { count: 1, windowStart: now });
      return next();
    }

    const nextCount = entry.count + 1;
    entry.count = nextCount;
    hits.set(key, entry);

    if (nextCount > max) {
      res.status(429).json({
        error: "Rate limit exceeded",
        message: `Too many uploads. Limit is ${max} per ${Math.round(
          windowMs / 1000,
        )} seconds.`,
      });
      return;
    }

    next();
  };
};
