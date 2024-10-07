import moment from "moment-timezone";
import { redis_client } from "./bots/reservation-bot/bot";

// Convert timestamp to Ottawa time zone to only hours and minutes
export function convertTime(zone: string, timeStamp: string) {
  return moment.unix(parseInt(timeStamp)).tz(zone).format("HH:mm");
}

export function convertTo12HourFormat(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

//take two HH:MM strings and return 1 if a > b -1 if a < b and 0 if a == b
export function comapare(a: string, b: string): number {
  const [a_hours, a_minutes] = a.split(":").map(Number);
  const [b_hours, b_minutes] = b.split(":").map(Number);

  if (a_hours > b_hours) return 1;
  if (a_hours < b_hours) return -1;
  if (a_minutes > b_minutes) return 1;
  if (a_minutes < b_minutes) return -1;
  return 0;
}

export async function isInRange(jid: string, timeStamp: string) {
  const convertedTime = convertTime("America/Toronto", timeStamp);
  const startTime = await redis_client.get(jid + "_s");
  const endTime = await redis_client.get(jid + "_e");
  if (!startTime || !endTime) return false;
  return (
    comapare(startTime, convertedTime) >= 0 &&
    comapare(endTime, convertedTime) <= 0
  );
}
