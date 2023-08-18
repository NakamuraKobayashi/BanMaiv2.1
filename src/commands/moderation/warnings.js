const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getWarningLogs, clearWarningLogs } = require("@schemas/ModLog");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "warnings",
  description: "liệt kê hoặc xóa cảnh báo người dùng",
  category: "MODERATION",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "list [member]",
        description: "liệt kê tất cả các cảnh báo của người dùng",
      },
      {
        trigger: "clear <member>",
        description: "xóa tất cả các cảnh báo của người dùng",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "list",
        description: "liệt kê tất cả các cảnh báo của người dùng",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "đối tượng",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: "clear",
        description: "xóa tất cả các cảnh báo của người dùng",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "đối tượng",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    let response = "";

    if (sub === "list") {
      const target = (await message.guild.resolveMember(args[1], true)) || message.member;
      if (!target) return message.safeReply(`Không tìm thấy người dùng ${args[1]}`);
      response = await listWarnings(target, message);
    }

    //
    else if (sub === "clear") {
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply(`Không tìm thấy người dùng ${args[1]}`);
      response = await clearWarnings(target, message);
    }

    // else
    else {
      response = `Lệnh phụ không hợp lệ ${sub}`;
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response = "";

    if (sub === "list") {
      const user = interaction.options.getUser("user");
      const target = (await interaction.guild.members.fetch(user.id)) || interaction.member;
      response = await listWarnings(target, interaction);
    }

    //
    else if (sub === "clear") {
      const user = interaction.options.getUser("user");
      const target = await interaction.guild.members.fetch(user.id);
      response = await clearWarnings(target, interaction);
    }

    // else
    else {
      response = `lệnh phụ không hợp lệ ${sub}`;
    }

    await interaction.followUp(response);
  },
};

async function listWarnings(target, { guildId }) {
  if (!target) return "Không có người dùng được chỉ định";
  if (target.user.bot) return "Bot không thể có cảnh cáo";

  const warnings = await getWarningLogs(guildId, target.id);
  if (!warnings.length) return `${target.user.username} không có cảnh cáo nào`;

  const acc = warnings.map((warning, i) => `${i + 1}. ${warning.reason} [Bởi ${warning.admin.username}]`).join("\n");
  const embed = new EmbedBuilder({
    author: { name: `Số lần cảnh cáo của ${target.user.username}` },
    description: acc,
  });

  return { embeds: [embed] };
}

async function clearWarnings(target, { guildId }) {
  if (!target) return "Không có người dùng được chỉ định";
  if (target.user.bot) return "Bot không có bị cảnh cáo";

  const memberDb = await getMember(guildId, target.id);
  memberDb.warnings = 0;
  await memberDb.save();

  await clearWarningLogs(guildId, target.id);
  return `Tổng số lần cảnh cáo của ${target.user.username} đã được xóa`;
}
