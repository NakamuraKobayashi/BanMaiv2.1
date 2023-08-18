const { approveSuggestion, rejectSuggestion } = require("@handlers/suggestion");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const CHANNEL_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks", "ManageMessages", "ReadMessageHistory"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "suggestion",
  description: "thiết lập hệ thống đề xuất",
  category: "SUGGESTION",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "bật/tắt hệ thống đề xuất",
      },
      {
        trigger: "channel <#channel|off>",
        description: "Thiết lập kênh đề xuất hoặc vô hiệu hóa nó",
      },
      {
        trigger: "appch <#channel>",
        description: "Thiết lập kênh đề xuất đã được phê duyệt hoặc tắt nó",
      },
      {
        trigger: "rejch <#channel>",
        description: "Thiết lập kênh đề xuất đã bị từ chôi hoặc tắt nó",
      },
      {
        trigger: "approve <channel> <messageId> [reason]",
        description: "đồng ý đề xuất",
      },
      {
        trigger: "reject <channel> <messageId> [reason]",
        description: "từ chối đề xuất",
      },
      {
        trigger: "staffadd <roleId>",
        description: "thêm một vai trò nhân viên",
      },
      {
        trigger: "staffremove <roleId>",
        description: "xóa một vai trò nhân viên",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "bật hoặc tắt hệ thống đề xuất",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "bật hoặc tắt",
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
        name: "channel",
        description: "Thiết lập kênh đề xuất hoặc vô hiệu hóa nó",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "Kênh mà tin nhắn đề xuất sẽ gửi đến",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "appch",
        description: "Thiết lập kênh đề xuất đã được phê duyệt hoặc tắt nó",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "Kênh mà tin nhắn đề xuất đã được chấp nhận sẽ gửi đến",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "rejch",
        description: "Thiết lập kênh đề xuất đã bị từ chối hoặc tắt nó",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "Kênh mà tin nhắn đề xuất đã bị từ chối sẽ gửi đến",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "approve",
        description: "chấp nhận đề xuất",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "kênh mà chứa tin nhắn đề xuất",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "ID tin nhắn đề xuất",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reason",
            description: "Lý do chấp nhận",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "reject",
        description: "Từ chối đề xuất",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "kênh mà chứa tin nhắn đề xuất",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "ID tin nhắn đề xuất",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reason",
            description: "Lý do từ chối đề xuất",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "staffadd",
        description: "thêm vai trò nhân viên",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "Vai trò được coi là nhân viên",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: "staffremove",
        description: "xóa vai trò nhân viên",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "Vai trò muốn xóa",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    let response;

    // status
    if (sub == "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Trạng thái không hợp lệ. Giá trị phải là `on/off`");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Không tìm thấy kênh ${input}`;
      else if (matched.length > 1) response = `Đã tìm thấy nhiều kênh cho ${input}. Vui lòng cụ thể hơn.`;
      else response = await setChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "appch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Không tìm thấy kênh ${input}`;
      else if (matched.length > 1) response = `Đã tìm thấy nhiều kênh cho ${input}. Vui lòng cụ thể hơn.`;
      else response = await setApprovedChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "rejch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Không tìm thấy kênh ${input}`;
      else if (matched.length > 1) response = `Đã tìm thấy nhiều kênh cho ${input}. Vui lòng cụ thể hơn.`;
      else response = await setRejectedChannel(data.settings, matched[0]);
    }

    // approve
    else if (sub == "approve") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Không tìm thấy kênh ${input}`;
      else if (matched.length > 1) response = `Đã tìm thấy nhiều kênh cho ${input}. Vui lòng cụ thể hơn.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await approveSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // reject
    else if (sub == "reject") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Không tìm thấy kênh ${input}`;
      else if (matched.length > 1) response = `Đã tìm thấy nhiều kênh cho ${input}. Vui lòng cụ thể hơn.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await rejectSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // staffadd
    else if (sub == "staffadd") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `Không tìm thấy vai trò ${input}`;
      else if (matched.length > 1) response = `Đã tìm thấy nhiều vai trò cho ${input}. Vui lòng cụ thể hơn.`;
      else response = await addStaffRole(data.settings, matched[0]);
    }

    // staffremove
    else if (sub == "staffremove") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `Không tìm thấy vai trò ${input}`;
      else if (matched.length > 1) response = `Đã tìm thấy nhiều vai trò cho ${input}. Vui lòng cụ thể hơn.`;
      else response = await removeStaffRole(data.settings, matched[0]);
    }

    // else
    else response = "Không phải là một lệnh phụ hợp lệ";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub == "status") {
      const status = interaction.options.getString("status");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setChannel(data.settings, channel);
    }

    // app_channel
    else if (sub == "appch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setApprovedChannel(data.settings, channel);
    }

    // rej_channel
    else if (sub == "rejch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setRejectedChannel(data.settings, channel);
    }

    // approve
    else if (sub == "approve") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await approveSuggestion(interaction.member, channel, messageId);
    }

    // reject
    else if (sub == "reject") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await rejectSuggestion(interaction.member, channel, messageId);
    }

    // staffadd
    else if (sub == "staffadd") {
      const role = interaction.options.getRole("role");
      response = await addStaffRole(data.settings, role);
    }

    // staffremove
    else if (sub == "staffremove") {
      const role = interaction.options.getRole("role");
      response = await removeStaffRole(data.settings, role);
    }

    // else
    else response = "Không phải là một lệnh phụ hợp lệ";
    await interaction.followUp(response);
  },
};

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.suggestions.enabled = enabled;
  await settings.save();
  return `Hệ thống đề xuất hiện đang ${enabled ? "BẬT" : "TẮT"}`;
}

async function setChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.channel_id = null;
    await settings.save();
    return "Hệ thộng đề xuất hiện đang bị vô hiệu hóa";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Tớ cần quyền ${parsePermissions(CHANNEL_PERMS)} trong kênh ${channel}`;
  }

  settings.suggestions.channel_id = channel.id;
  await settings.save();
  return `Từ bây giờ, tin nhắn đề xuất sẽ được gửi về ${channel}`;
}

async function setApprovedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.approved_channel = null;
    await settings.save();
    return "Kênh đã phê duyệt đề xuất hiện đã bị vô hiệu hóa";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Tớ cần quyền ${parsePermissions(CHANNEL_PERMS)} trong kênh ${channel}`;
  }

  settings.suggestions.approved_channel = channel.id;
  await settings.save();
  return `Từ bây giờ, tin nhắn đề xuất đã được chấp nhận sẽ được gửi về ${channel}`;
}

async function setRejectedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.rejected_channel = null;
    await settings.save();
    return "Kênh đã từ chối đề xuất hiện đã bị vô hiệu hóa";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Tớ cần quyền ${parsePermissions(CHANNEL_PERMS)} trong kênh ${channel}`;
  }

  settings.suggestions.rejected_channel = channel.id;
  await settings.save();
  return `Từ bây giờ, tin nhắn đề xuất đã bị từ chối sẽ được gửi về  ${channel}`;
}

async function addStaffRole(settings, role) {
  if (settings.suggestions.staff_roles.includes(role.id)) {
    return `\`${role.name}\` đã là một vai trò nhân viên rồi`;
  }
  settings.suggestions.staff_roles.push(role.id);
  await settings.save();
  return `\`${role.name}\` giờ là vai trò nhân viên`;
}

async function removeStaffRole(settings, role) {
  if (!settings.suggestions.staff_roles.includes(role.id)) {
    return `${role} không phải là vai trò nhân viên`;
  }
  settings.suggestions.staff_roles.splice(settings.suggestions.staff_roles.indexOf(role.id), 1);
  await settings.save();
  return `\`${role.name}\` đã không còn là vai trò của nhân viên nữa`;
}
