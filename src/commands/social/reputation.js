const { getUser } = require("@schemas/User");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { diffHours, getRemainingTime } = require("@helpers/Utils");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rep",
  description: "mang lại danh tiếng cho người dùng",
  category: "SOCIAL",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["reputation"],
    subcommands: [
      {
        trigger: "view [user]",
        description: "xem điểm danh tiếng của người dùng",
      },
      {
        trigger: "give [user]",
        description: "tặng điểm danh tiếng cho người dùng",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "view",
        description: "xem điểm danh tiếng của người dùng",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "người dùng bạn muốn xem danh tiếng",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "give",
        description: "tặng điểm danh tiếng cho người dùng",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "người dùng bạn muốn tặng danh tiếng",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0];
    let response;

    // status
    if (sub === "view") {
      let target = message.author;
      if (args.length > 1) {
        const resolved = (await message.guild.resolveMember(args[1])) || message.member;
        if (resolved) target = resolved.user;
      }
      response = await viewReputation(target);
    }

    // give
    else if (sub === "give") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Vui lòng cung cấp người dùng hợp lệ để tặng điểm danh tiếng");
      response = await giveReputation(message.author, target.user);
    }

    //
    else {
      response = "Sử dụng lệnh không hợp lệ";
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub === "view") {
      const target = interaction.options.getUser("user") || interaction.user;
      response = await viewReputation(target);
    }

    // give
    if (sub === "give") {
      const target = interaction.options.getUser("user");
      response = await giveReputation(interaction.user, target);
    }

    await interaction.followUp(response);
  },
};

async function viewReputation(target) {
  const userData = await getUser(target);
  if (!userData) return `${target.username} chưa có điểm danh tiếng nào`;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Điểm danh tiếng của ${target.username}` })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      {
        name: "Nhận được",
        value: userData.reputation?.given.toString(),
        inline: true,
      },
      {
        name: "Tặng",
        value: userData.reputation?.received.toString(),
        inline: true,
      }
    );

  return { embeds: [embed] };
}

async function giveReputation(user, target) {
  if (target.bot) return "Bạn không thể tặng điểm danh tiếng cho bot";
  if (target.id === user.id) return "Bạn không thể tặng điểm danh tiếng cho chính bạn";

  const userData = await getUser(user);
  if (userData && userData.reputation.timestamp) {
    const lastRep = new Date(userData.reputation.timestamp);
    const diff = diffHours(new Date(), lastRep);
    if (diff < 24) {
      const nextUsage = lastRep.setHours(lastRep.getHours() + 24);
      return `Bạn có thể sử dụng lại lệnh này trong \`${getRemainingTime(nextUsage)}\``;
    }
  }

  const targetData = await getUser(target);

  userData.reputation.given += 1;
  userData.reputation.timestamp = new Date();
  targetData.reputation.received += 1;

  await userData.save();
  await targetData.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`${target.toString()} +1 Rep!`)
    .setFooter({ text: `Bởi ${user.username}` })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
}
