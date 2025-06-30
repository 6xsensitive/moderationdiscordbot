const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getGuildConfig, saveConfigs } = require('../../events/configManager');

module.exports = {
  name: 'autorole',
  description: 'Set or remove the autorole for new members',
  aliases: ['ar'],
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`${message.author.tag}: You need the \`MANAGE_ROLES\` permission.`)],
      });
    }

    const subcommand = args[0]?.toLowerCase();
    if (!subcommand || !['set', 'remove', 'view'].includes(subcommand)) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription('Usage: ,autorole <set|remove|view> [roleID]')],
      });
    }

    const config = getGuildConfig(message.guild.id);

    if (subcommand === 'set') {
      const roleId = args[1];
      if (!roleId) {
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription('Please provide a role ID to set as autorole.')],
        });
      }
      const role = message.guild.roles.cache.get(roleId);
      if (!role) {
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription('Invalid role ID.')],
        });
      }

      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription('I do not have permission to manage roles.')],
        });
      }

      config.autorole = roleId;
      saveConfigs();

      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`✅ Autorole set to **${role.name}**.`)],
      });
    } else if (subcommand === 'remove') {
      if (!config.autorole) {
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription('There is no autorole set.')],
        });
      }
      delete config.autorole;
      saveConfigs();
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription('✅ Autorole has been removed.')],
      });
    } else if (subcommand === 'view') {
      if (!config.autorole) {
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription('There is no autorole set.')],
        });
      }
      const role = message.guild.roles.cache.get(config.autorole);
      if (!role) {
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription('Autorole is set but the role no longer exists.')],
        });
      }
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`Current autorole is **${role.name}**.`)],
      });
    }
  },
};