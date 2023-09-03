import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Rcon } from "rcon-client";

import config from "../config.json" assert { type: "json" };

export const data = new SlashCommandBuilder()
	.setName("execute")
	.setDescription("Execute a command on the Minecraft server via RCON.")
	.addStringOption((option) =>
		option
			.setName("command")
			.setDescription("Enter the command to execute.")
			.setRequired(true)
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const command = interaction.options.getString("command")!;

	await interaction.deferReply();

	const rcon = await Rcon.connect({
		host: "localhost",
		port: config.rconPort,
		password: config.rconPassword,
	});

	const res = (await rcon.send(command)).replaceAll("/§[0-9a-f]/g", "");
	await rcon.end();
	await interaction.editReply(`\`\`\`\n${res}\n\`\`\``);
}
