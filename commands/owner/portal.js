const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'portal',
  description: 'Owner-only: Create invite portal to a server by guild ID',
  async execute(message, args) {
    const ownerId = '1190853895598133299';
    if (message.author.id !== ownerId) return;

    const guildId = args[0];
    if (!guildId) {
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: Please specify a guild ID to create a portal.\n\nSyntax: ,portal <guildID>\nExample: ,portal 123456789012345678`);
      return message.channel.send({ embeds: [embed] });
    }

    const guild = message.client.guilds.cache.get(guildId);
    if (!guild) {
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: That guild ID is invalid.`);
      return message.channel.send({ embeds: [embed] });
    }

    const inviteChannel = guild.channels.cache.find(channel =>
      channel.isTextBased() &&
      channel.viewable &&
      channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.CreateInstantInvite)
    );

    if (!inviteChannel) {
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: No suitable channel with invite permissions found.`);
      return message.channel.send({ embeds: [embed] });
    }

    try {
      const invite = await inviteChannel.createInvite({
        maxUses: 1,
        unique: true,
        reason: `Portal created by ${message.author.tag}`
      });

      return message.channel.send(`discord.gg/${invite.code}`);
    } catch (err) {
      console.error(err);
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: Failed to create an invite for that server.`);
      return message.channel.send({ embeds: [embed] });
    }
  }
};