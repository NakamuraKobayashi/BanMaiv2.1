const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (member) => {
  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "Bạn cần có quyền quản lý tin nhắn để quản lý Giveaway.";
  }

  // Search with all giveaways
  const giveaways = member.client.giveawaysManager.giveaways.filter(
    (g) => g.guildId === member.guild.id && g.ended === false
  );

  // No giveaways
  if (giveaways.length === 0) {
    return "Không có Giveaway nào đang chạy trong máy chủ này cả";
  }

  const description = giveaways.map((g, i) => `${i + 1}. ${g.prize} in <#${g.channelId}>`).join("\n");

  try {
    return { embeds: [{ description, color: EMBED_COLORS.GIVEAWAYS }] };
  } catch (error) {
    member.client.logger.error("Danh sách Giveaway", error);
    return `Đã có lỗi đã xảy ra khi liệt kê danh sách các Giveaway: ${error.message}`;
  }
};
