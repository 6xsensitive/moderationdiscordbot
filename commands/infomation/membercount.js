const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'membercount',
  aliases: ['mc'],
  description: 'Shows server member counts',
  execute(message) {
    const { guild, author } = message;
    const total = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = total - bots;

    const embed = new EmbedBuilder()
      .setDescription(`${author.tag}: Total Members: ${total}\nHumans: ${humans}\nBots: ${bots}`);

    message.channel.send({ embeds: [embed] });
  }
};