const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const { getGuildConfig, saveConfigs } = require('../../events/configManager');

function parseDuration(durationStr) {
  const match = durationStr.match(/^(\d+)([wdms])$/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers = {
    w: 7 * 24 * 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };

  return value * (multipliers[unit] || 0);
}

function humanizeDuration(durationStr) {
  const match = durationStr.match(/^(\d+)([wdms])$/i);
  if (!match) return durationStr;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const unitsFull = {
    w: ['week', 'weeks'],
    d: ['day', 'days'],
    m: ['minute', 'minutes'],
    s: ['second', 'seconds'],
  };

  if (!unitsFull[unit]) return durationStr;

  const word = value === 1 ? unitsFull[unit][0] : unitsFull[unit][1];
  return `${value} ${word}`;
}

module.exports = {
  name: 'timeout',
  description: 'Timeout a user',
  async execute(message, args) {
    const prefix = config.prefix;

    if (args.length === 0) {
      const helpEmbed = new EmbedBuilder()
        .setTitle('Command: Timeout')
        .setDescription(`Times out the mentioned user for a set duration\n\n\`\`\`Syntax: ${prefix}timeout (member) (duration) <reason>\nExample: ${prefix}timeout 6xsensitive 2d Calm down\`\`\``);
      return message.channel.send({ embeds: [helpEmbed] });
    }

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: You do not have the permission \`MODERATE_MEMBERS\``)]
      });
    }

    const userToTimeout = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!userToTimeout) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Please provide a valid user ID to timeout.`)]
      });
    }

    if (userToTimeout.id === message.client.user.id) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: I cannot timeout myself.`)]
      });
    }

    if (userToTimeout.id === message.author.id) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: You cannot timeout yourself.`)]
      });
    }

    if (userToTimeout.id === message.guild.ownerId) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: You cannot timeout the server owner.`)]
      });
    }

    if (!userToTimeout.moderatable) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: I cannot timeout that user.`)]
      });
    }

    if (!args[1]) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Please specify a duration (e.g. 2w, 3d, 15m, 30s).`)]
      });
    }

    const durationMs = parseDuration(args[1]);
    if (!durationMs || durationMs < 1000 || durationMs > 28 * 24 * 60 * 60 * 1000) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Invalid duration. Max timeout is 28 days.`)]
      });
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';

    try {
      await userToTimeout.timeout(durationMs, `${reason} | Timed out by ${message.author.tag}`);

      const guildConfig = getGuildConfig(message.guild.id);
      if (!guildConfig.timeouts) guildConfig.timeouts = [];

      guildConfig.timeouts.push({
        userId: userToTimeout.id,
        moderatorId: message.author.id,
        reason,
        duration: durationMs,
        timestamp: Date.now()
      });

      saveConfigs();

      let displayDuration = humanizeDuration(args[1].toLowerCase());
      const fourWeeksMs = 4 * 7 * 24 * 60 * 60 * 1000;
      if (durationMs >= fourWeeksMs) displayDuration = 'a month';

      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Timed out <@${userToTimeout.id}> for ${displayDuration}.`)]
      });
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: There was an error trying to timeout that user.`)]
      });
    }
  }
};
