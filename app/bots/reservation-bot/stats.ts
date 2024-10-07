import { convertTo12HourFormat } from "../../time.js";
import { queue } from "./bot.js";
import { redis_client } from "./bot.js";
import { sendMsg } from "../../utils.js";
import { WASocket } from "@whiskeysockets/baileys";

export default async function stats(jid: string, sock: WASocket) {
  let freeSpots = 8;
  let attendees = await queue.size();
  //tell how many payers have attended how many free spots ,event game status: game on or pending
  let stats_text = `The reservation started at ${convertTo12HourFormat(
    (await redis_client.get(jid + "_s")) as string
  )}.${attendees} players have responded till now.There are still ${
    freeSpots - attendees
  } free spots left.Reservations are open until ${convertTo12HourFormat(
    (await redis_client.get(jid + "_e")) as string
  )}\nGame status: ${
    attendees >= 4 ? "Game on! 🎮️" : "Pending... ⏱️.\n~zuhu"
  }`;
  sendMsg(jid, stats_text, sock);
}
