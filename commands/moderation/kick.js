const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const { getGuildConfig, saveConfigs } = require('../../events/configManager');

module.exports = {
  name: 'kick',
  description: 'Kick a user',
  async execute(message, args) {
    const prefix = config.prefix;

    if (args.length === 0) {
      const helpEmbed = new EmbedBuilder()
        .setTitle('Command: Kick')
        .setDescription(`Kicks the mentioned user from the guild\n\n\`\`\`Syntax: ${prefix}kick (member) <reason>\nExample: ${prefix}kick 6xsensitive You need a break\`\`\``);
      return message.channel.send({ embeds: [helpEmbed] });
    }

    if (!message.member.permissions.has('KickMembers')) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: You do not have the permission \`KICK_MEMBERS\``);
      return message.channel.send({ embeds: [embed] });
    }

    const userToKick = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!userToKick) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: Please provide a valid ID to kick.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (userToKick.id === message.client.user.id) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: I cannot kick myself.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (userToKick.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: You cannot kick yourself.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (userToKick.id === message.guild.ownerId) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: You cannot kick the server owner.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (!userToKick.kickable) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: I cannot kick that user.`);
      return message.channel.send({ embeds: [embed] });
    }

    const reason = args.slice(userToKick.user ? 1 : 0).join(' ') || 'No reason provided';

    try {
      await userToKick.kick(`${reason} | Kicked by ${message.author.tag}`);

      const guildConfig = getGuildConfig(message.guild.id);
      if (!guildConfig.kicks) guildConfig.kicks = [];

      guildConfig.kicks.push({
        userId: userToKick.id,
        moderatorId: message.author.id,
        reason,
        timestamp: Date.now()
      });

      saveConfigs();

      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: Kicked ${userToKick.user.tag} for: ${reason}`);
      return message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: There was an error trying to kick that user.`);
      return message.channel.send({ embeds: [embed] });
    }
  }
};
