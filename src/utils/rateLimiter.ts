import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/** 1 hour */
export const RATE_LIMIT_WINDOW = 3600;

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(4, `${RATE_LIMIT_WINDOW} s`),
  prefix: 'ratelimit:free',
});
