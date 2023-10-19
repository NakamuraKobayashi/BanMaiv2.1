const { EmbedBuilder , ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "qr",
  aliases: ["qrcode", "qr-code"],
  cooldown: 5,
  category: "UTILITY",
  description: "Gửi lại ảnh QR cho text hoặc ảnh bạn gửi!",
  botPermissions: ["EmbedLinks", "AttachFiles"],
  command: {
    enabled: true,
    usage: "[URL]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "url",
        description: "Cung cấp đường link",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const Msg = args.join("+");
    const Embed = new EmbedBuilder()
    .setColor("Random")
    .setImage(encodeURI(`https://chart.googleapis.com/chart?chl=${Msg}&chs=200x200&cht=qr&chld=H%7C0`))
    .setTimestamp();
    message.delete()
    await message.safeReply({ embeds: [Embed] });
  },
  async interactionRun(interaction) {
    const type = interaction.options.getString("url");
    const Embeds = new EmbedBuilder()
    .setColor("Random")
    .setImage(encodeURI(`https://chart.googleapis.com/chart?chl=${type}&chs=200x200&cht=qr&chld=H%7C0`))
    .setTimestamp();
    await interaction.followUp({ embeds: [Embeds], ephemeral: true });
  },
};