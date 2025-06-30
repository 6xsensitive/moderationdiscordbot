module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[BOT] Signed in as ${client.user.tag}!`);
    client.user.setPresence({
      activities: [{ name: 'Status' }],
      status: 'dnd',
    });
  }
};