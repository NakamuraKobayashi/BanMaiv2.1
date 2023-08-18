const { deafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await deafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} đã bị tắt âm trong máy chủ này`;
  }
  if (response === "MEMBER_PERM") {
    return `Bạn không có quyền để tắt âm người dùng ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Tớ không có quyền để tắt âm người dùng ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} không ở trong kênh thoại nào cả`;
  }
  if (response === "ALREADY_DEAFENED") {
    return `${target.user.username} đã bị tắt âm từ trước rồi`;
  }
  return `Lỗi khi tắt âm người dùng ${target.user.username}`;
};
