const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roleinfo',
  aliases: ['ri'],
  description: 'Shows information about a role',
  execute(message, args) {
    const { author, guild } = message;
    const role = message.mentions.roles.first() || guild.roles.cache.get(args[0]);

    if (!role) {
      const embed = new EmbedBuilder()
        .setDescription(`${author.tag}: Please mention a valid role or provide a role ID.`);
      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(`${author.tag}: Role: ${role.name}\nID: ${role.id}\nColor: ${role.hexColor}\nMembers: ${role.members.size}\nMentionable: ${role.mentionable}`);

    message.channel.send({ embeds: [embed] });
  }
};