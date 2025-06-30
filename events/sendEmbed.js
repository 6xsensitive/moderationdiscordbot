const { EmbedBuilder } = require('discord.js');

function sendEmbed(message, content) {
  const embed = new EmbedBuilder()
    .setDescription(`${message.author.tag}: ${content}`);
  return message.channel.send({ embeds: [embed] });
}

module.exports = sendEmbed;