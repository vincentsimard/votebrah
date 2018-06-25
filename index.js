const tmi = require('tmi.js');
const nconf = require('nconf');

const commandPrefix = '!';
const config = nconf
  .argv()
  .env()
  .file({ file: 'config.json' })
  .get();
const opts = {
  identity: {
    username: '<BOT USERNAME>',
    password: 'oauth:' + '<OAUTH TOKEN>'
  },
  channels: [
    '<CHANNEL NAME>'
  ]
};

// Commands the bot knows (defined below)
const knownCommands = { echo };

function echo (target, context, params) {
  if (params.length) {
    const msg = params.join(' ');
    sendMessage(target, context, msg);
  } else {
    console.log(`* Nothing to echo`);
  }
}

// Helper function to send the correct type of message (normal, whisper)
function sendMessage (target, context, message) {
  if (context['message-type'] === 'whisper') {
    client.whisper(target, message);
  } else {
    client.say(target, message);
  }
}



function onMessageHandler (target, context, msg, self) {
  // Ignore messages from the bot
  if (self) { return; }

  // Ignore messages without required prefix
  if (msg.substr(0, 1) !== commandPrefix) {
    console.log(`[${target} (${context['message-type']})] ${context.username}: ${msg}`);
    return;
  }

  // Split the message into individual words
  // Command name is the first word
  // Params are anything after the first word
  const parse = msg.slice(1).split(' ');
  const commandName = parse[0];
  const params = parse.splice(1);

  // Check if the command is known
  if (commandName in knownCommands) {
    const command = knownCommands[commandName];
    command(target, context, params);
    console.log(`* Executed ${commandName} command for ${context.username}`);
  } else {
    console.log(`* Unknown command ${commandName} from ${context.username}`);
  }
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function onDisconnectedHandler (reason) {
  console.log(`* Disconnected ${reason}`);
  process.exit(1);
}



const client = new tmi.client(config);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);

console.log('* Connecting to Twitch');
client.connect()
  .then(data => {}) // data returns [server, port]
  .catch(console.error);
