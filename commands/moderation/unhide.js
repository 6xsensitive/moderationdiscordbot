const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unhide',
  description: 'Unhide the current channel for @everyone',
  aliases: [],
  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: You do not have permission \`MANAGE_CHANNELS\`.`)]
      });
    }

    const everyoneRole = message.guild.roles.everyone;
    const channel = message.channel;

    const canView = channel.permissionsFor(everyoneRole)?.has(PermissionFlagsBits.ViewChannel, true);
    if (canView) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Channel is already visible to @everyone.`)]
      });
    }

    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        ViewChannel: null
      });
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Channel is now visible to @everyone.`)]
      });
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Failed to unhide the channel.`)]
      });
    }
  }
};
