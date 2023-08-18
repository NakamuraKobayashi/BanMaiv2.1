const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purge",
  description: "xóa số lượng tin nhắn được chỉ định",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<amount>",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const amount = args[0];

    if (isNaN(amount)) return message.safeReply("Chỉ được phép số");
    if (parseInt(amount) > 100) return message.safeReply("Số lượng tin nhắn tối đa mà tớ có thể xóa là 100");

    const { channel } = message;
    const response = await purgeMessages(message.member, channel, "ALL", amount);

    if (typeof response === "number") {
      return channel.safeSend(`Đã xóa ${response} tin nhắn`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("Tớ không có quyền `Đọc lịch sử tin nhắn` & `Quản lý tin nhắn` để xóa", 5);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("Cậu không có quyền `Đọc lịch sử tin nhắn` & `Quản lý tin nhắn` để xóa tin nhắn", 5);
    } else if (response === "NO_MESSAGES") {
      return channel.safeSend("Không tìm thấy tin nhắn để xóa", 5);
    } else {
      return message.safeReply(`Đã xảy ra lỗi! Xóa tin nhắn thất bại`);
    }
  },
};
