import { sendMsg } from "../../utils.js";
import { WASocket } from "@whiskeysockets/baileys";

export default function help(jid: string, sock: WASocket) {
  //prepare a menu and a short description of each command
  const menu = `Hello, I am zuhu 🧠.I will help you to manage your queue by following means:\n1. /help - display this menu\n2. /reserve - reserve a spot\n3. /cancel - cancel a reservation\n4. /list - list all reservations\n5. /stats - current summary of the queue\n~zuhu`;
  sendMsg(jid, menu, sock);
}
