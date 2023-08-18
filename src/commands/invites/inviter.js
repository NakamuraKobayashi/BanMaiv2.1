const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { stripIndent } = require("common-tags");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "inviter",
  description: "hiển thị thông tin người mời",
  category: "INVITE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "đối tượng muốn xem thông tin mời",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInviter(message, target.user, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await getInviter(interaction, user, data.settings);
    await interaction.followUp(response);
  },
};

async function getInviter({ guild }, user, settings) {
  if (!settings.invite.tracking) return `Invite Tracking bị vô hiệu hóa trong máy chủ này`;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;
  if (!inviteData || !inviteData.inviter) return `Không biết tại sao \`${user.username}\` lại có thể tham gia máy chủ`;

  const inviter = await guild.client.users.fetch(inviteData.inviter, false, true);
  const inviterData = (await getMember(guild.id, inviteData.inviter)).invite_data;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `Dữ liệu mời của ${user.username}` })
    .setDescription(
      stripIndent`
      Người mời: \`${inviter?.username || "Deleted User"}\`
      ID Người mời: \`${inviteData.inviter}\`
      Invite Code: \`${inviteData.code}\`
      Lời mời của người mời: \`${getEffectiveInvites(inviterData)}\`
      `
    );

  return { embeds: [embed] };
}
