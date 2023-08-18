const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "nick",
  description: "lệnh biệt danh",
  category: "MODERATION",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "set <@member> <name>",
        description: "đặt biệt danh cho người dùng chỉ định",
      },
      {
        trigger: "reset <@member>",
        description: "đặt lại biệt danh cho người dùng chỉ định",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "đặt biệt danh",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "thành viên bạn muốn đặt biệt danh",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "name",
            description: "biệt danh bạn muốn đặt",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "đặt lại biệt danh",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "thành viên bạn muốn đặt lại biệt danh",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Không thể tìm thấy thành viên!");
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply("Vui lòng cung cấp biệt danh");

      const response = await nickname(message, target, name);
      return message.safeReply(response);
    }

    //
    else if (sub === "reset") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Không thể tìm thấy thành viên");

      const response = await nickname(message, target);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction) {
    const name = interaction.options.getString("name");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));

    const response = await nickname(interaction, target, name);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name) {
  if (!canModerate(member, target)) {
    return `Ầu! Bạn không thể quản lý biệt danh của ${target.user.username}`;
  }
  if (!canModerate(guild.members.me, target)) {
    return `Ầu! Tớ không thể quản lý biệt danh của ${target.user.username}`;
  }

  try {
    await target.setNickname(name);
    return `Đã ${name ? "đổi" : "đặt lại"} biệt danh cho ${target.user.username}`;
  } catch (ex) {
    return `Thất bại khi ${name ? "đổi" : "đặt"} biệt danh cho ${target.displayName}. Bạn đã cung cấp một tên hợp lệ?`;
  }
}
