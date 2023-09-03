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

	// const { client } = interaction;
	// if (interaction.user.id !== client.application.owner!.id) {
	// 	await interaction.editReply("You are not permitted to use this!");
	// 	return;
	// }
	const rceChannel = "1147848880768159814";
	if (interaction.channel!.id !== rceChannel) {
		await interaction.editReply(
			`This command cannot be used in this channel!`
		);
		return;
	}

	const rcon = await Rcon.connect({
		host: "localhost",
		port: config.rconPort,
		password: config.rconPassword,
	});

	const res = (await rcon.send(command)).replaceAll(/§[0-9a-z]/gi, "");
	await rcon.end();
	await interaction.editReply(`\`\`\`\n${res}\n\`\`\``);
}
