const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

const animals = ["cat", "dog", "panda", "fox", "red_panda", "koala", "bird", "raccoon", "kangaroo"];
const BASE_URL = "https://some-random-api.com/animal";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "say",
  description: "nói gì đó",
  cooldown: 5,
  category: "FUN",
  botPermissions: ["SendMessages"],
  command: {
    enabled: true,
    usage: "<văn bản>",
    aliases: ["speak"],
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    message.delete();
    const usa = args.join(" ");
    let say = args.join(" ");
    return message.channel.send({ content: say, allowedMentions: { parse: [] }});;
  },
};

