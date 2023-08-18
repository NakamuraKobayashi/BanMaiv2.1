const { parseEmoji, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (emoji) => {
  let custom = parseEmoji(emoji);
  if (!custom.id) return "Đây không phải là biểu tượng cảm xúc server hợp lệ";

  let url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif?v=1" : "png"}`;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Thông tin Emoji" })
    .setDescription(
      `**Id:** ${custom.id}\n` + `**Tên:** ${custom.name}\n` + `**Động:** ${custom.animated ? "Có" : "Không"}`
    )
    .setImage(url);

  return { embeds: [embed] };
};
