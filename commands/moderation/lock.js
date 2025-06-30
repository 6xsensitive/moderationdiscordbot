const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'lock',
  aliases: ['l'],
  description: 'Lock the current channel',
  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setDescription(`<@${message.author.id}>: You do not have permission \`MANAGE_CHANNELS\`.`)
        ]
      });
    }

    const everyoneRole = message.guild.roles.everyone;
    try {
      await message.channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
        SendMessagesInThreads: false
      });

      return message.channel.send({
        embeds: [
          new EmbedBuilder().setDescription(`<@${message.author.id}>: Channel locked.`)
        ]
      });
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setDescription(`<@${message.author.id}>: Failed to lock the channel.`)
        ]
      });
    }
  }
};