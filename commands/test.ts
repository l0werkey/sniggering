import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "../command";

export default class TestCommand extends Command {
    public override data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName('test')
            .setDescription('test');
    }

    public override async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply("sigma!!!!");
    }
}