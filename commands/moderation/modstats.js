const { getGuildConfig, saveConfigs } = require('../../events/configManager');

module.exports = {
  name: 'modstats',
  aliases: ['ms'],
  description: 'Show moderation stats for a user',
  execute(message, args) {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user || message.author;
    const guildConfig = getGuildConfig(message.guild.id);

    // Get arrays or default empty
    const warns = guildConfig.warns?.filter(w => w.userId === user.id) || [];
    const bans = guildConfig.bans?.filter(b => b.userId === user.id) || [];
    const kicks = guildConfig.kicks?.filter(k => k.userId === user.id) || [];
    const softbans = guildConfig.softbans?.filter(s => s.userId === user.id) || [];
    const timeouts = guildConfig.timeouts?.filter(t => t.userId === user.id) || [];

    const response = 
`${message.author.tag}: Moderation stats for ${user.tag}:
- Warns: ${warns.length}
- Bans: ${bans.length}
- Kicks: ${kicks.length}
- Softbans: ${softbans.length}
- Timeouts: ${timeouts.length}`;

    message.channel.send(response);
  }
};