import { Redis } from "ioredis";

export function getRedisClient(): Redis {
  if (!process.env.REDIS_URI) {
    throw new Error("REDIS_URL is not set in the environment variables");
  }
  return new Redis(process.env.REDIS_URI);
}
