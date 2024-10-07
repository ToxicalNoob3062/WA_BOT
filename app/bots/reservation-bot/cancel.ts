import { queue } from "./bot.js";
import { sendMsg } from "../../utils.js";
import { WASocket } from "@whiskeysockets/baileys";

export default async function cancel(
  jid: string,
  value: string,
  sock: WASocket,
  mentions?: string[]
) {
  //remove the reservation from the queue
  const done = await queue.remove(value);

  //take the number form the mentions
  const mentionsStr = mentions?.[0];
  const number = mentionsStr?.split("@")[0];
  //send a confirmation message
  if (done)
    sendMsg(
      jid,
      `@${number} has released a spot for others.  ~Zuhu`,
      sock,
      mentions
    );
  else
    sendMsg(
      jid,
      `@${number}, you have not made a reservation yet.  ~Zuhu`,
      sock,
      mentions
    );
}
