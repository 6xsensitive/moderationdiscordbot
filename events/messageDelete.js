const snipes = new Map();

module.exports = {
  name: 'messageDelete',
  execute(message) {
    if (!message.partial && message.author && !message.author.bot) {
      const now = Date.now();
      const twoHoursMs = 2 * 60 * 60 * 1000;

      if (now - message.createdTimestamp <= twoHoursMs) {
        snipes.set(message.channel.id, {
          content: message.content || '[Embed/Attachment]',
          authorTag: message.author.tag,
          authorId: message.author.id,
          authorIconURL: message.author.displayAvatarURL(),
          createdAt: message.createdTimestamp,
        });
      }
    }
  },
  snipes,
};