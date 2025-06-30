const fs = require('fs');
const path = require('path');

const CONFIGS_PATH = path.resolve('./configs.json');

let configs = {};
try {
  configs = JSON.parse(fs.readFileSync(CONFIGS_PATH, 'utf8'));
} catch {
  configs = {};
}

function saveConfigs() {
  fs.writeFileSync(CONFIGS_PATH, JSON.stringify(configs, null, 2));
}

function getGuildConfig(guildId) {
  if (!configs[guildId]) {
    configs[guildId] = {
      warns: [],
      bans: [],
      kicks: [],
      softbans: [],
      timeouts: []
    };
    saveConfigs();
  }
  return configs[guildId];
}

module.exports = {
  getGuildConfig,
  saveConfigs
};