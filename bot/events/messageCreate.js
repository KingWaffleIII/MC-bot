import { Events } from "discord.js";
import { Rcon } from "rcon-client";
import config from "../config.json" assert { type: "json" };
const messageCreate = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot)
            return;
        // const ignChannel = "1080471944085909534";
        const ignChannel = "1147848746948886630";
        const channel = message.channel;
        if (channel.id !== ignChannel)
            return;
        const ign = message.content;
        const rcon = await Rcon.connect({
            host: "localhost",
            port: config.rconPort,
            password: config.rconPassword,
        });
        const res = (await rcon.send(`whitelist add ${ign}`)).replaceAll(/§[0-9a-z]/gi, "");
        await rcon.end();
        if (res.toLowerCase() === `added ${ign.toLowerCase()} to the whitelist`) {
            await message.reply("You have been whitelisted!");
        }
        else {
            await message.reply("There was an error while whitelisting you. Either you are already whitelisted or your IGN is not correct. If you are on Bedrock, please try to join first and add a period to the start of your IGN.");
        }
    },
};
export default messageCreate;
