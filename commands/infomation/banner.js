const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'banner',
  description: 'Shows banner of a user if they have one',
  async execute(message, args) {
    const { author, client, guild } = message;
    const user = message.mentions.users.first() || guild.members.cache.get(args[0])?.user || message.author;

    try {
      const fetchedUser = await client.users.fetch(user.id, { force: true });
      if (!fetchedUser.bannerURL()) {
        const embed = new EmbedBuilder()
          .setDescription(`${author.tag}: User has no banner.`);
        return message.channel.send({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setDescription(`${author.tag}:`)
        .setImage(fetchedUser.bannerURL({ size: 1024, dynamic: true }));

      message.channel.send({ embeds: [embed] });
    } catch {
      const embed = new EmbedBuilder()
        .setDescription(`${author.tag}: Could not fetch banner.`);
      message.channel.send({ embeds: [embed] });
    }
  }
};