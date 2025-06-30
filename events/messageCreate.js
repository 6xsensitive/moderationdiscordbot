const fs = require('fs');
const path = require('path');

const CONFIGS_PATH = path.resolve('./configs.json');

let configs = {};
try {
  configs = JSON.parse(fs.readFileSync(CONFIGS_PATH, 'utf8'));
} catch {
  configs = {};
}

function saveConfigs() {
  fs.writeFileSync(CONFIGS_PATH, JSON.stringify(configs, null, 2));
}

function getGuildConfig(guildId) {
  if (!configs[guildId]) {
    configs[guildId] = {
      prefix: ',', // default prefix if none set
      // other guild-specific config can go here
    };
    saveConfigs();
  }
  return configs[guildId];
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const guildConfig = getGuildConfig(message.guild.id);
    const prefix = guildConfig.prefix || ',';

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error('Error executing command:', error);
      if (message.channel && message.channel.send) {
        message.channel.send('There was an error executing that command.');
      }
    }
  }
};