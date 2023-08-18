const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} đã bị tắt tiếng`;
  }
  if (response === "MEMBER_PERM") {
    return `Bạn không có quyền để tắt tiếng ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Tớ không có quyền để tắt tiếng ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} không ở trong kênh thoại nào cả`;
  }
  if (response === "ALREADY_MUTED") {
    return `${target.user.username} đã bị tắt tiếng rồi`;
  }
  return `Thất bại khi tắt tiếng ${target.user.username}`;
};
