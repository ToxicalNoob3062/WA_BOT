import { backupStorage } from "./main.js";
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

//authorize function
export function authorize(msg: proto.IWebMessageInfo, sock: WASocket) {
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
