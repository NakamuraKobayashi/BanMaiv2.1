const Discord = require("discord.js");

module.exports = {
  name: "snipe",
  category: "UTILITY",
  description: "get deleted messages",
  botPermission: ["MANAGE_MESSAGES", "ATTACH_FILES"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const msg = message.client.snipes.get(message.channel.id);
    if (!msg)
      return message.channel
        .send(`Không có tin nhắn nào bị xóa ở đây`);

    const embed = new Discord.EmbedBuilder()
      .setTitle("Snipe")
      //.setAuthor(`${msg.authorAvatar}`, `${msg.author}`)
      .addField(
        `Người gửi: \`\`\`${msg.author}\`\`\``,
        `> **Nội dung:**\`\`\`${msg.content || msg.image}\`\`\``
      )
      .setFooter(`${message.author.username}`)
      .setTimestamp()
      .setColor("GREEN");
    if (msg.image) embed.setDescription(msg.name).setImage(msg.image);
    message.channel.send({ embeds: [embed], ephemeral: true });
  },

  async interactionRun(interaction, message, client) {
    const msg = message.client.snipes.get(message.channel.id);
    if (!msg)
      return interaction
        .followUp({ content: [`Không có tin nhắn nào bị xóa ở đây`], ephemeral: true });

    const embed = new Discord.EmbedBuilder()
      .setTitle("Snipe")
      //.setAuthor(`${msg.authorAvatar}`, `${msg.author}`)
      .addField(
        `Người gửi: \`\`\`${msg.author}\`\`\``,
        `> **Nội dung:**\`\`\`${msg.content || msg.image}\`\`\``
      )
      .setFooter(`${message.author.username}`)
      .setTimestamp()
      .setColor("GREEN");
    if (msg.image) embed.setDescription(msg.name).setImage(msg.image);
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  }
};
