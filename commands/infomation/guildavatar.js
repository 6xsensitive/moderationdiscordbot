const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildavatar',
  aliases: ['gav'],
  description: 'Shows the guild (server) icon',
  execute(message) {
    const { guild, author } = message;

    if (!guild.iconURL()) {
      const embed = new EmbedBuilder()
        .setDescription(`${author.tag}: This server has no icon.`);
      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(`${author.tag}:`)
      .setImage(guild.iconURL({ size: 1024, dynamic: true }));

    message.channel.send({ embeds: [embed] });
  }
};
