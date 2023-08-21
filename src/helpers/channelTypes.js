const { ChannelType } = require("discord.js");

/**
 * @param {number} type
 */
module.exports = (type) => {
  switch (type) {
    case ChannelType.GuildText:
      return "Kênh Văn Bản";
    case ChannelType.GuildVoice:
      return "Kênh Thoại";
    case ChannelType.GuildCategory:
      return "Danh Mục Kênh";
    case ChannelType.GuildAnnouncement:
      return "Kênh Thông Báo";
    case ChannelType.AnnouncementThread:
      return "Kênh Chủ Đề Thông Báo";
    case ChannelType.PublicThread:
      return "Kênh Chủ Đề Công Khai";
    case ChannelType.PrivateThread:
      return "Kênh Chủ Đề Riêng Tư";
    case ChannelType.GuildStageVoice:
      return "Kênh Sân Khấu";
    case ChannelType.GuildDirectory:
      return "Thư Mục";
    case ChannelType.GuildForum:
      return "Forum";
    default:
      return "Unknown";
  }
};
