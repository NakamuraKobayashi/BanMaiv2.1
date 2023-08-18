const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "levelup",
  description: "thiết lập hệ thống cấp độ",
  category: "STATS",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "message <new-message>",
        description: "đặt câu tùy chỉnh cho thông báo lên cấp",
      },
      {
        trigger: "channel <#channel|off>",
        description: "đặt kênh để gửi thông báo lên cấp",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "message",
        description: "đặt câu tùy chỉnh cho thông báo lên cấp",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message",
            description: "tin nhắn thông báo hiện khi thành viên lên cấp",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "channel",
        description: "đặt kênh để gửi thông báo lên cấp",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "kênh để tin nhắn thông báo gửi vào",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    const subcommandArgs = args.slice(1);
    let response;

    // message
    if (sub === "message") {
      const message = subcommandArgs.join(" ");
      response = await setMessage(message, data.settings);
    }

    // channel
    else if (sub === "channel") {
      const input = subcommandArgs[0];
      let channel;

      if (input === "off") channel = "off";
      else {
        const match = message.guild.findMatchingChannels(input);
        if (match.length === 0) return message.safeReply("Kênh không hợp lệ. Vui lòng cung cấp một kênh hợp lệ");
        channel = match[0];
      }
      response = await setChannel(channel, data.settings);
    }

    // invalid
    else response = "Lệnh phụ không hợp lệ";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    if (sub === "message") response = await setMessage(interaction.options.getString("message"), data.settings);
    else if (sub === "channel") response = await setChannel(interaction.options.getChannel("channel"), data.settings);
    else response = "Lệnh phụ không hợp lệ";

    await interaction.followUp(response);
  },
};

async function setMessage(message, settings) {
  if (!message) return "Invalid message. Please provide a message";
  settings.stats.xp.message = message;
  await settings.save();
  return `Configuration saved. Level up message updated!`;
}

async function setChannel(channel, settings) {
  if (!channel) return "Invalid channel. Please provide a channel";

  if (channel === "off") settings.stats.xp.channel = null;
  else settings.stats.xp.channel = channel.id;

  await settings.save();
  return `Configuration saved. Level up channel updated!`;
}
