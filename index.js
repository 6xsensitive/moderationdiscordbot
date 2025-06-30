const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

function getCommandFiles(dir) {
  let commandFiles = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      commandFiles = commandFiles.concat(getCommandFiles(path.join(dir, file.name)));
    } else if (file.name.endsWith('.js')) {
      commandFiles.push(path.join(dir, file.name));
    }
  }
  return commandFiles;
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = getCommandFiles(commandsPath);

for (const filePath of commandFiles) {
  const command = require(filePath);
  if ('name' in command && 'execute' in command) {
    client.commands.set(command.name, command);
  } else {
    console.warn(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(config.token);