const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "modlog",
  description: "bật hoặc tắt nhật ký kiểm duyệt",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#channel|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "kênh để gửi nhật ký kiểm duyệt",
        required: false,
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size === 0) return message.safeReply("Sử dụng lệnh không hợp lệ!");
      targetChannel = message.mentions.channels.first();
    }

    const response = await setChannel(targetChannel, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const channel = interaction.options.getChannel("channel");
    const response = await setChannel(channel, data.settings);
    return interaction.followUp(response);
  },
};

async function setChannel(targetChannel, settings) {
  if (!targetChannel && !settings.modlog_channel) {
    return "Nó đã bị vô hiệu hóa!";
  }

  if (targetChannel && !targetChannel.canSendEmbeds()) {
    return "Ầu! Tớ không thể gửi nhật ký đến kênh đó? Tớ cần quyền `Gửi tin nhắn` và `Liên kết nhúng` để gửi tin nhắn vào kênh đó";
  }

  settings.modlog_channel = targetChannel?.id;
  await settings.save();
  return `Đã lưu thiết lập! Kênh nhật ký kiểm duyệt đã được ${targetChannel ? "cập nhật" : "vô hiệu hóa"}`;
}
