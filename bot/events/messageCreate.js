import { Events } from "discord.js";
import { Rcon } from "rcon-client";
import config from "../config.json" assert { type: "json" };
const messageCreate = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot)
            return;
        const channel = message.channel;
        if (channel.id !== config.ignChannel)
            return;
        const ign = message.content;
        let rcon;
        try {
            rcon = await Rcon.connect({
                host: config.rconHost,
                port: config.rconPort,
                password: config.rconPassword,
            });
        }
        catch (error) {
            console.error(error);
            await message.reply("The server is not responding at the moment, please try again later.");
            return;
        }
        const res = (await rcon.send(`whitelist add ${ign}`)).replaceAll(/§[0-9a-z]/gi, "");
        await rcon.end();
        if (res.toLowerCase() === `added ${ign.toLowerCase()} to the whitelist`) {
            await message.reply("You have been whitelisted!");
        }
        else {
            await message.reply("There was an error while whitelisting you. Either you are already whitelisted or your IGN is not correct. If you are on Bedrock, please try to join first and add a period to the start of your IGN.");
        }
        if (config.nicknameEdit) {
            try {
                await message.member?.setNickname(ign);
            }
            catch (error) {
                console.error(error);
            }
        }
    },
};
export default messageCreate;
