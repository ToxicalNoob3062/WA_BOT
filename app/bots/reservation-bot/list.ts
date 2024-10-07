import { convertTo12HourFormat } from "../../time.js";
import { queue } from "./bot.js";
import { sendMsg } from "../../utils.js";
import { WASocket } from "@whiskeysockets/baileys";

export default async function list(jid: string, sock: WASocket) {
  const entries = await queue.get();
  const table_text =
    entries.length === 0
      ? "No reservations yet! 🌞"
      : "Todays Attendees: 🏸\n" +
        entries.reduce((acc, entry, index) => {
          const [name, , timeWithParentheses] = entry.split("@");
          const time = timeWithParentheses.slice(1, -1); // Remove parentheses
          return (
            acc + `${index + 1}. ${name} - ${convertTo12HourFormat(time)}\n`
          );
        }, "");
  sendMsg(jid, table_text + "\n ~Zuhu", sock);
}
