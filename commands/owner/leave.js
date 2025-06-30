const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leave',
  description: 'Force the bot to leave a guild',
  async execute(message, args) {
    const ownerId = '1190853895598133299';

    if (message.author.id !== ownerId) return;

    const guildId = args[0];
    if (!guildId) {
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: Please provide a guild ID.`);
      return message.channel.send({ embeds: [embed] });
    }

    const guild = message.client.guilds.cache.get(guildId);
    if (!guild) {
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: I'm not in a server with that ID.`);
      return message.channel.send({ embeds: [embed] });
    }

    try {
      await guild.leave();
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: Successfully left **${guild.name}**.`);
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: Failed to leave the server.`);
      return message.channel.send({ embeds: [embed] });
    }
  }
};