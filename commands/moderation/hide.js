const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'hide',
  description: 'Hide the current channel from @everyone',
  aliases: [],
  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`<@${message.author.id}>: You do not have the permission \`MANAGE_CHANNELS\`.`)
        ]
      });
    }

    const everyoneRole = message.guild.roles.everyone;
    const channel = message.channel;

    const canView = channel.permissionsFor(everyoneRole)?.has(PermissionFlagsBits.ViewChannel, true);
    if (!canView) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`<@${message.author.id}>: Channel is already hidden from @everyone.`)
        ]
      });
    }

    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        ViewChannel: false
      });

      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`<@${message.author.id}>: Channel hidden from @everyone.`)
        ]
      });
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`<@${message.author.id}>: Failed to hide the channel.`)
        ]
      });
    }
  }
};
