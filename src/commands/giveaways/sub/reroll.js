/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "Bạn phải cung cấp ID tin nhắn hợp lệ.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "Bạn cần có quyền quản lý tin nhắn để quản lý Giveaway.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `Không thể tìm thấy Giveaway ID: ${messageId}`;

  // Check if the giveaway is ended
  if (!giveaway.ended) return "Giveaway này vẫn chưa kết thúc.";

  try {
    await giveaway.reroll();
    return "Giveaway Được Quay Lại!";
  } catch (error) {
    member.client.logger.error("Giveaway Reroll", error);
    return `Đã xảy ra lỗi trong khi cố quay lại Giveaway: ${error.message}`;
  }
};
