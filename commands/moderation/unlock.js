const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unlock',
  aliases: ['ul'],
  description: 'Unlock the current channel',
  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: You do not have permission \`MANAGE_CHANNELS\`.`)]
      });
    }

    const everyoneRole = message.guild.roles.everyone;
    try {
      await message.channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null,
        CreatePublicThreads: null,
        CreatePrivateThreads: null,
        SendMessagesInThreads: null
      });
      message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Channel unlocked.`)]
      });
    } catch (error) {
      console.error(error);
      message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Failed to unlock the channel.`)]
      });
    }
  }
};
