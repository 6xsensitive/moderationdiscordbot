const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  aliases: ['si'],
  description: 'Shows information about the server',
  execute(message) {
    const { guild, author } = message;

    const embed = new EmbedBuilder()
      .setDescription(`${author.tag}: Server Name: ${guild.name}\nID: ${guild.id}\nOwner: <@${guild.ownerId}>\nCreated: <t:${Math.floor(guild.createdTimestamp / 1000)}:D>\nMembers: ${guild.memberCount}\nBoosts: ${guild.premiumSubscriptionCount || 0}`);

    message.channel.send({ embeds: [embed] });
  }
};