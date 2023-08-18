const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ButtonStyle,
  TextInputStyle,
  ComponentType,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { isTicketChannel, closeTicket, closeAllTickets } = require("@handlers/ticket");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticket",
  description: "Các lệnh Ticket khác nhau",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "setup <#channel>",
        description: "bắt đầu thiết lập Ticket",
      },
      {
        trigger: "log <#channel>",
        description: "thiết lập kênh ghi chép lịch sử tickets",
      },
      {
        trigger: "limit <number>",
        description: "đặt số lượng Ticket mở đồng thời tối đa",
      },
      {
        trigger: "close",
        description: "đóng một ticket",
      },
      {
        trigger: "closeall",
        description: "đóng tất cả các ticket",
      },
      {
        trigger: "add <userId|roleId>",
        description: "thêm người dùng/vai trò vào ticket",
      },
      {
        trigger: "remove <userId|roleId>",
        description: "xóa người dùng/vai trò khỏi ticket",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "setup",
        description: "thiết lập một tin nhắn Ticket",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "kênh mà tin nhắn tạo Ticket sẽ được gửi",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "log",
        description: "thiết lập kênh nhật ký cho Ticket",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "kênh nơi các bản ghi cho Ticket sẽ được gửi",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "limit",
        description: "đặt số lượng Ticket mở đồng thời tối đa",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "số lượng Ticket tối đa",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "close",
        description: "đóng Ticket [chỉ được sử dụng trong kênh Ticket]",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "closeall",
        description: "đóng tất cả các Ticket",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "thêm người dùng vào kênh Ticket hiện tại [chỉ được sử dụng trong kênh Ticket]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user_id",
            description: "ID của người dùng để thêm",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "xóa người dùng khỏi kênh Ticket [chỉ được sử dụng trong kênh Ticket]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "người dùng",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let response;

    // Setup
    if (input === "setup") {
      if (!message.guild.members.me.permissions.has("ManageChannels")) {
        return message.safeReply("Tớ thiếu quyền `Quản lý kênh` nên không tạo Ticket cho cậu được :(");
      }
      const targetChannel = message.guild.findMatchingChannels(args[1])[0];
      if (!targetChannel) {
        return message.safeReply("Tớ không thể tìm thấy kênh có tên đó");
      }
      return ticketModalSetup(message, targetChannel, data.settings);
    }

    // log ticket
    else if (input === "log") {
      if (args.length < 2) return message.safeReply("Vui lòng cung cấp một kênh để gửi nhật ký vé");
      const target = message.guild.findMatchingChannels(args[1]);
      if (target.length === 0) return message.safeReply("Không thể tìm thấy bất kỳ kênh nào phù hợp");
      response = await setupLogChannel(target[0], data.settings);
    }

    // Set limit
    else if (input === "limit") {
      if (args.length < 2) return message.safeReply("Hãy cung cấp số lượng Ticket giới hạn cùng lúc");
      const limit = args[1];
      if (isNaN(limit)) return message.safeReply("Vui lòng cung cấp một đầu vào số");
      response = await setupLimit(limit, data.settings);
    }

    // Close ticket
    else if (input === "close") {
      response = await close(message, message.author);
      if (!response) return;
    }

    // Close all tickets
    else if (input === "closeall") {
      let sent = await message.safeReply("Đang đóng tất cả các Ticket...");
      response = await closeAll(message, message.author);
      return sent.editable ? sent.edit(response) : message.channel.send(response);
    }

    // Add user to ticket
    else if (input === "add") {
      if (args.length < 2) return message.safeReply("Vui lòng cung cấp người dùng hoặc vai trò để thêm vào Ticket");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId);
    }

    // Remove user from ticket
    else if (input === "remove") {
      if (args.length < 2) return message.safeReply("Vui lòng cung cấp người dùng hoặc vai trò để xóa khỏi Ticket");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId);
    }

    // Invalid input
    else {
      return message.safeReply("Sử dụng lệnh không hợp lệ");
    }

    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // setup
    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");

      if (!interaction.guild.members.me.permissions.has("ManageChannels")) {
        return interaction.followUp("Tớ thiếu quyền `Quản lý kênh` nên không tạo Ticket cho cậu được :(");
      }

      await interaction.deleteReply();
      return ticketModalSetup(interaction, channel, data.settings);
    }

    // Log channel
    else if (sub === "log") {
      const channel = interaction.options.getChannel("channel");
      response = await setupLogChannel(channel, data.settings);
    }

    // Limit
    else if (sub === "limit") {
      const limit = interaction.options.getInteger("amount");
      response = await setupLimit(limit, data.settings);
    }

    // Close
    else if (sub === "close") {
      response = await close(interaction, interaction.user);
    }

    // Close all
    else if (sub === "closeall") {
      response = await closeAll(interaction, interaction.user);
    }

    // Add to ticket
    else if (sub === "add") {
      const inputId = interaction.options.getString("user_id");
      response = await addToTicket(interaction, inputId);
    }

    // Remove from ticket
    else if (sub === "remove") {
      const user = interaction.options.getUser("user");
      response = await removeFromTicket(interaction, user.id);
    }

    if (response) await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').Message} param0
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */
async function ticketModalSetup({ guild, channel, member }, targetChannel, settings) {
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_btnSetup").setLabel("Setup Message").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: "Vui lòng nhấp vào nút bên dưới để thiết lập tin nhắn vé",
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "ticket_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "Không nhận được phản hồi, đã hủy thiết lập", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "ticket-modalSetup",
      title: "Ticket Setup",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Tiêu đề của tin nhắn Embed")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Mô tả của tin nhắn Embed")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footer")
            .setLabel("Chân tin nhắn")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "ticket-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "Không nhận được phản hồi, đã hủy thiết lập", components: [] });

  await modal.reply("Thiết lập tin nhắn Ticket ...");
  const title = modal.fields.getTextInputValue("title");
  const description = modal.fields.getTextInputValue("description");
  const footer = modal.fields.getTextInputValue("footer");

  // send ticket message
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: title || "Ticket Hỗ Trợ" })
    .setDescription(description || "Vui lòng sử dụng nút bên dưới để tạo Ticket")
    .setFooter({ text: footer || "Bạn chỉ có thể có 1 vé mở tại một thời điểm!" });

  const tktBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Mở một Ticket").setCustomId("TICKET_CREATE").setStyle(ButtonStyle.Success)
  );

  await targetChannel.send({ embeds: [embed], components: [tktBtnRow] });
  await modal.deleteReply();
  await sentMsg.edit({ content: "Xong! Đã tạo thông báo Ticket", components: [] });
}

async function setupLogChannel(target, settings) {
  if (!target.canSendEmbeds()) return `Ầu! Tớ cần có quyền gửi nội dung embed để gửi tin nhắn trong kênh ${target}`;

  settings.ticket.log_channel = target.id;
  await settings.save();

  return `Đã thiết lập! Nhật ký Ticket sẽ được gửi đến ${target.toString()}`;
}

async function setupLimit(limit, settings) {
  if (Number.parseInt(limit, 10) < 5) return "Giới hạn Ticket không được nhỏ hơn 5";

  settings.ticket.limit = limit;
  await settings.save();

  return `Đã thiết lập. Bây giờ bạn có thể có tối đa \`${limit}\` ticket được mở`;
}

async function close({ channel }, author) {
  if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong các kênh ticket";
  const status = await closeTicket(channel, author, "Đóng bởi kiểm duyệt viên");
  if (status === "MISSING_PERMISSIONS") return "Tôi không có quyền đóng Ticket";
  if (status === "ERROR") return "Đã xảy ra lỗi khi đóng Ticket";
  return null;
}

async function closeAll({ guild }, user) {
  const stats = await closeAllTickets(guild, user);
  return `Hoàn thành! Ngon: \`${stats[0]}\` Lỗi: \`${stats[1]}\``;
}

async function addToTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong các kênh Ticket";
  if (!inputId || isNaN(inputId)) return "Ầu! Bạn cần nhập userId/roleId hợp lệ";

  try {
    await channel.permissionOverwrites.create(inputId, {
      ViewChannel: true,
      SendMessages: true,
    });

    return "Xong";
  } catch (ex) {
    return "Không thể thêm người dùng/vai trò. Bạn đã cung cấp ID hợp lệ chưa?";
  }
}

async function removeFromTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong các kênh Ticket";
  if (!inputId || isNaN(inputId)) return "Ầu! Bạn cần nhập userId/roleId hợp lệ";

  try {
    channel.permissionOverwrites.create(inputId, {
      ViewChannel: false,
      SendMessages: false,
    });
    return "Xong";
  } catch (ex) {
    return "Không thể thêm người dùng/vai trò. Bạn đã cung cấp ID hợp lệ chưa?";
  }
}
