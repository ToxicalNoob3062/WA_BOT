import cancel from "./cancel.js";
import dotenv from "dotenv";
import help from "./help.js";
import list from "./list.js";
import reserve from "./reserve.js";
import stats from "./stats.js";
import { Constants } from "./constant.js";
import { convertTime, convertTo12HourFormat, isInRange } from "../../time.js";
import { getRedisClient } from "../../redis-interface/client.js";
import { proto, WASocket } from "@whiskeysockets/baileys";
import { RedisQueue } from "../../redis-interface/queue.js";
import {
  addGroup,
  authorize,
  isAdmin,
  removeGroup,
  retrieveCommand,
  sendMsg,
  setReservationTime,
} from "../../utils.js";

dotenv.config();

type commands =
  | "/help"
  | "/reserve"
  | "/cancel"
  | "/list"
  | "/stats"
  | "/start"
  | "/end"
  | "/clear"
  | "/authorize"
  | "/unauthorize";

export const redis_client = getRedisClient();
export const queue = new RedisQueue("badminton", redis_client);

export async function processReservations(
  msg: proto.IWebMessageInfo,
  sock: WASocket
) {
  // essential variables
  const command: commands = retrieveCommand(msg) as commands;
  const jid = msg.key.remoteJid as string;
  const timeStamp = msg.messageTimestamp.toString();

  //veirfy if they are authorized to use the bot
  if (!(await authorize(jid, Constants.bot_name, redis_client))) return;

  //check if the group can reserve the seat between this time right now.
  if (!(await isInRange(jid, timeStamp))) {
    sendMsg(
      jid,
      `You can only use this robot from ${convertTo12HourFormat(
        (await redis_client.get(jid + "_s")) as string
      )} to ${convertTo12HourFormat(
        (await redis_client.get(jid + "_e")) as string
      )}`,
      sock,
      undefined,
      msg
    );
    return;
  }

  //switch case to handle the commands
  switch (command) {
    //user commands
    case "/help":
      help(jid, sock);
      break;
    case "/reserve":
      reserve(
        jid,
        produce_value(
          msg.pushName as string,
          timeStamp,
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
          timeStamp,
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

    //admin commands
    case "/authorize":
      if (isAdmin(msg, sock)) {
        setReservationTime(jid, "8:00", "start", sock, redis_client);
        setReservationTime(jid, "23:00", "end", sock, redis_client);
        addGroup(jid, Constants.bot_name, sock, redis_client);
      }
      break;
    case "/unauthorize":
      if (isAdmin(msg, sock))
        removeGroup(jid, Constants.bot_name, sock, redis_client);
      break;
    case "/start":
      if (isAdmin(msg, sock)) {
        const start_time = msg?.message?.conversation?.split("@")[1]; //HH:MM
        setReservationTime(jid, start_time, "start", sock, redis_client);
      }
      break;
    case "/end":
      if (isAdmin(msg, sock)) {
        const end_time = msg?.message?.conversation?.split("@")[1]; //HH:MM
        setReservationTime(jid, end_time, "end", sock, redis_client);
      }
      break;
    case "/clear":
      if (isAdmin(msg, sock)) {
        const cleared = await queue.clear();
        if (cleared) {
          sendMsg(jid, "Queue has been cleared manually!", sock);
        }
      }
      break;
  }
}

function produce_value(name: string, time: string, phone: string): string {
  phone = phone.split("@")[0];
  return `${name}@${phone}@(${convertTime("America/Toronto", time)})`;
}
