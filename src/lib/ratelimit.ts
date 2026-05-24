import {Ratelimit} from '@upstash/ratelimit';
import {redis} from './redis';

// Per-user limit for authenticated procedures
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  analytics: true,
  prefix: "rl:user",
});

// Per-IP limit for public/unauthenticated procedures (protects against scraping)
export const publicRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60s"),
  analytics: true,
  prefix: "rl:public",
});