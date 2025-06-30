const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getGuildConfig, saveConfigs } = require('../../events/configManager');

module.exports = {
  name: 'counter',
  description: 'Manage server counters (members, bots, boosts)',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setDescription(`${message.author.tag}: You need the \`MANAGE_CHANNELS\` permission.`)
        ],
      });
    }

    const subcommand = args[0]?.toLowerCase();
    if (!subcommand || !['add', 'remove', 'list'].includes(subcommand)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setDescription(`Usage: ,counter <add|remove|list> [type] [channelID]`)
        ],
      });
    }

    const config = getGuildConfig(message.guild.id);
    if (!config.counters) config.counters = [];

    if (subcommand === 'list') {
      if (config.counters.length === 0) {
        return message.channel.send({ embeds: [new EmbedBuilder().setDescription('No counters set up.')] });
      }
      const list = config.counters.map(c => `**${c.type}** - <#${c.channelId}>`).join('\n');
      return message.channel.send({ embeds: [new EmbedBuilder().setDescription(`**Counters:**\n${list}`)] });
    }

    const type = args[1]?.toLowerCase();
    const channelId = args[2];

    if (!['members', 'bots', 'boosts'].includes(type)) {
      return message.channel.send({ embeds: [new EmbedBuilder().setDescription('Invalid counter type. Valid types: members, bots, boosts.')] });
    }

    if (!channelId) {
      return message.channel.send({ embeds: [new EmbedBuilder().setDescription('Please provide the channel ID for the counter.')] });
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel) {
      return message.channel.send({ embeds: [new EmbedBuilder().setDescription('Invalid channel ID.')] });
    }

    if (subcommand === 'add') {
      if (config.counters.some(c => c.channelId === channelId)) {
        return message.channel.send({ embeds: [new EmbedBuilder().setDescription('This channel is already used for a counter.')] });
      }

      config.counters.push({ type, channelId });
      saveConfigs();
      await require('./counter').updateCounters(message.guild);
      return message.channel.send({ embeds: [new EmbedBuilder().setDescription(`Counter added: **${type}** on <#${channelId}>.`)] });
    }

    if (subcommand === 'remove') {
      const index = config.counters.findIndex(c => c.channelId === channelId && c.type === type);
      if (index === -1) {
        return message.channel.send({ embeds: [new EmbedBuilder().setDescription('Counter not found for that channel and type.')] });
      }
      config.counters.splice(index, 1);
      saveConfigs();
      return message.channel.send({ embeds: [new EmbedBuilder().setDescription(`Counter removed: **${type}** on <#${channelId}>.`)] });
    }
  },
};