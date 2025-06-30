const { getGuildConfig, saveConfigs } = require('../../events/configManager');
const fs = require('fs');
const path = require('path');

const CONFIGS_PATH = path.resolve('./configs.json');

let configs = {};
try {
  configs = JSON.parse(fs.readFileSync(CONFIGS_PATH, 'utf8'));
} catch {
  configs = {};
}

module.exports = {
  name: 'prefix',
  description: 'Change the server prefix',
  aliases: ['setprefix', 'sp'],
  execute(message, args) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.channel.send(`${message.author.tag}: You do not have the permission \`MANAGE_SERVER\``);
    }

    if (!args[0]) {
      return message.channel.send(`${message.author.tag}: Please specify a new prefix.`);
    }

    const newPrefix = args[0];

    if (newPrefix.length > 5) {
      return message.channel.send(`${message.author.tag}: Prefix too long! Max length is 5 characters.`);
    }

    const guildId = message.guild.id;

    if (!configs[guildId]) configs[guildId] = {};
    configs[guildId].prefix = newPrefix;
    saveConfigs();

    return message.channel.send(`${message.author.tag}: Prefix changed to \`${newPrefix}\``);
  }
};