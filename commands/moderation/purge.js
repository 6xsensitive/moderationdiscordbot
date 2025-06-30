module.exports = {
  name: 'purge',
  aliases: ['c'],
  description: 'Deletes a specified number of messages in the channel',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageMessages')) {
      return message.channel.send({
        embeds: [{
          description: `${message.author.tag}: You do not have the permission \`MANAGE_MESSAGES\`.`
        }]
      });
    }

    let deleteCount = parseInt(args[0], 10);
    if (!deleteCount || deleteCount < 1 || deleteCount > 100) {
      deleteCount = 10;
    }

    try {
      const fetched = await message.channel.messages.fetch({ limit: deleteCount + 1 });
      await message.channel.bulkDelete(fetched, true);
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [{
          description: `${message.author.tag}: There was an error trying to purge messages.`
        }]
      });
    }
  }
};