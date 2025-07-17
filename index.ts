import { Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes } from "discord.js";
import type Command from "./command";
import TestCommand from "./commands/test";
import StatsCommand from "./commands/stats";
import { registerFetcher } from "./gag";
import MarkCommand from "./commands/mark";
import { load } from "./marking";

const TOKEN = Bun.env.DISCORD_TOKEN;

if(!TOKEN)
    throw new Error("DISCORD_TOKEN not found in ENV!")

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const commands = new Collection<String, Command>();

function register(command: Command) {
    const id = command.data().name;
    console.log(`Registering command: ${id}`)
    commands.set(id, command);
}

register(new StatsCommand());
register(new MarkCommand());

async function officialRegister() {
    const rest = new REST().setToken(TOKEN as string);

    try {
		console.log(`Started refreshing ${commands.keys.length} application (/) commands.`);

        const commandData = commands.map(command => command.data().toJSON());

		const data = await rest.put(
			Routes.applicationGuildCommands("1395493085827432700","1088915986264100996"),
			{ body: commandData },
		) as any;

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
}

export function DMUserEmbed(userId: string, embed: any) {
    client.users.fetch(userId).then(user => {
        user.send({ content: `<@${userId}>`, embeds: [embed] }).catch(error => {
            console.error(`Failed to send DM to user ${userId}:`, error);
        });
    }).catch(error => {
        console.error(`Failed to fetch user ${userId}:`, error);
    });
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if(!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }

    try {
        command.execute(interaction);
    } catch (error) {
        console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
    }
})

load();
officialRegister().catch(error => console.error("Failed to register commands:", error));
client.login(TOKEN);
registerFetcher();