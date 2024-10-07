import { queue } from "./bot.js";
import { sendMsg } from "../../utils.js";
import { WASocket } from "@whiskeysockets/baileys";

export default async function reserve(
  jid: string,
  value: string,
  sock: WASocket,
  mentions?: string[]
) {
  //add to the queue
  const done = await queue.add(value);

  //take the number form the mentions
  const mentionsStr = mentions?.[0];
  const number = mentionsStr?.split("@")[0];
  //send a confirmation message
  if (done)
    sendMsg(
      jid,
      `Congrats @${number}!🎉 You have successfully reserved a spot.`,
      sock,
      mentions
    );
  else
    sendMsg(
      jid,
      `@${number}, you have already made a reservation.`,
      sock,
      mentions
    );
}
