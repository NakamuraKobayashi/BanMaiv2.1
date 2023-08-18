const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "automod",
  description: "Thiết lập automod khác nhau",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status",
        description: "Kiểm tra thiết lập AutoMod trong máy chủ này",
      },
      {
        trigger: "strikes <number>",
        description: "số cảnh cáo tối đa mà một thành viên có thể nhận được trước khi thực hiện hành động",
      },
      {
        trigger: "action <TIMEOUT|KICK|BAN>",
        description: "đặt hành động được thực hiện sau khi nhận được số lần cảnh cáo tối đa",
      },
      {
        trigger: "debug <on|off>",
        description: "bật automod cho các tin nhắn được gửi bởi quản trị viên và người điều hành",
      },
      {
        trigger: "whitelist",
        description: "danh sách các kênh được đưa vào danh sách trắng",
      },
      {
        trigger: "whitelistadd <channel>",
        description: "thêm một kênh vào danh sách trắng",
      },
      {
        trigger: "whitelistremove <channel>",
        description: "xóa một kênh khỏi danh sách trắng",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "Kiểm tra thiết lập AutoMod",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "strikes",
        description: "đặt số lượng cảnh cáo tối đa trước khi thực hiện một hành động",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "số lần cảnh cáo (mặc định là 5)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
      {
        name: "action",
        description: "đặt hành động sẽ thực hiện sau khi nhận được số lần cảnh cáo tối đa",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "action",
            description: "action to perform",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "TIMEOUT",
                value: "TIMEOUT",
              },
              {
                name: "KICK",
                value: "KICK",
              },
              {
                name: "BAN",
                value: "BAN",
              },
            ],
          },
        ],
      },
      {
        name: "debug",
        description: "bật/tắt AutoMod cho các tin nhắn được gửi bởi quản trị viên và người điều hành",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "Trạng thái",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "whitelist",
        description: "Xem danh sách các kênh trong danh sách trắng",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "whitelistadd",
        description: "Thêm một kênh vào danh sách trắng",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "kênh để thêm vào",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "whitelistremove",
        description: "Xóa một kênh khỏi danh sách trắng",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "kênh để xóa khỏi danh sách trắng",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    const settings = data.settings;

    let response;
    if (input === "status") {
      response = await getStatus(settings, message.guild);
    } else if (input === "strikes") {
      const strikes = args[1];
      if (isNaN(strikes) || Number.parseInt(strikes) < 1) {
        return message.safeReply("Số lần cảnh cáo phải lớn hơn 0");
      }
      response = await setStrikes(settings, strikes);
    } else if (input === "action") {
      const action = args[1].toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply("Hành động không hợp lệ. Các hành động là `Timeout`/`Kick`/`Ban`");
      response = await setAction(settings, message.guild, action);
    } else if (input === "debug") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Trạng thái không hợp lệ. Giá trị hợp lệ là `on/off`");
      response = await setDebug(settings, status);
    }

    // whitelist
    else if (input === "whitelist") {
      response = getWhitelist(message.guild, settings);
    }

    // whitelist add
    else if (input === "whitelistadd") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`Không tìm thấy kênh nào phù hợp ${args[1]}`);
      response = await whiteListAdd(settings, match[0].id);
    }

    // whitelist remove
    else if (input === "whitelistremove") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`Không tìm thấy kênh nào phù hợp ${args[1]}`);
      response = await whiteListRemove(settings, match[0].id);
    }

    //
    else response = "Sử dụng lệnh không hợp lệ!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;

    if (sub === "status") response = await getStatus(settings, interaction.guild);
    else if (sub === "strikes") response = await setStrikes(settings, interaction.options.getInteger("amount"));
    else if (sub === "action")
      response = await setAction(settings, interaction.guild, interaction.options.getString("action"));
    else if (sub === "debug") response = await setDebug(settings, interaction.options.getString("status"));
    else if (sub === "whitelist") {
      response = getWhitelist(interaction.guild, settings);
    } else if (sub === "whitelistadd") {
      const channelId = interaction.options.getChannel("channel").id;
      response = await whiteListAdd(settings, channelId);
    } else if (sub === "whitelistremove") {
      const channelId = interaction.options.getChannel("channel").id;
      response = await whiteListRemove(settings, channelId);
    }

    await interaction.followUp(response);
  },
};

async function getStatus(settings, guild) {
  const { automod } = settings;

  const logChannel = settings.modlog_channel
    ? guild.channels.cache.get(settings.modlog_channel).toString()
    : "Not Configured";

  // String Builder
  let desc = stripIndent`
    ❯ **Max Lines**: ${automod.max_lines || "NA"}
    ❯ **Anti-Massmention**: ${automod.anti_massmention > 0 ? "✓" : "✕"}
    ❯ **Anti-Attachment**: ${automod.anti_attachment ? "✓" : "✕"}
    ❯ **Anti-Links**: ${automod.anti_links ? "✓" : "✕"}
    ❯ **Anti-Invites**: ${automod.anti_invites ? "✓" : "✕"}
    ❯ **Anti-Spam**: ${automod.anti_spam ? "✓" : "✕"}
    ❯ **Anti-Ghostping**: ${automod.anti_ghostping ? "✓" : "✕"}
  `;

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Automod Configuration", iconURL: guild.iconURL() })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addFields(
      {
        name: "Log Channel",
        value: logChannel,
        inline: true,
      },
      {
        name: "Max Strikes",
        value: automod.strikes.toString(),
        inline: true,
      },
      {
        name: "Action",
        value: automod.action,
        inline: true,
      },
      {
        name: "Debug",
        value: automod.debug ? "✓" : "✕",
        inline: true,
      }
    );

  return { embeds: [embed] };
}

async function setStrikes(settings, strikes) {
  settings.automod.strikes = strikes;
  await settings.save();
  return `Đã lưu thiết lập! Số lượng cảnh cáo tối đa được đặt thành ${strikes}`;
}

async function setAction(settings, guild, action) {
  if (action === "TIMEOUT") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return "Tớ không có quyền để Timeout thành viên";
    }
  }

  if (action === "KICK") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return "Tớ không có quyền để đuổi thành viên";
    }
  }

  if (action === "BAN") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return "Tớ không có quyền để cấm thành viên";
    }
  }

  settings.automod.action = action;
  await settings.save();
  return `Đã lưu thiết lập! Automod được đặt thành ${action}`;
}

async function setDebug(settings, input) {
  const status = input.toLowerCase() === "on" ? true : false;
  settings.automod.debug = status;
  await settings.save();
  return `Đã lưu thiết lập! Automod debug được đặt thành ${status ? "enabled" : "disabled"}`;
}

function getWhitelist(guild, settings) {
  const whitelist = settings.automod.wh_channels;
  if (!whitelist || !whitelist.length) return "Không có kênh nào được đưa vào danh sách trắng";

  const channels = [];
  for (const channelId of whitelist) {
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;
    if (channel) channels.push(channel.toString());
  }

  return `Các kênh trong danh sách trắng: ${channels.join(", ")}`;
}

async function whiteListAdd(settings, channelId) {
  if (settings.automod.wh_channels.includes(channelId)) return "Kênh đã được đưa vào danh sách trắng";
  settings.automod.wh_channels.push(channelId);
  await settings.save();
  return `Kênh được đưa vào danh sách trắng!`;
}

async function whiteListRemove(settings, channelId) {
  if (!settings.automod.wh_channels.includes(channelId)) return "Kênh không có trong danh sách trắng";
  settings.automod.wh_channels.splice(settings.automod.wh_channels.indexOf(channelId), 1);
  await settings.save();
  return `Đã xóa kênh khỏi danh sách trắng!`;
}
