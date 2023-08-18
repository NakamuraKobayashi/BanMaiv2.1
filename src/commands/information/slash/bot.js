const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { timeformat } = require("@helpers/Utils");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config.js");
const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bot",
  description: "các lệnh liên quan đến bot",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "invite",
        description: "mời tớ :3",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "stats",
        description: "xem thông số của bot",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "uptime",
        description: "xem thời gian bot hoạt động",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("Không phải là một lệnh phụ hợp lệ");

    // Invite
    if (sub === "invite") {
      const response = botInvite(interaction.client);
      try {
        await interaction.user.send(response);
        return interaction.followUp("Kiểm tra hòm thư của cậu nha! :envelope_with_arrow:");
      } catch (ex) {
        return interaction.followUp("Tớ không gửi thư cho cậu được! Hòm thư của cậu có đang mở hong zọ?");
      }
    }

    // Stats
    else if (sub === "stats") {
      const response = botstats(interaction.client);
      return interaction.followUp(response);
    }

    // Uptime
    else if (sub === "uptime") {
      await interaction.followUp(`Thời gian hoạt động: \`${timeformat(process.uptime())}\``);
    }
  },
};

function botInvite(client) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Lời mời" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("Chào đằng đó nha! Cảm ơn vì đã cân nhắc đến chuyện mời tớ :3\nSử dụng nút bên dưới để điều hướng đến nơi cậu muốn");

  // Buttons
  let components = [];
  components.push(new ButtonBuilder().setLabel("Mới Tớ").setURL(client.getInvite()).setStyle(ButtonStyle.Link));

  if (SUPPORT_SERVER) {
    components.push(new ButtonBuilder().setLabel("Máy Chủ Hỗ Trợ").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder().setLabel("Dashboard").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
}
