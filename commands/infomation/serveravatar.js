const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serveravatar',
  aliases: ['sav'],
  description: 'Shows a user\'s server avatar',
  execute(message, args) {
    const { guild, author } = message;
    const user = message.mentions.members.first() || guild.members.cache.get(args[0]) || message.member;

    const avatarURL = user.avatarURL({ dynamic: true, size: 1024 }) || user.user.displayAvatarURL({ dynamic: true, size: 1024 });

    if (!avatarURL) {
      const embed = new EmbedBuilder()
        .setDescription(`${author.tag}: Could not find an avatar for that user.`);
      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(`${author.tag}:`)
      .setImage(avatarURL);

    message.channel.send({ embeds: [embed] });
  }
};