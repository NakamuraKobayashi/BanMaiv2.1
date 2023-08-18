const { vUnmuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} đã được mở tiếng`;
  }
  if (response === "MEMBER_PERM") {
    return `Bạn không có quyền để mở tiếng cho ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Tớ không có quyền để mở tiếng cho ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} không ở trong kênh thoại nào cả`;
  }
  if (response === "NOT_MUTED") {
    return `${target.user.username} không bị tắt tiếng`;
  }
  return `Thất bại khi mở tiếng cho ${target.user.username}`;
};
