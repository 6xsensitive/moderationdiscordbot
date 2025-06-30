const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'unban',
  description: 'Unban a user by ID',
  async execute(message, args) {
    const prefix = config.prefix;

    if (args.length === 0) {
      const helpEmbed = new EmbedBuilder()
        .setTitle('Command: Unban')
        .setDescription(`Unbans a user by their ID\n\n\`\`\`Syntax: ${prefix}unban (userID) <reason>\nExample: ${prefix}unban 6xsensitive Apology accepted\`\`\``);
      return message.channel.send({ embeds: [helpEmbed] });
    }

    if (!message.member.permissions.has('BanMembers')) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: You do not have the permission \`BAN_MEMBERS\``)]
      });
    }

    const userId = args[0];

    try {
      const bannedUsers = await message.guild.bans.fetch();
      const bannedUser = bannedUsers.get(userId);

      if (!bannedUser) {
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: That user is not banned.`)]
        });
      }

      const reason = args.slice(1).join(' ') || 'No reason provided';
      await message.guild.members.unban(userId, `${reason} | Unbanned by ${message.author.tag}`);

      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Unbanned <@${userId}>.`)]
      });
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: There was an error trying to unban that user.`)]
      });
    }
  }
};
