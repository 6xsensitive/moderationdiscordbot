const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['av'],
  description: 'Shows avatar of a user',
  execute(message, args) {
    const { author, guild } = message;
    const user = message.mentions.users.first() || guild.members.cache.get(args[0])?.user || message.author;

    const embed = new EmbedBuilder()
      .setDescription(`${author.tag}:`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }));

    message.channel.send({ embeds: [embed] });
  }
};
