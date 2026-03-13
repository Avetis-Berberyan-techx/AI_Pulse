import type { Request } from "express";

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
};

export type RateLimitEntry = {
  count: number;
  windowStart: number;
};
