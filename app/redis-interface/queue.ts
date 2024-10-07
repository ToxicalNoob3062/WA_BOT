import { Redis } from "ioredis";

export class RedisQueue {
  private redis: Redis;
  private queueName: string;

  constructor(queueName: string, client: Redis) {
    this.redis = client;
    this.queueName = queueName;
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
}
