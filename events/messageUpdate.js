const fs = require('fs');
const path = require('path');

const CONFIGS_PATH = path.resolve('./configs.json');
let configs = {};
try { configs = JSON.parse(fs.readFileSync(CONFIGS_PATH, 'utf8')); } catch {}

function getGuildConfig(guildId) {
  if (!configs[guildId]) {
    configs[guildId] = { prefix: ',' };
  }
  return configs[guildId];
}

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (newMessage.author?.bot || !newMessage.guild) return;
    const prefix = getGuildConfig(newMessage.guild.id).prefix || ',';
    if (!newMessage.content.startsWith(prefix)) return;

    const args = newMessage.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(cmd => cmd.aliases?.includes(commandName));

    if (!command) return;

    try {
      await command.execute(newMessage, args, client);
    } catch (error) {
      console.error('Error executing edited command:', error);
      newMessage.channel?.send('There was an error executing that command.');
    }
  }
};
