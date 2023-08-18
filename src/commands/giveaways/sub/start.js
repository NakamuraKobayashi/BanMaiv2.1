const { ChannelType } = require("discord.js");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').GuildTextBasedChannel} giveawayChannel
 * @param {number} duration
 * @param {string} prize
 * @param {number} winners
 * @param {import('discord.js').User} [host]
 * @param {string[]} [allowedRoles]
 */
module.exports = async (member, giveawayChannel, duration, prize, winners, host, allowedRoles = []) => {
  try {
    if (!host) host = member.user;
    if (!member.permissions.has("ManageMessages")) {
      return "Bạn cần có quyền quản lý tin nhắn để bắt đầu Giveaway.";
    }

    if (!giveawayChannel.type === ChannelType.GuildText) {
      return "Bạn chỉ có thể bắt đầu Giveaway trong các kênh văn bản.";
    }

    /**
     * @type {import("discord-giveaways").GiveawayStartOptions}
     */
    const options = {
      duration: duration,
      prize,
      winnerCount: winners,
      hostedBy: host,
      thumbnail: "https://i.imgur.com/DJuTuxs.png",
      messages: {
        giveaway: "🎉 **GIVEAWAY** 🎉",
        giveawayEnded: "🎉 **GIVEAWAY ĐÃ KẾT THÚC** 🎉",
        inviteToParticipate: "React 🎁 để tham gia",
        dropMessage: "Hãy là người đầu tiên react với 🎁 để chiến thắng!",
        hostedBy: `\nNgười tổ chức: ${host.username}`,
      },
    };

    if (allowedRoles.length > 0) {
      options.exemptMembers = (member) => !member.roles.cache.find((role) => allowedRoles.includes(role.id));
    }

    await member.client.giveawaysManager.start(giveawayChannel, options);
    return `Đã bắt đầu Giveaway trong ${giveawayChannel}`;
  } catch (error) {
    member.client.logger.error("Giveaway Start", error);
    return `Đã xảy ra lỗi trong khi bắt đầu Giveaway: ${error.message}`;
  }
};
