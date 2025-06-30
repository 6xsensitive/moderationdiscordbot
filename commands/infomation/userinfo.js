const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  aliases: ['ui', 'whois'],
  description: 'Shows info about a user',
  execute(message, args) {
    const { author, guild } = message;
    const user = message.mentions.members.first() || guild.members.cache.get(args[0]) || message.member;

    const embed = new EmbedBuilder()
      .setDescription(`${author.tag}: User: ${user.user.tag}\nID: ${user.id}\nJoined Server: <t:${Math.floor(user.joinedTimestamp / 1000)}:D>\nAccount Created: <t:${Math.floor(user.user.createdTimestamp / 1000)}:D>\nBot: ${user.user.bot}`);

    message.channel.send({ embeds: [embed] });
  }
};
