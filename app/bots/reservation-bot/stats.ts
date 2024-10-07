import { queue } from "./bot.js";
import { sendMsg } from "../../utils.js";
import { WASocket } from "@whiskeysockets/baileys";

export default async function stats(jid: string, sock: WASocket) {
  let freeSpots = 8;
  let attendees = await queue.size();
  //tell how many payers have attended how many free spots ,event game status: game on or pending
  let stats_text = `${attendees} players have responded till now. \nThere are still ${
    freeSpots - attendees
  } free spots left.\nGame status: ${
    attendees >= 4 ? "Game on! 🎮️" : "Pending... ⏱️"
  }`;
  sendMsg(jid, stats_text, sock);
}
