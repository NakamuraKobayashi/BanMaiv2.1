const { getEffectiveInvites, checkInviteRewards } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addinvites",
  description: "thêm lời mời tới thành viên",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<@member|id> <invites>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "người dùng để gửi lời mời đến",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "invites",
        description: "số lượng lời mời để cung cấp cho",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    const amount = parseInt(args[1]);

    if (!target) return message.safeReply("Sai cú pháp. Bạn phải đề cập đến một thành viên");
    if (isNaN(amount)) return message.safeReply("Số lượng lời mời phải là số");

    const response = await addInvites(message, target.user, parseInt(amount));
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("invites");
    const response = await addInvites(interaction, user, amount);
    await interaction.followUp(response);
  },
};

async function addInvites({ guild }, user, amount) {
  if (user.bot) return "Ầu! Bạn không thể thêm lời mời cho bot";

  const memberDb = await getMember(guild.id, user.id);
  memberDb.invite_data.added += amount;
  await memberDb.save();

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Đã thêm lời mời cho ${user.username}` })
    .setThumbnail(user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`${user.username} hiện có ${getEffectiveInvites(memberDb.invite_data)} lời mời`);

  checkInviteRewards(guild, memberDb, true);
  return { embeds: [embed] };
}
