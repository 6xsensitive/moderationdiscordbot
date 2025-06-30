const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'untimeout',
  description: 'Remove a timeout from a user',
  async execute(message, args) {
    const prefix = config.prefix;

    if (args.length === 0) {
      const helpEmbed = new EmbedBuilder()
        .setTitle('Command: Untimeout')
        .setDescription(`Removes an active timeout from a member\n\n\`\`\`Syntax: ${prefix}untimeout (member) <reason>\nExample: ${prefix}untimeout 6xsensitive You've cooled off\`\`\``);
      return message.channel.send({ embeds: [helpEmbed] });
    }

    if (!message.member.permissions.has('ModerateMembers')) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: You do not have the permission \`MODERATE_MEMBERS\``);
      return message.channel.send({ embeds: [embed] });
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: Please provide a valid user ID to untimeout.`);
      return message.channel.send({ embeds: [embed] });
    }

    if (!member.moderatable) {
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: I cannot untimeout that user.`);
      return message.channel.send({ embeds: [embed] });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.timeout(null, `${reason} | Untimeout by <@${message.author.id}>`);
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: Removed timeout from ${member.user.tag}.`);
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setDescription(`<@${message.author.id}>: There was an error trying to remove the timeout.`);
      return message.channel.send({ embeds: [embed] });
    }
  }
};
