const { musicValidations } = require("@helpers/BotUtils");
const prettyMs = require("pretty-ms");
const { durationToMillis } = require("@helpers/Utils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "seek",
  description: "đặt vị trí của bản nhạc đang phát thành vị trí đã chỉ định",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    usage: "<thời gian>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "time",
        description: "khoảng thời gian bạn muốn tua đến",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const time = args.join(" ");
    const response = seekTo(message, time);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const time = interaction.options.getString("time");
    const response = seekTo(interaction, time);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} time
 */
function seekTo({ client, guildId }, time) {
  const player = client.musicManager?.getPlayer(guildId);
  const seekTo = durationToMillis(time);

  if (seekTo > player.queue.current.length) {
    return "Thời lượng bạn cung cấp vượt quá thời lượng của bản nhạc hiện tại";
  }

  player.seek(seekTo);
  return `Tua đến ${prettyMs(seekTo, { colonNotation: true, secondsDecimalDigits: 0 })}`;
}
