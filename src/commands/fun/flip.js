const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "flip",
  description: "Lật đồng xu hoặc tin nhắn",
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "coin",
        description: "tung đồng xu ngửa hoặc sấp",
      },
      {
        trigger: "text <input>",
        description: "đảo ngược tin nhắn đã được cung cấp",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "coin",
        description: "lật đồng xu",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "text",
        description: "đảo ngược tin nhắn đã được cung cấp",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "input",
            description: "Đoạn văn bản để đảo ngược",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "coin") {
      const items = ["NGỬA", "SẤP"];
      const toss = items[Math.floor(Math.random() * items.length)];

      message.channel.send({ embeds: [firstEmbed(message.author)] }).then((coin) => {
        // 2nd embed
        setTimeout(() => {
          coin.edit({ embeds: [secondEmbed()] }).catch(() => {});
          // 3rd embed
          setTimeout(() => {
            coin.edit({ embeds: [resultEmbed(toss)] }).catch(() => {});
          }, 2000);
        }, 2000);
      });
    }

    //
    else if (sub === "text") {
      if (args.length < 2) return message.channel.send("Vui lòng nhập văn bản");
      const input = args.join(" ");
      const response = await flipText(input);
      await message.safeReply(response);
    }

    // else
    else await message.safeReply("Sử dụng lệnh không hợp lệ!");
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand("type");

    if (sub === "coin") {
      const items = ["NGỬA", "SẤP"];
      const toss = items[Math.floor(Math.random() * items.length)];
      await interaction.followUp({ embeds: [firstEmbed(interaction.user)] });

      setTimeout(() => {
        interaction.editReply({ embeds: [secondEmbed()] }).catch(() => {});
        setTimeout(() => {
          interaction.editReply({ embeds: [resultEmbed(toss)] }).catch(() => {});
        }, 2000);
      }, 2000);
    }

    //
    else if (sub === "text") {
      const input = interaction.options.getString("input");
      const response = await flipText(input);
      await interaction.followUp(response);
    }
  },
};

const firstEmbed = (user) =>
  new EmbedBuilder().setColor(EMBED_COLORS.TRANSPARENT).setDescription(`${user.username}, bắt đầu tung đồng xu`);

const secondEmbed = () => new EmbedBuilder().setDescription("Đồng xu ở bay trên trời");

const resultEmbed = (toss) =>
  new EmbedBuilder()
    .setDescription(`>> **MẶT ${toss} THẮNG** <<`)
    .setImage(toss === "NGỬA" ? "https://i.imgur.com/HavOS7J.png" : "https://i.imgur.com/u1pmQMV.png");

async function flipText(text) {
  let builder = "";
  for (let i = 0; i < text.length; i += 1) {
    const letter = text.charAt(i);
    const a = NORMAL.indexOf(letter);
    builder += a !== -1 ? FLIPPED.charAt(a) : letter;
  }
  return builder;
}
