import Redis from "ioredis";
import { backupStorage } from "./main.js";
import { convertTo12HourFormat } from "./time.js";
import { proto, WASocket } from "@whiskeysockets/baileys";

export async function sendMsg(
  jid: string,
  content: string,
  sock: WASocket,
  mentions?: string[],
  reqMsg?: proto.IWebMessageInfo
) {
  try {
    const sentMsg = await sock.sendMessage(
      jid,
      {
        text: content,
        mentions,
      },
      {
        quoted: reqMsg,
      }
    );
    if (sentMsg?.key.id) backupStorage.set(sentMsg.key.id, sentMsg);
  } catch (e) {
    console.error("Error sending message:", e);
  }
}

export function retrieveCommand(msg: proto.IWebMessageInfo) {
  return msg?.message?.conversation?.trim().split(" ")[0];
}

//authorize function
export function isAdmin(msg: proto.IWebMessageInfo, sock: WASocket) {
  if (!msg.key.fromMe) {
    sendMsg(
      msg.key.remoteJid as string,
      "You are not authorized to use this command.",
      sock,
      undefined,
      msg
    );
    return false;
  }
  return true;
}

//logic to add jid to a set
export async function addGroup(
  jid: string,
  bot_name: string,
  sock: WASocket,
  client: Redis
) {
  //see if the jid is already in the set
  if (await client.sismember(bot_name, jid)) {
    sendMsg(
      jid,
      "This group is already authorized to use the bot.\n~zuhu",
      sock
    );
  } else {
    //add the jid to the set
    client.sadd(bot_name, jid);
    sendMsg(jid, "This group is now authorized to use the bot.\n~zuhu", sock);
  }
}

//verify if the user is authorized to use the bot
export async function authorize(jid: string, bot_name: string, client: Redis) {
  return await client.sismember(bot_name, jid);
}

//remove the permission to use the bot
export async function removeGroup(
  jid: string,
  bot_name: string,
  sock: WASocket,
  client: Redis
) {
  //see if the jid is already in the set
  if (await client.sismember(bot_name, jid)) {
    //remove the jid from the set
    client.srem(bot_name, jid);
    sendMsg(
      jid,
      "This group will be no longer authorized to use the bot.\n~zuhu",
      sock
    );
  } else {
    sendMsg(jid, "This group was not authorized to use the bot.\n~zuhu", sock);
  }
}

export function setReservationTime(
  jid: string,
  time: string | undefined,
  type: "start" | "end",
  sock: WASocket,
  redis_client: Redis
) {
  if (time) {
    redis_client.set(jid + (type === "start" ? "_s" : "_e"), time);
    sendMsg(
      jid,
      `Reservation ${type} time has been set to ${convertTo12HourFormat(
        time
      )}\n~zuhu`,
      sock
    );
  }
}
