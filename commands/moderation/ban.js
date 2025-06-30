const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const { getGuildConfig, saveConfigs } = require('../../events/configManager');

module.exports = {
  name: 'ban',
  description: 'Ban a user',
  async execute(message, args) {
    const prefix = config.prefix;

    if (args.length === 0) {
      const helpEmbed = new EmbedBuilder()
        .setTitle('Command: Ban')
        .setDescription(`Bans the mentioned user from the guild\n\n\`\`\`Syntax: ${prefix}ban (member) <reason>\nExample: ${prefix}ban 6xsensitive Repeated violations\`\`\``);
      return message.channel.send({ embeds: [helpEmbed] });
    }

    if (!message.member.permissions.has('BanMembers')) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: You do not have the permission \`BAN_MEMBERS\``);
      return message.channel.send({ embeds: [embed] });
    }

    const userToBan = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!userToBan) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: Please provide a valid ID to ban.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (userToBan.id === message.client.user.id) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: I will not ban myself.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (userToBan.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: You cannot ban yourself.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (userToBan.id === message.guild.ownerId) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: You cannot ban the server owner.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (!userToBan.bannable) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: I cannot ban that user.`);
      return message.channel.send({ embeds: [embed] });
    }

    const reason = args.slice(userToBan.user ? 1 : 0).join(' ') || 'No reason provided';

    try {
      await userToBan.ban({ reason: `${reason} | Banned by ${message.author.tag}` });

      const guildConfig = getGuildConfig(message.guild.id);
      if (!guildConfig.bans) guildConfig.bans = [];

      guildConfig.bans.push({
        userId: userToBan.id,
        moderatorId: message.author.id,
        reason,
        timestamp: Date.now()
      });

      saveConfigs();

      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: Banned ${userToBan.user.tag} for: ${reason}`);
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: There was an error trying to ban that user.`);
      return message.channel.send({ embeds: [embed] });
    }
  }
};
