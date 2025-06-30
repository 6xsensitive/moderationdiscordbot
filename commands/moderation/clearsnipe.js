module.exports = {
  name: 'clear-snipe',
  aliases: ['cs'],
  description: 'Clears all cached sniped messages',
  async execute(message) {
    messageDeleteEvent.snipes.clear();

    try {
      await message.react('✅');
    } catch (error) {
      console.error('Failed to react:', error);
    }
  }
};