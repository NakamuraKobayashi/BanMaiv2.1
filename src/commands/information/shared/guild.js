const { EmbedBuilder, ChannelType, GuildVerificationLevel } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const moment = require("moment");

/**
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (guild) => {
  const { name, id, preferredLocale, channels, roles, ownerId } = guild;

  const owner = await guild.members.fetch(ownerId);

  const totalChannels = channels.cache.size;
  const categories = channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;
  const textChannels = channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
  const voiceChannels = channels.cache.filter(
    (c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice
  ).size;
  const threadChannels = channels.cache.filter(
    (c) => c.type === ChannelType.PrivateThread || c.type === ChannelType.PublicThread
  ).size;

  const memberCache = guild.members.cache;
  const all = memberCache.size;
  const bots = memberCache.filter((m) => m.user.bot).size;
  const users = all - bots;
  const onlineUsers = memberCache.filter((m) => !m.user.bot && m.presence?.status === "online").size;
  const onlineBots = memberCache.filter((m) => m.user.bot && m.presence?.status === "online").size;
  const onlineAll = onlineUsers + onlineBots;
  const rolesCount = roles.cache.size;

  const getMembersInRole = (members, role) => {
    return members.filter((m) => m.roles.cache.has(role.id)).size;
  };

  let rolesString = roles.cache
    .filter((r) => !r.name.includes("everyone"))
    .map((r) => `${r.name}[${getMembersInRole(memberCache, r)}]`)
    .join(", ");

  if (rolesString.length > 1024) rolesString = rolesString.substring(0, 1020) + "...";

  let { verificationLevel } = guild;
  switch (guild.verificationLevel) {
    case GuildVerificationLevel.VeryHigh:
      verificationLevel = "┻�?┻ミヽ(ಠ益ಠ)ノ彡┻�?┻";
      break;

    case GuildVerificationLevel.High:
      verificationLevel = "(╯°□°）╯︵ ┻�?┻";
      break;

    default:
      break;
  }

  let desc = "";
  desc = `${desc + "❯"} **ID:** ${id}\n`;
  desc = `${desc + "❯"} **Tên máy chủ:** ${name}\n`;
  desc = `${desc + "❯"} **Người sở hữu:** ${owner.user.username}\n`;
  desc = `${desc + "❯"} **Vùng máy chủ:** ${preferredLocale}\n`;
  desc += "\n";

  const embed = new EmbedBuilder()
    .setTitle("THÔNG TIN MÁY CHỦ")
    .setThumbnail(guild.iconURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addFields(
      {
        name: `Tổng thành viên [${all}]`,
        value: `\`\`\`Thành viên: ${users}\nBots: ${bots}\`\`\``,
        inline: true,
      },
      {
        name: `Đang online [${onlineAll}]`,
        value: `\`\`\`Thành viên: ${onlineUsers}\nBots: ${onlineBots}\`\`\``,
        inline: true,
      },
      {
        name: `Tổng số kênh và danh mục [${totalChannels}]`,
        value: `\`\`\`Danh mục: ${categories}\nVăn bản: ${textChannels}\nKênh thoại: ${voiceChannels}\nKênh chủ đề: ${threadChannels}\`\`\``,
        inline: false,
      },
      {
        name: `Vai trò`,
        value: `\`\`\`${rolesCount}\`\`\``, //rolesString
        inline: false,
      },
      {
        name: "Cấp độ xác thực",
        value: `\`\`\`${verificationLevel}\`\`\``,
        inline: true,
      },
      {
        name: "Nitro Boost",
        value: `\`\`\`${guild.premiumSubscriptionCount}\`\`\``,
        inline: true,
      },
      {
        name: `Ngày tạo`,
        value: `<t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
        inline: false,
      }
    );

  if (guild.splashURL()) embed.setImage(guild.splashURL({ extension: "png", size: 256 }));

  return { embeds: [embed] };
};
