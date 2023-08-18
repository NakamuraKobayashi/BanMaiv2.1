const botinvite = require("../shared/botinvite");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botinvite",
  description: "Link mời bot",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = botinvite(message.client);
    try {
      await message.author.send(response);
      return message.safeReply("Kiểm tra Hòm thư của cậu để biết thông tin về tớ! :envelope_with_arrow:");
    } catch (ex) {
      return message.safeReply("Tớ không thể gửi thông tin cho cậu! Hòm thư của cậu có đang mở không thế?");
    }
  },
};
