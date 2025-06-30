const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Displays the bot\'s current ping',
  execute(message) {
    const ping = message.client.ws.ping;

    const embed = new EmbedBuilder()
    message.channel.send(`Pong! \`${ping}ms\``);
  }
};
