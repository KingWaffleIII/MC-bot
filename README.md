# MC-bot

A Discord bot to interact with Minecraft servers using RCON.

**RCON must be enabled on the MC server in `server.properties`!**

Players can use `/list` to view all online players.
Admins can use `/execute <command>` to execute a command on the server.
The bot will periodically update a channel with the player count. It can also handle whitelisting in a channel.

## Setup

The bot must be on the same machine as the MC server.

Create `src/config.json` like so:

```json
{
	"token": "<DISCORD BOT TOKEN HERE>",
	"clientId": "<DISCORD BOT ID HERE>",
	"rconHost": "<IP ADDRESS HERE>",
 	"rconPort": <RCON PORT HERE>,
    "rconPassword": "<RCON PASSWORD HERE>",
    "playerCountChannel": "<DISCORD CHANNEL ID HERE>",
	"ignChannel": "<DISCORD CHANNEL ID HERE>",
	"rceChannel": "<DISCORD CHANNEL ID HERE>",
	"nicknameEdit": false,  // requires "Manage Nicknames" permission
}

```

To disable any of these features, set the value to `""` or.

Then run the bot with Docker Compose.

Note: if you are running multiple instances of the bot on the same host, make sure to change the container name in `docker-compose.yml` to avoid conflicts.
