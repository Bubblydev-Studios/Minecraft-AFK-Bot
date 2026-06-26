const http = require('http');
const mineflayer = require('mineflayer');
const config = require('./config.json');

/* -------------------- Render health server -------------------- */
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft AFK Bot is running!');
}).listen(PORT, () => {
  console.log(`🌐 Health server listening on port ${PORT}`);
});

/* -------------------- Bot state -------------------- */
let bot;

/* IMPORTANT: change this if needed */
const MC_VERSION = "1.21.8"; // adjust if your server differs

function startBot() {
  console.log("🔌 Attempting to connect to Minecraft server...");

bot = mineflayer.createBot({
  host: config.serverHost,
  port: config.serverPort,
  username: config.botUsername,
  auth: 'offline',
  version: "1.21.8",
  skipValidation: true
});

  let movementPhase = 0;
  const STEP_INTERVAL = 1500;
  const JUMP_DURATION = 500;

  bot.on('spawn', () => {
    console.log(`✅ ${config.botUsername} spawned in world`);

    setTimeout(() => {
      bot.setControlState('sneak', true);
      console.log("🟢 AFK mode enabled");
    }, 3000);

    setTimeout(movementCycle, STEP_INTERVAL);
  });

  function movementCycle() {
    if (!bot || !bot.entity) return;

    switch (movementPhase) {
      case 0:
        bot.setControlState('forward', true);
        bot.setControlState('back', false);
        bot.setControlState('jump', false);
        break;

      case 1:
        bot.setControlState('forward', false);
        bot.setControlState('back', true);
        break;

      case 2:
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), JUMP_DURATION);
        break;

      case 3:
        bot.clearControlStates();
        break;
    }

    movementPhase = (movementPhase + 1) % 4;
    setTimeout(movementCycle, STEP_INTERVAL);
  }

  bot.on('login', () => {
    console.log("🔑 Logged into server");
  });

  bot.on('kicked', (reason) => {
    console.log("🚫 Kicked:", reason.toString());
  });

  bot.on('error', (err) => {
    console.log("⚠️ Error:", err.message);
  });

  bot.on('end', () => {
    console.log("⛔ Disconnected. Reconnecting in 10s...");
    setTimeout(startBot, 10000);
  });
}

/* -------------------- Start -------------------- */
startBot();
