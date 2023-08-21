const { trackVoiceStats } = require("@handlers/stats");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').VoiceState} oldState
 * @param {import('discord.js').VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  let timeoutId = null; // Khởi tạo biến timeout
  // Track voice stats
  trackVoiceStats(oldState, newState);

  // Erela.js
  if (client.config.MUSIC.ENABLED) {
    const guild = oldState.guild;

    // if nobody left the channel in question, return.
    if (oldState.channelId !== guild.members.me.voice.channelId || newState.channel) return;

    // otherwise, check how many people are in the channel now
    if (oldState.channel.members.size !== 1) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId); // Hủy sự kiện timeout nếu điều kiện không đáp ứng
        timeoutId = null; // Đặt lại biến timeoutId về null sau khi hủy
      }
    }

    if (oldState.channel.members.size === 1) {
      timeoutId = setTimeout(() => {
        // if 1 (you), wait 1 minute
          const player = client.musicManager.getPlayer(guild.id);
          if (player) client.musicManager.destroyPlayer(guild.id).then(player.disconnect()); // destroy the player
      }, client.config.MUSIC.IDLE_TIME * 1000);
    }
  }
};
