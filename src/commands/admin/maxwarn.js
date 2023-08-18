const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "maxwarn",
  description: "đặt số lần cảnh báo tối đa",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "limit <number>",
        description: "đặt cảnh báo tối đa mà thành viên sẽ nhận được trước khi thực hiện hành động",
      },
      {
        trigger: "action <timeout|kick|ban>",
        description: "đặt hành động để thực hiện sau khi đạt số lần cảnh báo tối đa",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "limit",
        description: "đặt cảnh báo tối đa mà thành viên có thể nhận được trước khi thực hiện hành động",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "số lần cảnh cáo tối đa",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "action",
        description: "đặt hành động để thực hiện sau khi đạt số lần cảnh báo tối đa",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "action",
            description: "hành động thực hiện",
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
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["limit", "action"].includes(input)) return message.safeReply("Sử dụng lệnh không hợp lệ");

    let response;
    if (input === "limit") {
      const max = parseInt(args[1]);
      if (isNaN(max) || max < 1) return message.safeReply("Cảnh báo tối đa phải là một số hợp lệ lớn hơn 0");
      response = await setLimit(max, data.settings);
    }

    if (input === "action") {
      const action = args[1]?.toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply("Không phải là một hành động hợp lệ. Hành động hợp lệ là `Timeout`/`Kick`/`Ban`");
      response = await setAction(message.guild, action, data.settings);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();

    let response;
    if (sub === "limit") {
      response = await setLimit(interaction.options.getInteger("amount"), data.settings);
    }

    if (sub === "action") {
      response = await setAction(interaction.guild, interaction.options.getString("action"), data.settings);
    }

    await interaction.followUp(response);
  },
};

async function setLimit(limit, settings) {
  settings.max_warn.limit = limit;
  await settings.save();
  return `Đã lưu thiết lập! Số lần cảnh báo tối đa được đặt thành ${limit}`;
}

async function setAction(guild, action, settings) {
  if (action === "TIMEOUT") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return "Tớ không có quyền để Timeout thành viên";
    }
  }

  if (action === "KICK") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return "Tớ không có quyền để Loại trừ thành viên";
    }
  }

  if (action === "BAN") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return "Tớ không có quyền để Cấm thành viên";
    }
  }

  settings.max_warn.action = action;
  await settings.save();
  return `Đã lưu thiết lập! Hành động AutoMod được đặt thành ${action}`;
}
