const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "inviterank",
  description: "thiết lập cấp bậc mời",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<role-name> <invites>",
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "add <role> <invites>",
        description: "thêm xếp hạng tự động sau khi đạt được một số lượng lời mời cụ thể",
      },
      {
        trigger: "remove role",
        description: "xóa xếp hạng tự động được thiết lập với vai trò đó",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "add",
        description: "thêm một cấp bậc mời",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "vai trò được cung cấp",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
          {
            name: "invites",
            description: "số lượng lời mời cần thiết để có được vai trò",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "xóa xếp hạng lời mời được thiết lập trước đó",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "vai trò với xếp hạng lời mời được thiết lập",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0].toLowerCase();

    if (sub === "add") {
      const query = args[1];
      const invites = args[2];

      if (isNaN(invites)) return message.safeReply(`\`${invites}\` không phải là số lượng lời mời hợp lệ?`);
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(`Không tìm thấy vai trò \`${query}\``);

      const response = await addInviteRank(message, role, invites, data.settings);
      await message.safeReply(response);
    }

    //
    else if (sub === "remove") {
      const query = args[1];
      const role = message.guild.findMatchingRoles(query)[0];
      if (!role) return message.safeReply(`Không tìm thấy vai trò \`${query}\``);
      const response = await removeInviteRank(message, role, data.settings);
      await message.safeReply(response);
    }

    //
    else {
      await message.safeReply("Lệnh sử dụng không hợp lệ!");
    }
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    //
    if (sub === "add") {
      const role = interaction.options.getRole("role");
      const invites = interaction.options.getInteger("invites");

      const response = await addInviteRank(interaction, role, invites, data.settings);
      await interaction.followUp(response);
    }

    //
    else if (sub === "remove") {
      const role = interaction.options.getRole("role");
      const response = await removeInviteRank(interaction, role, data.settings);
      await interaction.followUp(response);
    }
  },
};

async function addInviteRank({ guild }, role, invites, settings) {
  if (!settings.invite.tracking) return `Invite Tracking bị vô hiệu hóa trong máy chủ này`;

  if (role.managed) {
    return "Bạn không thể chỉ định vai trò bot";
  }

  if (guild.roles.everyone.id === role.id) {
    return "Bạn không thể chỉ định vai trò @everyone.";
  }

  if (!role.editable) {
    return "Tớ không có quyền chuyển thành viên sang vai trò đó. Vai trò đó có thấp hơn vai trò của tớ không?";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);

  let msg = "";
  if (exists) {
    exists.invites = invites;
    msg += "Đã tìm thấy dữ liệu cũ về vai trò này. Ghi đề dữ liệu\n";
  }

  settings.invite.ranks.push({ _id: role.id, invites });
  await settings.save();
  return `${msg}Xong! Đã lưu thiết lập.`;
}

async function removeInviteRank({ guild }, role, settings) {
  if (!settings.invite.tracking) return `Invite Tracking bị vô hiệu hóa trong máy chủ này`;

  if (role.managed) {
    return "Bạn không thể chỉ định vai trò bot";
  }

  if (guild.roles.everyone.id === role.id) {
    return "Bạn không thể chỉ định vai trò @everyone.";
  }

  if (!role.editable) {
    return "Tớ không có quyền chuyển thành viên sang vai trò đó. Vai trò đó có thấp hơn vai trò của tớ không?";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === role.id);
  if (!exists) return "Không tìm thấy dữ liệu được thiết lập cho vai trò này";

  // delete element from array
  const i = settings.invite.ranks.findIndex((obj) => obj._id === role.id);
  if (i > -1) settings.invite.ranks.splice(i, 1);

  await settings.save();
  return "Xong! Đã lưu thiết lập.";
}
