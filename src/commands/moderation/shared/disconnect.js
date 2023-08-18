const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `${target.user.username} đã bị ngắt kết nối khỏi kênh thoại`;
  }
  if (response === "MEMBER_PERM") {
    return `Bạn không có quyền để ngắt kết nối ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `Tớ không có quyền để ngắt kết nối ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} không ở trong kênh thoại nào cả`;
  }
  return `Thất bại khi ngắt kết nối ${target.user.username}`;
};
