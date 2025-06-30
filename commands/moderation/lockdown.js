const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const lockdownCache = new Map();

module.exports = {
  name: 'lockdown',
  aliases: ['lockall', 'lock all'],
  description: 'Lock all public channels in the guild (lockdown)',
  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setDescription(`<@${message.author.id}>: You do not have permission \`MANAGE_CHANNELS\`.`)
        ]
      });
    }

    const everyoneRole = message.guild.roles.everyone;
    const guildId = message.guild.id;

    if (!lockdownCache.has(guildId)) {
      lockdownCache.set(guildId, new Map());
    }

    const guildLockCache = lockdownCache.get(guildId);

    const channelsToLock = message.guild.channels.cache.filter(channel => {
      if (![ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(channel.type)) return false;

      const everyonePerms = channel.permissionsFor(everyoneRole);
      return everyonePerms?.has(PermissionFlagsBits.ViewChannel, true);
    });

    if (channelsToLock.size === 0) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setDescription(`<@${message.author.id}>: No public channels found to lock.`)
        ]
      });
    }

    for (const [channelId, channel] of channelsToLock) {
      try {
        const currentOverwrite = channel.permissionOverwrites.cache.get(everyoneRole.id);

        guildLockCache.set(channelId, {
          SendMessages: currentOverwrite?.allow.has(PermissionFlagsBits.SendMessages) ?? null,
          SendMessagesDenied: currentOverwrite?.deny.has(PermissionFlagsBits.SendMessages) ?? null,
          CreatePublicThreads: currentOverwrite?.allow.has(PermissionFlagsBits.CreatePublicThreads) ?? null,
          CreatePublicThreadsDenied: currentOverwrite?.deny.has(PermissionFlagsBits.CreatePublicThreads) ?? null,
          CreatePrivateThreads: currentOverwrite?.allow.has(PermissionFlagsBits.CreatePrivateThreads) ?? null,
          CreatePrivateThreadsDenied: currentOverwrite?.deny.has(PermissionFlagsBits.CreatePrivateThreads) ?? null,
          SendMessagesInThreads: currentOverwrite?.allow.has(PermissionFlagsBits.SendMessagesInThreads) ?? null,
          SendMessagesInThreadsDenied: currentOverwrite?.deny.has(PermissionFlagsBits.SendMessagesInThreads) ?? null,
        });

        await channel.permissionOverwrites.edit(everyoneRole, {
          SendMessages: false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false,
          SendMessagesInThreads: false
        });
      } catch (error) {
        console.error(`Failed to lock channel ${channel.name} (${channel.id}):`, error);
      }
    }

    message.channel.send({
      embeds: [
        new EmbedBuilder().setDescription(`<@${message.author.id}>: Lockdown complete. Locked ${channelsToLock.size} channels.`)
      ]
    });
  },

  async unlockLockdown(guild) {
    const everyoneRole = guild.roles.everyone;
    const guildId = guild.id;

    const guildLockCache = lockdownCache.get(guildId);
    if (!guildLockCache) return;

    for (const [channelId, perms] of guildLockCache.entries()) {
      const channel = guild.channels.cache.get(channelId);
      if (!channel) continue;

      try {
        await channel.permissionOverwrites.edit(everyoneRole, {
          SendMessages: perms.SendMessages === true ? true : perms.SendMessagesDenied === true ? false : null,
          CreatePublicThreads: perms.CreatePublicThreads === true ? true : perms.CreatePublicThreadsDenied === true ? false : null,
          CreatePrivateThreads: perms.CreatePrivateThreads === true ? true : perms.CreatePrivateThreadsDenied === true ? false : null,
          SendMessagesInThreads: perms.SendMessagesInThreads === true ? true : perms.SendMessagesInThreadsDenied === true ? false : null
        });
      } catch (error) {
        console.error(`Failed to unlock channel ${channel.name} (${channel.id}):`, error);
      }
    }

    lockdownCache.delete(guildId);
  }
};
