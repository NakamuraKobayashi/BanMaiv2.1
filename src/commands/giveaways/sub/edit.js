/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 * @param {number} addDuration
 * @param {string} newPrize
 * @param {number} newWinnerCount
 */
module.exports = async (member, messageId, addDuration, newPrize, newWinnerCount) => {
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

  try {
    await member.client.giveawaysManager.edit(messageId, {
      addTime: addDuration || 0,
      newPrize: newPrize || giveaway.prize,
      newWinnerCount: newWinnerCount || giveaway.winnerCount,
    });

    return `Đã cập nhật thành công Giveaway!`;
  } catch (error) {
    member.client.logger.error("Chỉnh sửa Giveaway", error);
    return `Đã xảy ra lỗi khi cập nhật Giveaway: ${error.message}`;
  }
};
