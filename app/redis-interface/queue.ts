import moment from "moment-timezone";
import { Redis } from "ioredis";

export class RedisQueue {
  private redis: Redis;
  private queueName: string;

  constructor(queueName: string, client: Redis) {
    this.redis = client;
    this.queueName = queueName;

    // Set the queue to expire at 11:00 PM every day in Ottawa time
    const now = moment().tz("America/Toronto");
    const elevenPM = moment()
      .tz("America/Toronto")
      .set({ hour: 23, minute: 0, second: 0, millisecond: 0 });
    const diff = elevenPM.diff(now, "seconds");
    this.redis.expire(this.queueName, diff);
  }

  // Add an element to the end of the list
  async add(value: string): Promise<boolean> {
    try {
      const elements = await this.redis.lrange(this.queueName, 0, -1);
      const valuePhoneNumber = value.split("@")[1];

      for (const element of elements) {
        const phoneNumber = element.split("@")[1];
        console.log(phoneNumber, valuePhoneNumber);
        if (phoneNumber == valuePhoneNumber) {
          return false; // Exit the main function
        }
      }

      await this.redis.rpush(this.queueName, value);
      return true; // Element added successfully
    } catch (error) {
      throw new Error("Error adding element to the queue: " + error);
    }
  }

  // Remove an element by phone number if present
  async remove(value: string): Promise<boolean> {
    try {
      const elements = await this.redis.lrange(this.queueName, 0, -1);
      const valuePhoneNumber = value.split("@")[1];
      let removed = false;

      for (const element of elements) {
        const phoneNumber = element.split("@")[1];
        if (phoneNumber == valuePhoneNumber) {
          await this.redis.lrem(this.queueName, 0, element); // Remove the specific element
          removed = true;
        }
      }

      return removed; // Return true if any elements were removed
    } catch (error) {
      throw new Error("Error removing element from the queue: " + error);
    }
  }

  // Get all elements in the queue
  async get(): Promise<string[]> {
    try {
      return await this.redis.lrange(this.queueName, 0, -1);
    } catch (error) {
      throw new Error("Error getting elements from the queue: " + error);
    }
  }

  async size(): Promise<number> {
    try {
      const length = await this.redis.llen(this.queueName);
      return length;
    } catch (error) {
      throw new Error("Error getting the size of the queue: " + error);
    }
  }

  //clear the queue
  async clear(): Promise<boolean> {
    try {
      await this.redis.del(this.queueName);
      return true;
    } catch (error) {
      throw new Error("Error clearing the queue: " + error);
    }
  }
}
