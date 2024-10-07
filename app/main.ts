import * as fs from "fs";
import { Boom } from "@hapi/boom";
import { sendMsg } from "./utils";
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  AuthenticationState,
  proto,
} from "@whiskeysockets/baileys";

let isShuttingDown = false;
let backupStorage = new Map<string, proto.WebMessageInfo>();

async function connectToWhatsApp(): Promise<void> {
  const {
    state,
    saveCreds,
  }: { state: AuthenticationState; saveCreds: () => Promise<void> } =
    await useMultiFileAuthState("auth");
  const sock: WASocket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    getMessage: async (key) => {
      const { id } = key;
      if (id) return backupStorage.get(id)?.message || undefined;
      return undefined;
    },
  });

  // Save credentials whenever they are updated
  sock.ev.on("creds.update", saveCreds);

  // Look for connection updates
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      // reconnect if not logged out
      if (shouldReconnect && !isShuttingDown) {
        console.log("Attempting to reconnect...");
        connectToWhatsApp().catch(console.error); // Attempt to reconnect
      } else if (isShuttingDown) {
        console.log("Shutdown in progress, not reconnecting.");
      } else {
        console.log(
          "You are logged out. Please rescan the QR code to log in again."
        );
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    console.log(
      "Received message:",
      msg.message.conversation,
      "from",
      msg.pushName
    );

    console.log("____raw____", msg);
  });

  // Handle graceful shutdown
  // process.on("SIGINT", async () => {
  //   console.log("Received SIGINT. Shutting down gracefully...");
  //   isShuttingDown = true; // Set the shutdown flag
  //   try {
  //     await sock.sendMessage("3437779992@c.us", {
  //       text: "Bot is shutting down. Goodbye!",
  //     });
  //   } catch (error) {
  //     console.error("Failed to send shutdown message:", error);
  //   }
  //   sock.end(new Error("Closing connection!")); // Close the connection
  //   process.exit(0); // Exit the process
  // });

  // process.on("SIGTERM", async () => {
  //   console.log("Received SIGTERM. Shutting down gracefully...");
  //   isShuttingDown = true; // Set the shutdown flag
  //   try {
  //     await sock.sendMessage("3437779992@c.us", {
  //       text: "Bot is shutting down. Goodbye!",
  //     });
  //   } catch (error) {
  //     console.error("Failed to send shutdown message:", error);
  //   }
  //   sock.end(new Error("Closing connection!"));
  //   process.exit(0); // Exit the process
  // });
}

// Start the connection
connectToWhatsApp().catch(console.error);
