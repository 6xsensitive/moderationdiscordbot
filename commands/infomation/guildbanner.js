const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildbanner',
  description: 'Shows the guild (server) banner',
  async execute(message) {
    const { guild, author, client } = message;

    try {
      const fetchedGuild = await client.guilds.fetch(guild.id, { force: true });

      if (!fetchedGuild.banner) {
        const embed = new EmbedBuilder()
          .setDescription(`${author.tag}: This server has no banner.`);
        return message.channel.send({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setDescription(`${author.tag}:`)
        .setImage(fetchedGuild.bannerURL({ size: 1024, dynamic: true }));

      message.channel.send({ embeds: [embed] });
    } catch {
      const embed = new EmbedBuilder()
        .setDescription(`${author.tag}: Could not fetch the server banner.`);
      message.channel.send({ embeds: [embed] });
    }
  }
};
