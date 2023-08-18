const { addReactionRole, getReactionRoles } = require("@schemas/ReactionRoles");
const { parseEmoji, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addrr",
  description: "thiết lập reaction roles cho một tin nhắn nhất định",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#channel> <messageId> <emote> <role>",
    minArgsCount: 4,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "kênh chứa tin nhắn cần thiết lập",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: "message_id",
        description: "ID Tin nhắn cần thiết lập",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "emoji",
        description: "Biểu tượng cảm xúc muốn sử dụng",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "role",
        description: "Vai trò mà thành viên sẽ nhận được khi nhấn vào biểu tượng cảm xúc được đặt",
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(`Không tìm thấy kênh ${args[0]}`);

    const targetMessage = args[1];

    const role = message.guild.findMatchingRoles(args[3])[0];
    if (!role) return message.safeReply(`Không tìm thấy Vai trò ${args[3]}`);

    const reaction = args[2];

    const response = await addRR(message.guild, targetChannel[0], targetMessage, reaction, role);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message_id");
    const reaction = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");

    const response = await addRR(interaction.guild, targetChannel, messageId, reaction, role);
    await interaction.followUp(response);
  },
};

async function addRR(guild, channel, messageId, reaction, role) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `Bạn cần các quyền sau trong kênh ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
  } catch (ex) {
    return "Không thể tìm nạp tin nhắn. Bạn đã cung cấp ID Tin nhắn hợp lệ chưa?";
  }

  if (role.managed) {
    return "Tớ không thể chỉ định vai trò của bot.";
  }

  if (guild.roles.everyone.id === role.id) {
    return "Bạn không thể chỉ định vai trò @everyone";
  }

  if (guild.members.me.roles.highest.position < role.position) {
    return "Ầu! Tớ không thể thêm/xóa thành viên vào vai trò đó. Vai trò đó có cao hơn tớ không?";
  }

  const custom = parseEmoji(reaction);
  if (custom.id && !guild.emojis.cache.has(custom.id)) return "Biểu tượng cảm xúc đó không thuộc máy chủ này";
  const emoji = custom.id ? custom.id : custom.name;

  try {
    await targetMessage.react(emoji);
  } catch (ex) {
    return `Ầu! Không thể tạo react. Đây có phải là biểu tượng cảm xúc hợp lệ không: ${reaction} ?`;
  }

  let reply = "";
  const previousRoles = getReactionRoles(guild.id, channel.id, targetMessage.id);
  if (previousRoles.length > 0) {
    const found = previousRoles.find((rr) => rr.emote === emoji);
    if (found) reply = "Một vai trò đã được thiết lập cho biểu tượng cảm xúc này rồi. Ghi đè dữ liệu,\n";
  }

  await addReactionRole(guild.id, channel.id, targetMessage.id, emoji, role.id);
  return (reply += "Xong! Đã lưu thiết lập");
}
