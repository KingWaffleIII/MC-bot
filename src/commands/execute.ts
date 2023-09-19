import {
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
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
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
	const command = interaction.options.getString("command")!;

	await interaction.deferReply();

	if (interaction.channel!.id !== config.rceChannel) {
		await interaction.editReply(
			`This command cannot be used in this channel!`
		);
		return;
	}

	try {
		const rcon = await Rcon.connect({
			host: "localhost",
			port: config.rconPort,
			password: config.rconPassword,
		});

		const res = (await rcon.send(command)).replaceAll(/§[0-9a-z]/gi, "");
		await rcon.end();

		await interaction.editReply(`\`\`\`\n${res}\n\`\`\``);
	} catch {
		await interaction.editReply(
			"An error occurred while trying to connect to the server."
		);
	}
}
