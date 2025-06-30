const { EmbedBuilder } = require('discord.js');
const { getGuildConfig, saveConfigs } = require('../../events/configManager');

module.exports = {
  name: 'warn',
  description: 'Warn a member',
  async execute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: You do not have the permission \`MODERATE_MEMBERS\``);
      return message.channel.send({ embeds: [embed] });
    }

    const userToWarn = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!userToWarn) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: Please specify a valid user to warn.`);
      return message.channel.send({ embeds: [embed] });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const guildConfig = getGuildConfig(message.guild.id);
    if (!guildConfig.warns) guildConfig.warns = [];

    guildConfig.warns.push({
      userId: userToWarn.id,
      moderatorId: message.author.id,
      reason,
      timestamp: Date.now()
    });

    saveConfigs();

    const embed = new EmbedBuilder()
      .setDescription(`<@${message.author.id}>: Warned ${userToWarn.user.tag} for: ${reason}`);
    return message.channel.send({ embeds: [embed] });
  }
};
