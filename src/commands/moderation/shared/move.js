const { moveTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason, channel) => {
  const response = await moveTarget(member, target, reason, channel);
  if (typeof response === "boolean") {
    return `${target.user.username} đã được chuyển đến kênh: ${channel}`;
  }
  if (response === "MEMBER_PERM") {
    return `Bạn không có quyền để di chuyển người dùng ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Tớ không có quyền di chuyển người dùng ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} không ở trong kênh thoại nào cả`;
  }
  if (response === "TARGET_PERM") {
    return `${target.user.username} không có quyền để vào kênh ${channel}`;
  }
  if (response === "ALREADY_IN_CHANNEL") {
    return `${target.user.username} đang ở trong kênh ${channel} rồi`;
  }
  return `Thất bại khi di chuyển ${target.user.username} đến ${channel}`;
};
