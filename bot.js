const http = require('http');

const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft AFK Bot is running!');
}).listen(PORT, () => {
  console.log(`🌐 Health server listening on port ${PORT}`);
});

const mineflayer = require('mineflayer');
const config = require('./config.json');

const bot = mineflayer.createBot({
  host: config.serverHost,
  port: config.serverPort,
  username: config.botUsername,
  auth: 'offline',
  version: false,
  viewDistance: config.botChunk
});

let movementPhase = 0;
const STEP_INTERVAL = 1500;
const JUMP_DURATION = 500;

bot.on('spawn', () => {
  setTimeout(() => {
    bot.setControlState('sneak', true);
    console.log(`✅ ${config.botUsername} is Ready!`);
  }, 3000);

  setTimeout(movementCycle, STEP_INTERVAL);
});

function movementCycle() {
  if (!bot.entity) return;

  switch (movementPhase) {
    case 0:
      bot.setControlState('forward', true);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;

    case 1:
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
      bot.setControlState('jump', false);
      break;

    case 2:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', true);

      setTimeout(() => {
        bot.setControlState('jump', false);
      }, JUMP_DURATION);
      break;

    case 3:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
  }

  movementPhase = (movementPhase + 1) % 4;

  setTimeout(movementCycle, STEP_INTERVAL);
}

bot.on('login', () => {
  console.log('🔑 Logged into the server.');
});

bot.on('spawn', () => {
  console.log('🎮 Spawned successfully.');
});

bot.on('kicked', (reason) => {
  console.log('🚫 Kicked:', reason);
});

bot.on('end', () => {
  console.log('⛔ Bot disconnected.');

  // Auto reconnect after 10 seconds
  setTimeout(() => {
    console.log('🔄 Restarting...');
    process.exit(1);
  }, 10000);
});

bot.on('error', (err) => {
  console.error('⚠️ Error:', err);
});

console.log("🔌 Attempting to connect to Minecraft server...");
