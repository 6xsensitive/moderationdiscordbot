const { EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');
const processVersion = process.version;

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000) % 24;
  const days = Math.floor(ms / 86400000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  name: 'botinfo',
  description: 'Shows bot info',
  async execute(message) {
    const ownerId = '1190853895598133299';

    if (message.author.id !== ownerId) {
      return message.channel.send(`no`);
    }

    const { client } = message;

    const cpuModel = os.cpus()[0].model;
    const cpuCores = os.cpus().length;
    const ramUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRAMMB = (os.totalmem() / 1024 / 1024).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle('Bot Information')
      .addFields(
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${client.users.cache.size}`, inline: true },
        { name: 'Ping', value: `${client.ws.ping} ms`, inline: true },
        { name: 'Uptime', value: formatUptime(client.uptime), inline: true },
        { name: 'Discord.js', value: `v${djsVersion}`, inline: true },
        { name: 'Node.js', value: `${processVersion}`, inline: true },
        { name: 'CPU', value: `${cpuModel} (${cpuCores} cores)`, inline: false },
        { name: 'RAM Usage', value: `${ramUsageMB} MB / ${totalRAMMB} MB`, inline: false },
        { name: 'Bot Created', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`, inline: false }
      )
    message.channel.send({ embeds: [embed] });
  }
};