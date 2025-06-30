const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'role',
  aliases: ['r'],
  description: 'Add or remove roles from users, or toggle role with user and role IDs',
  async execute(message, args) {
    if (!message.member.permissions.has('ManageRoles')) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: You do not have the permission \`MANAGE_ROLES\`.`)]
      });
    }

    if (args.length < 2) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(
          `<@${message.author.id}>: Invalid arguments. Usage:\n,r add <userId> <roleId>\n,r remove <userId> <roleId>\n,r <userId> <roleId> (toggle role)`
        )]
      });
    }

    let action;
    let userId;
    let roleId;

    if (args[0].toLowerCase() === 'add' || args[0].toLowerCase() === 'remove') {
      if (args.length < 3) {
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription(
            `<@${message.author.id}>: Invalid arguments. Usage:\n,r add <userId> <roleId>\n,r remove <userId> <roleId>\n,r <userId> <roleId> (toggle role)`
          )]
        });
      }
      action = args[0].toLowerCase();
      userId = args[1];
      roleId = args[2];
    } else {
      action = 'toggle';
      userId = args[0];
      roleId = args[1];
    }

    const member = await message.guild.members.fetch(userId).catch(() => null);
    if (!member) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Invalid user ID or user not found.`)]
      });
    }

    const role = message.guild.roles.cache.get(roleId);
    if (!role) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: Invalid role ID or role not found.`)]
      });
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: I cannot manage that role because it is higher or equal to my highest role.`)]
      });
    }

    if (role.position >= message.member.roles.highest.position) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: You cannot manage that role because it is higher or equal to your highest role.`)]
      });
    }

    try {
      if (action === 'add') {
        if (member.roles.cache.has(role.id)) {
          return message.channel.send({
            embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: The user already has that role.`)]
          });
        }
        await member.roles.add(role);
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription(`role <@&${role.id}> added to <@${member.id}>`)]
        });

      } else if (action === 'remove') {
        if (!member.roles.cache.has(role.id)) {
          return message.channel.send({
            embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: The user does not have that role.`)]
          });
        }
        await member.roles.remove(role);
        return message.channel.send({
          embeds: [new EmbedBuilder().setDescription(`role <@&${role.id}> removed from <@${member.id}>`)]
        });

      } else {
        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
          return message.channel.send({
            embeds: [new EmbedBuilder().setDescription(`role <@&${role.id}> removed from <@${member.id}>`)]
          });
        } else {
          await member.roles.add(role);
          return message.channel.send({
            embeds: [new EmbedBuilder().setDescription(`role <@&${role.id}> added to <@${member.id}>`)]
          });
        }
      }
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`<@${message.author.id}>: There was an error managing roles.`)]
      });
    }
  }
};
