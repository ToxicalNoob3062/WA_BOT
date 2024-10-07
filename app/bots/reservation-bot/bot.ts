import cancel from "./cancel.js";
import dotenv from "dotenv";
import end from "./end.js";
import help from "./help.js";
import list from "./list.js";
import moment from "moment-timezone";
import reserve from "./reserve.js";
import start from "./start.js";
import stats from "./stats.js";
import { authorize } from "../../utils.js";
import { proto, WASocket } from "@whiskeysockets/baileys";
import { RedisQueue } from "../../redis-interface/queue.js";

dotenv.config();

type commands =
  | "/help"
  | "/reserve"
  | "/cancel"
  | "/list"
  | "/stats"
  | "/start"
  | "/end";

export const queue = new RedisQueue("badminton");

export function processReservations(
  msg: proto.IWebMessageInfo,
  sock: WASocket
) {
  // /command some args
  const command: commands = msg.message?.conversation?.split(
    " "
  )[0] as commands;
  const jid = msg.key.remoteJid as string;
  switch (command) {
    case "/help":
      help(jid, sock);
      break;
    case "/reserve":
      reserve(
        jid,
        produce_value(
          msg.pushName as string,
          msg.messageTimestamp.toString(),
          msg.key.participant as string
        ),
        sock,
        [msg.key.participant as string]
      );
      break;
    case "/cancel":
      cancel(
        jid,
        produce_value(
          msg.pushName as string,
          msg.messageTimestamp.toString(),
          msg.key.participant as string
        ),
        sock,
        [msg.key.participant as string]
      );
      break;
    case "/list":
      list(jid, sock);
      break;
    case "/stats":
      stats(jid, sock);
      break;
    // case "/start":
    //   if (authorize(msg, sock)) start(sock);
    //   break;
    // case "/end":
    //   if (authorize(msg, sock)) end(sock);
    // break;
  }
}

// Convert timestamp to Ottawa time zone to only hours and minutes
function convertTime(time: string) {
  return moment.unix(parseInt(time)).tz("America/Toronto").format("HH:mm");
}

// [remoteJid, participant, timestamp, pushname, extra...]
function produce_value(name: string, time: string, phone: string): string {
  phone = phone.split("@")[0];
  return `${name}@${phone}@(${convertTime(time)})`;
}
