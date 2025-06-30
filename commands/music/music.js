const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  StreamType 
} = require('@discordjs/voice');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

const queue = new Map();

async function playSong(guildId) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue) return;

  const song = serverQueue.songs[0];
  if (!song) {
    serverQueue.connection.destroy();
    queue.delete(guildId);
    return;
  }

  let stream;
  try {
    stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 });
  } catch (error) {
    console.error('Error creating stream:', error);
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setDescription(`❌ Error: Unable to play the song.`);
    serverQueue.textChannel.send({ embeds: [embed] });
    serverQueue.songs.shift();
    playSong(guildId);
    return;
  }

  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true,
  });
  resource.volume.setVolume(serverQueue.volume);

  serverQueue.player.play(resource);

  serverQueue.player.once(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    playSong(guildId);
  });

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setDescription(`🎶 Now playing: **${song.title}**`);
  serverQueue.textChannel.send({ embeds: [embed] });
}

module.exports = {
  name: 'music',
  description: 'Music commands: play, skip, stop, nowplaying, queue, volume',
  aliases: ['m'],
  async execute(message, args) {
    if (!message.member.voice.channel) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`${message.author.tag}: You need to be in a voice channel to use music commands.`);
      return message.channel.send({ embeds: [embed] });
    }

    const permissions = message.member.voice.channel.permissionsFor(message.client.user);
    if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`${message.author.tag}: I need permission to join and speak in your voice channel.`);
      return message.channel.send({ embeds: [embed] });
    }

    const subcommand = args[0]?.toLowerCase();

    if (!subcommand) {
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Music Command Help')
        .setDescription('Usage: ,music <play|skip|stop|nowplaying|queue|volume>')
        .addFields(
          { name: 'play', value: ',music play <song name or URL>' },
          { name: 'skip', value: ',music skip' },
          { name: 'stop', value: ',music stop' },
          { name: 'nowplaying', value: ',music nowplaying' },
          { name: 'queue', value: ',music queue' },
          { name: 'volume', value: ',music volume <0.0-2.0>' }
        )
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.channel.send({ embeds: [embed] });
    }

    switch (subcommand) {
      case 'play': {
        const search = args.slice(1).join(' ');
        if (!search) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`${message.author.tag}: Please provide a song name or URL.`);
          return message.channel.send({ embeds: [embed] });
        }

        let song = null;

        if (ytdl.validateURL(search)) {
          const songInfo = await ytdl.getInfo(search);
          song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
          };
        } else {
          const { videos } = await ytSearch(search);
          if (!videos.length) {
            const embed = new EmbedBuilder()
              .setColor('Red')
              .setDescription(`${message.author.tag}: No results found.`);
            return message.channel.send({ embeds: [embed] });
          }
          song = {
            title: videos[0].title,
            url: videos[0].url,
          };
        }

        let serverQueue = queue.get(message.guild.id);

        if (!serverQueue) {
          const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });

          const player = createAudioPlayer();
          connection.subscribe(player);

          serverQueue = {
            voiceChannel: message.member.voice.channel,
            textChannel: message.channel,
            connection,
            player,
            songs: [],
            volume: 0.5,
            playing: true,
          };

          queue.set(message.guild.id, serverQueue);
        }

        serverQueue.songs.push(song);

        if (serverQueue.songs.length === 1) {
          playSong(message.guild.id);
        } else {
          const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setDescription(`🎵 **${song.title}** added to queue.`);
          message.channel.send({ embeds: [embed] });
        }
        break;
      }

      case 'skip': {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`${message.author.tag}: There is no song playing.`);
          return message.channel.send({ embeds: [embed] });
        }
        serverQueue.player.stop();
        const embed = new EmbedBuilder()
          .setColor('Green')
          .setDescription(`${message.author.tag}: ⏭ Skipped the current song.`);
        message.channel.send({ embeds: [embed] });
        break;
      }

      case 'stop': {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`${message.author.tag}: There is no song playing.`);
          return message.channel.send({ embeds: [embed] });
        }

        serverQueue.songs = [];
        serverQueue.player.stop();
        serverQueue.connection.destroy();
        queue.delete(message.guild.id);

        const embed = new EmbedBuilder()
          .setColor('Green')
          .setDescription(`${message.author.tag}: Stopped the music and cleared the queue.`);
        message.channel.send({ embeds: [embed] });
        break;
      }

      case 'nowplaying': {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue || !serverQueue.songs.length) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`${message.author.tag}: No song is currently playing.`);
          return message.channel.send({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
          .setColor('Blue')
          .setDescription(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
        message.channel.send({ embeds: [embed] });
        break;
      }

      case 'queue': {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue || !serverQueue.songs.length) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`${message.author.tag}: The queue is empty.`);
          return message.channel.send({ embeds: [embed] });
        }

        const queueString = serverQueue.songs
          .map((song, i) => `${i + 1}. ${song.title}`)
          .join('\n');

        const embed = new EmbedBuilder()
          .setColor('Blue')
          .setTitle('Queue')
          .setDescription(queueString);
        message.channel.send({ embeds: [embed] });
        break;
      }

      case 'volume': {
        const serverQueue = queue.get(message.guild.id);
        if (!serverQueue) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`${message.author.tag}: There is no song playing.`);
          return message.channel.send({ embeds: [embed] });
        }

        const volume = parseFloat(args[1]);
        if (isNaN(volume) || volume < 0 || volume > 2) {
          const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`${message.author.tag}: Volume must be between 0 and 2.`);
          return message.channel.send({ embeds: [embed] });
        }

        serverQueue.volume = volume;
        if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
          serverQueue.player.state.resource.volume.setVolume(volume);
        }

        const embed = new EmbedBuilder()
          .setColor('Green')
          .setDescription(`${message.author.tag}: 🔊 Volume set to ${(volume * 100).toFixed(0)}%.`);
        message.channel.send({ embeds: [embed] });
        break;
      }

      default: {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setDescription(`${message.author.tag}: Unknown subcommand. Use ,music for help.`);
        message.channel.send({ embeds: [embed] });
      }
    }
  },
};