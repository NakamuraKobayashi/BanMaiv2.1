const { isHex } = require("@helpers/Utils");
const { buildGreeting } = require("@handlers/greeting");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "welcome",
  description: "Thiết lập tin nhắn chào mừng",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "bật hoặc tắt thông báo chào mừng",
      },
      {
        trigger: "channel <#channel>",
        description: "Thiết lập kênh cho thông báo chào mừng",
      },
      {
        trigger: "preview",
        description: "Bản xem trước của thiết lập thông báo chào mừng",
      },
      {
        trigger: "desc <text>",
        description: "Đặt mô tả",
      },
      {
        trigger: "thumbnail <ON|OFF>",
        description: "Bật/tắt hình thu nhỏ",
      },
      {
        trigger: "color <hexcolor>",
        description: "Đặt màu cho tin nhắn",
      },
      {
        trigger: "footer <text>",
        description: "Đặt nội dung cho chân tin nhắn",
      },
      {
        trigger: "image <url>",
        description: "Đặt hình ảnh cho tin nhắn",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "bật hoặc tắt thông báo chào mừng",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "Bật hoặc Tắt",
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
        name: "preview",
        description: "Xem trước thiết lập tin nhắn chào mừng",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "channel",
        description: "Đặt kênh thông báo chào mừng",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Tên kênh",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "desc",
        description: "Đặt mô tả",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "Nội dung mô tả",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "thumbnail",
        description: "Thiết lập hình thu nhỏ",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "Trạng thái hình thu nhỏ",
            type: ApplicationCommandOptionType.String,
            required: true,
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
        name: "color",
        description: "Đặt màu cho tin nhắn",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "hex-code",
            description: "Mã màu Hex",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "footer",
        description: "Đặt chân tin nhắn",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "Nội dung chân tin nhắn",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "image",
        description: "Đặt ảnh cho tin nhắn",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "url",
            description: "url hình ảnh",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;

    // preview
    if (type === "preview") {
      response = await sendPreview(settings, message.member);
    }

    // status
    else if (type === "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Trạng thái không hợp lệ. Giá trị phải là `on/off`");
      response = await setStatus(settings, status);
    }

    // channel
    else if (type === "channel") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    else if (type === "desc") {
      if (args.length < 2) return message.safeReply("Không đủ giá trị! Vui lòng cung cấp nội dung hợp lệ");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // thumbnail
    else if (type === "thumbnail") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Trạng thái không hợp lệ. Giá trị phải là `on/off`");
      response = await setThumbnail(settings, status);
    }

    // color
    else if (type === "color") {
      const color = args[1];
      if (!color || !isHex(color)) return message.safeReply("Màu không phù hợp. Màu phải là giá trị max Hex");
      response = await setColor(settings, color);
    }

    // footer
    else if (type === "footer") {
      if (args.length < 2) return message.safeReply("Không đủ giá trị! Vui lòng cung cấp nội dung hợp lệ");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    // image
    else if (type === "image") {
      const url = args[1];
      if (!url) return message.safeReply("Url hình ảnh không hợp lệ. Vui lòng cung cấp url hợp lệ");
      response = await setImage(settings, url);
    }

    //
    else response = "Sử dụng lệnh không hợp lệ!";
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    switch (sub) {
      case "preview":
        response = await sendPreview(settings, interaction.member);
        break;

      case "status":
        response = await setStatus(settings, interaction.options.getString("status"));
        break;

      case "channel":
        response = await setChannel(settings, interaction.options.getChannel("channel"));
        break;

      case "desc":
        response = await setDescription(settings, interaction.options.getString("content"));
        break;

      case "thumbnail":
        response = await setThumbnail(settings, interaction.options.getString("status"));
        break;

      case "color":
        response = await setColor(settings, interaction.options.getString("hex-code"));
        break;

      case "footer":
        response = await setFooter(settings, interaction.options.getString("content"));
        break;

      case "image":
        response = await setImage(settings, interaction.options.getString("url"));
        break;

      default:
        response = "Lựa chọn không hợp lệ";
    }

    return interaction.followUp(response);
  },
};

async function sendPreview(settings, member) {
  if (!settings.welcome?.enabled) return "Thông báo chào mừng không được bật trong máy chủ này";

  const targetChannel = member.guild.channels.cache.get(settings.welcome.channel);
  if (!targetChannel) return "Không có kênh nào được định cấu hình để gửi tin nhắn chào mừng";

  const response = await buildGreeting(member, "WELCOME", settings.welcome);
  await targetChannel.safeSend(response);

  return `Đã gửi bản xem trước thông báo chào mừng đến ${targetChannel.toString()}`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.welcome.enabled = enabled;
  await settings.save();
  return `Đã lưu thiết lập! Tin nhắn chào mừng hiện đang ${enabled ? "BẬT" : "TẮT"}`;
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return (
      "Ugh! Tớ không thể gửi tin nhắn chia tay đến kênh đó? Tớ cần quyền `Gửi tin nhắn` và `Đường dẫn nhúng` trong kênh " +
      channel.toString()
    );
  }
  settings.welcome.channel = channel.id;
  await settings.save();
  return `Đã lưu thiết lập! Tin nhắn chào mừng sẽ được gửi đến kênh ${channel ? channel.toString() : "Không tìm thấy kênh"}`;
}

async function setDescription(settings, desc) {
  settings.welcome.embed.description = desc;
  await settings.save();
  return "Đã lưu thiết lập! Tin nhắn chào mừng đã được cập nhật";
}

async function setThumbnail(settings, status) {
  settings.welcome.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return "Đã lưu thiết lập! Tin nhắn chào mừng đã được cập nhật";
}

async function setColor(settings, color) {
  settings.welcome.embed.color = color;
  await settings.save();
  return "Đã lưu thiết lập! Tin nhắn chào mừng đã được cập nhật";
}

async function setFooter(settings, content) {
  settings.welcome.embed.footer = content;
  await settings.save();
  return "Đã lưu thiết lập! Tin nhắn chào mừng đã được cập nhật";
}

async function setImage(settings, url) {
  settings.welcome.embed.image = url;
  await settings.save();
  return "Đã lưu thiết lập! Tin nhắn chào mừng đã được cập nhật";
}
