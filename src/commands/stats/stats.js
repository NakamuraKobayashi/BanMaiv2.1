const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMemberStats } = require("@schemas/MemberStats");
const { EMBED_COLORS } = require("@root/config");
const { stripIndents } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "stats",
  description: "hiển thị số liệu thống kê thành viên trong máy chủ",
  cooldown: 5,
  category: "STATS",
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "đối tượng",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await stats(target, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const member = interaction.options.getMember("user") || interaction.member;
    const response = await stats(member, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {object} settings
 */
async function stats(member, settings) {
  if (!settings.stats.enabled) return "Stats Tracking bị vô hiệu hóa trong máy chủ này";
  const memberStats = await getMemberStats(member.guild.id, member.id);

  const embed = new EmbedBuilder()
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: "Username",
        value: member.user.username,
        inline: true,
      },
      {
        name: "ID",
        value: member.id,
        inline: true,
      },
      {
        name: "⌚ Là thành viên từ",
        value: `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`,
        inline: false,
      },
      {
        name: "💬 Số liệu tin nhắn",
        value: stripIndents`
      ❯ Tin nhắn đã gửi: ${memberStats.messages}
      ❯ Lệnh Prefix: ${memberStats.commands.prefix}
      ❯ Lệnh Slash: ${memberStats.commands.slash}
      ❯ XP đã nhận: ${memberStats.xp}
      ❯ Cấp độ hiện tại: ${memberStats.level}
    `,
        inline: false,
      },
      {
        name: "🎙️ Số liệu Voice Chat",
        value: stripIndents`
      ❯ Tổng số lần kết nối: ${memberStats.voice.connections}
      ❯ Thời gian đã kết nối: ${Math.floor(memberStats.voice.time / 60)} phút
    `,
      }
    )
    .setFooter({ text: "Bảng số liệu thống kê" })
    .setTimestamp();

  return { embeds: [embed] };
}
