const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autodelete",
  description: "quản lý cài đặt tự động xóa cho máy chủ",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "attachments <on|off>",
        description: "cho phép hoặc không cho phép tệp đính kèm trong tin nhắn",
      },
      {
        trigger: "invites <on|off>",
        description: "cho phép hoặc không cho phép lời mời trong tin nhắn",
      },
      {
        trigger: "links <on|off>",
        description: "cho phép hoặc không cho phép liên kết trong tin nhắn",
      },
      {
        trigger: "maxlines <số dòng>",
        description: "đặt các dòng tối đa được phép cho mỗi tin nhắn [0 để tắt]",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "attachments",
        description: "cho phép hoặc không cho phép tệp đính kèm trong tin nhắn",
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
        name: "invites",
        description: "cho phép hoặc không cho phép lời mời trong tin nhắn",
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
        name: "links",
        description: "cho phép hoặc không cho phép liên kết trong tin nhắn",
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
        name: "maxlines",
        description: "đặt các dòng tối đa được phép cho mỗi tin nhắn",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "số lượng được cài (0 để tắt)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();
    let response;

    if (sub == "attachments") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Trạng thái không hợp lệ. Giá trị phải là `on/off`");
      response = await antiAttachments(settings, status);
    }

    //
    else if (sub === "invites") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Trạng thái không hợp lệ. Giá trị phải là `on/off`");
      response = await antiInvites(settings, status);
    }

    //
    else if (sub == "links") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Trạng thái không hợp lệ. Giá trị phải là `on/off`");
      response = await antilinks(settings, status);
    }

    //
    else if (sub === "maxlines") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1) {
        return message.safeReply("Số dòng tối đa phải là một số hợp lệ lớn hơn 0");
      }
      response = await maxLines(settings, max);
    }

    //
    else response = "Sử dụng lệnh không hợp lệ!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;
    let response;

    if (sub == "attachments") {
      response = await antiAttachments(settings, interaction.options.getString("status"));
    } else if (sub === "invites") response = await antiInvites(settings, interaction.options.getString("status"));
    else if (sub == "links") response = await antilinks(settings, interaction.options.getString("status"));
    else if (sub === "maxlines") response = await maxLines(settings, interaction.options.getInteger("amount"));
    else response = "Sử dụng lệnh không hợp lệ!";

    await interaction.followUp(response);
  },
};

async function antiAttachments(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_attachments = status;
  await settings.save();
  return `Tin nhắn ${
    status ? "có các tệp đính kèm sẽ tự động bị xóa" : "Từ bây giờ sẽ không được lọc cho các tệp đính kèm"
  }`;
}

async function antiInvites(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_invites = status;
  await settings.save();
  return `Tin nhắn ${
    status ? "có lời mời Discord bây giờ sẽ tự động bị xóa" : "Từ bây giờ sẽ không được lọc cho các lời mời Discord"
  }`;
}

async function antilinks(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_links = status;
  await settings.save();
  return `Tin nhắn ${status ? "chứa các liên kết bây giờ sẽ tự động bị xóa" : "Từ bây giờ sẽ không được lọc cho các liên kết"}`;
}

async function maxLines(settings, input) {
  const lines = Number.parseInt(input);
  if (isNaN(lines)) return "Vui lòng nhập số hợp lệ";

  settings.automod.max_lines = lines;
  await settings.save();
  return `${
    input === 0
      ? "Giới hạn dòng tối đa bị vô hiệu hóa"
      : `Từ bây giờ, tin nhắn dài hơn \`${input}\` dòng sẽ tự động bị xóa`
  }`;
}
