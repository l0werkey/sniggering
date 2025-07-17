import type { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default class Command {
    public data(): SlashCommandBuilder {
        throw new Error("Unimplemented...");
    }

    public async execute(interaction: CommandInteraction) {
        throw new Error("Unimplemented...");
    }
}