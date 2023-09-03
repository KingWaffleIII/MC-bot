import { Events } from "discord.js";
import { Rcon } from "rcon-client";
import config from "../config.json" assert { type: "json" };
const messageCreate = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot)
            return;
        const ignChannel = "1080471944085909534";
        const channel = message.channel;
        if (channel.id !== ignChannel)
            return;
        const ign = message.content;
        const rcon = await Rcon.connect({
            host: "localhost",
            port: config.rconPort,
            password: config.rconPassword,
        });
        const res = await rcon.send(`whitelist add ${ign}`);
        await rcon.end();
        if (res === "Player is already whitelisted") {
            await message.reply("You are already whitelisted!");
            return;
        }
        await message.reply("You have been whitelisted!");
    },
};
export default messageCreate;
