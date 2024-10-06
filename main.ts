import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

let isShuttingDown = false;
let backupStorage = new Map();

async function main() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    getMessage: async (key) => {
      const { id } = key;
      return backupStorage.get(id).message;
    },
  });

  // Save credentials whenever they are updated
  sock.ev.on("creds.update", saveCreds);

  //look for connection updates
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.cause !== DisconnectReason.loggedOut;

      if (shouldReconnect && !isShuttingDown) {
        console.log("Attempting to reconnect...");
        main(); // Attempt to reconnect
      } else if (isShuttingDown) {
        console.log("Shutdown in progress, not reconnecting.");
      } else {
        console.log(
          "You are logged out. Please rescan the QR code to log in again."
        );
      }
    } else if (connection === "open") {
      console.log("Opened connection");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    console.log("New message", m);
  });

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Received SIGINT. Shutting down gracefully...");
    isShuttingDown = true; // Set the shutdown flag
    await sock.sendMessage("your_number@c.us", {
      text: "Bot is shutting down. Goodbye!",
    });
    sock.end(new Error("Closing connection!")); // Close the connection
    process.exit(0); // Exit the process
  });

  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM. Shutting down gracefully...");
    isShuttingDown = true; // Set the shutdown flag
    await sock.sendMessage("your_number@c.us", {
      text: "Bot is shutting down. Goodbye!",
    });
    sock.end(new Error("Closing connection!"));
    process.exit(0); // Exit the process
  });
}

// Start the connection
main().catch(console.error);
