const { EmbedBuilder } = require('discord.js');
const messageDeleteEvent = require('../../events/messageDelete');

module.exports = {
  name: 'snipe',
  aliases: ['s'],
  description: 'Snipes the last deleted message from this channel in the last 2 hours',
  execute(message) {
    const snipes = messageDeleteEvent.snipes;
    const sniped = snipes.get(message.channel.id);

    if (!sniped) {
      const embed = new EmbedBuilder()
        .setDescription(`${message.author.tag}: No deleted messages found in the past 2 hours.`);
      return message.channel.send({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL(),
      })
      .setDescription(sniped.content)
      .setFooter({ 
        text: `${sniped.authorTag} (${sniped.authorId})`,
        iconURL: sniped.authorIconURL,
      });

    message.channel.send({ embeds: [embed] });

    snipes.delete(message.channel.id);
  }
};