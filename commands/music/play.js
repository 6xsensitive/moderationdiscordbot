const music = require('../../commands/music/music.js');

module.exports = {
  name: 'play',
  description: 'Play a song from YouTube',
  async execute(message, args) {
    if (!args.length) return message.channel.send('Please specify a song name or URL.');
    await music.executePlay(message, args);
  }
};