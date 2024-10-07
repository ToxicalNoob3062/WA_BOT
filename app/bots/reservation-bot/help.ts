import { sendMsg } from "../../utils.js";
import { WASocket } from "@whiskeysockets/baileys";

export default function help(jid: string, sock: WASocket) {
  //prepare a menu and a short description of each command
  const menu = `/help - display this menu\n/reserve - reserve a spot\n/cancel - cancel a reservation\n/list - list all reservations\n/stats - info about free spots`;
  sendMsg(jid, menu, sock);
}
