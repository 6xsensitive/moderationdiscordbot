const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'botclear',
  aliases: ['bc'],
  description: 'Delete all bot messages and messages starting with the bot prefix in this channel',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) {
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: You do not have the permission \`MANAGE_MESSAGES\`.`);
      return message.channel.send({ embeds: [embed] });
    }

    const fetched = await message.channel.messages.fetch({ limit: 100 });

    const messagesToDelete = fetched.filter(msg =>
      msg.author.bot || msg.content.startsWith(config.prefix)
    );

    if (messagesToDelete.size === 0) {
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: No bot messages or prefix messages found to delete.`);
      return message.channel.send({ embeds: [embed] });
    }

    try {
      await message.channel.bulkDelete(messagesToDelete, true);

      return message.channel.send(`${message.author.tag}: 👍`);
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: There was an error trying to clear bot messages.`);
      return message.channel.send({ embeds: [embed] });
    }
  }
};