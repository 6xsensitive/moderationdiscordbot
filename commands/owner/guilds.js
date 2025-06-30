const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'guilds',
  description: 'List all servers the bot is in',
  async execute(message) {
    const ownerId = '1190853895598133299';
    if (message.author.id !== ownerId) return;

    const guilds = message.client.guilds.cache.map(g => `**${g.name}** (${g.id})`);
    const pageSize = 10;
    let currentPage = 0;

    const generateEmbed = (page) => {
      const start = page * pageSize;
      const end = start + pageSize;
      const list = guilds.slice(start, end).join('\n') || 'No guilds found';

      return new EmbedBuilder()
        .setTitle(`Bot is in **${guilds.length}** servers`)
        .setDescription(list)
        .setFooter({ text: `Page ${page + 1} of ${Math.ceil(guilds.length / pageSize)}` });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Secondary)
    );

    const msg = await message.channel.send({
      embeds: [generateEmbed(currentPage)],
      components: guilds.length > pageSize ? [row] : []
    });

    if (guilds.length <= pageSize) return;

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', i => {
      if (i.user.id !== ownerId) return i.reply({ content: 'This is not your session.', ephemeral: true });

      if (i.customId === 'prev') currentPage = Math.max(currentPage - 1, 0);
      if (i.customId === 'next') currentPage = Math.min(currentPage + 1, Math.ceil(guilds.length / pageSize) - 1);

      i.update({ embeds: [generateEmbed(currentPage)] });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};