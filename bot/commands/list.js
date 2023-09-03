import { SlashCommandBuilder } from "discord.js";
import { Rcon } from "rcon-client";
import config from "../config.json" assert { type: "json" };
export const data = new SlashCommandBuilder()
    .setName("list")
    .setDescription("Get all online users currently on the Minecraft server.");
export async function execute(interaction) {
    await interaction.deferReply();
    const rcon = await Rcon.connect({
        host: "localhost",
        port: config.rconPort,
        password: config.rconPassword,
    });
    const res = (await rcon.send("list")).replaceAll(/§[0-9a-z]/gi, "");
    await rcon.end();
    await interaction.editReply(`\`\`\`\n${res}\n\`\`\``);
}
