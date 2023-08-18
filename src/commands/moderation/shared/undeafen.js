const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} đã được bật âm ở trong máy chủ này`;
  }
  if (response === "MEMBER_PERM") {
    return `Bạn không có quyền để bật âm người dùng ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Tớ không có quyền để bật âm người dùng ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} không ở trong kênh thoại nào cả`;
  }
  if (response === "NOT_DEAFENED") {
    return `${target.user.username} không bị tắt âm`;
  }
  return `Thất bại khi bật âm ${target.user.username}`;
};
