import { Events, Message, TextChannel } from "discord.js";
import { Rcon } from "rcon-client";

import config from "../config.json" assert { type: "json" };

const messageUpdate = {
	name: Events.MessageUpdate,
	once: false,
	async execute(oldMessage: Message, newMessage: Message) {
		if (newMessage.author.bot) return;

		const channel = newMessage.channel as TextChannel;
		if (channel.id !== config.ignChannel) return;

		const oldIgn = oldMessage.content;
		const newIgn = newMessage.content;

		let rcon;
		try {
			rcon = await Rcon.connect({
				host: config.rconHost,
				port: config.rconPort,
				password: config.rconPassword,
			});
		} catch (error) {
			console.error(error);
			await newMessage.reply(
				"The server is not responding at the moment, please try again later."
			);
			return;
		}

		await rcon.send(`whitelist remove ${oldIgn}`);

		const res = (await rcon.send(`whitelist add ${newIgn}`)).replaceAll(
			/§[0-9a-z]/gi,
			""
		);
		await rcon.end();
		if (
			res.toLowerCase() ===
			`added ${newIgn.toLowerCase()} to the whitelist`
		) {
			await newMessage.reply("Your new account has been whitelisted!");
		} else {
			await newMessage.reply(
				"There was an error while whitelisting you. Either you are already whitelisted or your IGN is not correct. If you are on Bedrock, please try to join first and add a period to the start of your IGN."
			);
		}

		if (config.nicknameEdit) {
			try {
				await newMessage.member?.setNickname(newIgn);
			} catch (error) {
				console.error(error);
			}
		}
	},
};

export default messageUpdate;
