import { AnyMessageContent, proto, WASocket } from "@whiskeysockets/baileys";

export async function sendMsg(
  jid: string,
  content: AnyMessageContent,
  sock: WASocket,
  cache: Map<string, proto.WebMessageInfo>,
  reqMsg?: proto.IWebMessageInfo
) {
  try {
    const sentMsg = await sock.sendMessage(jid, content, { quoted: reqMsg });
    if (sentMsg?.key.id) cache.set(sentMsg.key.id, sentMsg);
  } catch (e) {
    console.error("Error sending message:", e);
  }
}
