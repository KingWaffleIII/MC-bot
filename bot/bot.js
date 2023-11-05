import { CronJob } from "cron";
import { ActivityType, Client, Collection, Events, GatewayIntentBits, REST, Routes, ThreadChannel, } from "discord.js";
import fs from "fs";
import path, { dirname } from "path";
import { Rcon } from "rcon-client";
import { fileURLToPath } from "url";
import config from "./config.json" assert { type: "json" };
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    presence: {
        status: "online",
        activities: [
            {
                name: "Minecraft",
                type: ActivityType.Playing,
            },
        ],
    },
});
const commands = new Collection();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    if ("data" in command && "execute" in command) {
        commands.set(command.data.name, command);
    }
    else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = (await import(filePath)).default;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.on(Events.ClientReady, async (bot) => {
    console.log(`Bot is ready, logged in as ${bot.user.tag}!`);
});
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.guild === null ||
        interaction.channel instanceof ThreadChannel) {
        await interaction.reply({
            content: "This command is not available. Please use it in a normal server channel instead.",
            ephemeral: true,
        });
        return;
    }
    const command = commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
});
const { clientId, token } = config;
const rest = new REST({ version: "10" }).setToken(token);
try {
    const commandsList = commands.map((command) => command.data.toJSON());
    await rest.put(Routes.applicationCommands(clientId), {
        body: commandsList,
    });
    console.log(`Successfully reloaded ${commandsList.length} application (/) command(s).`);
}
catch (error) {
    console.error(error);
}
await client.login(token);
const { rconHost, rconPort, rconPassword, playerCountChannel } = config;
const job = new CronJob("0 */5 * * * *", async () => {
    if (playerCountChannel === "")
        return;
    const channel = (await client.channels.fetch(playerCountChannel));
    try {
        const rcon = await Rcon.connect({
            host: rconHost,
            port: rconPort,
            password: rconPassword,
        });
        const res = (await rcon.send("list")).replaceAll(/§[0-9a-z]/gi, "");
        await rcon.end();
        if (res[11] === " ") {
            await channel.setName(`Online: ${res[10]}`);
        }
        else {
            await channel.setName(`Online: ${res[10]}${res[11]}`);
        }
    }
    catch {
        await channel.setName("Online: 0");
    }
});
job.start();
