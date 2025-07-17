import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, type APIEmbedField, type RestOrArray } from "discord.js";
import Command from "../command";
import { fetchSeedsNGear } from "../gag";

export default class StatsCommand extends Command {
    public override data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName('gagstats')
            .setDescription('Shows current stats');
    }

    public override async execute(interaction: CommandInteraction): Promise<void> {
        const general = await fetchSeedsNGear();

        const seedEmbed = new EmbedBuilder()
            .setTitle("Seeds")
            .setTimestamp()
            .addFields(...general.seeds.map(data => { return { name: data.name, value: `x${data.quantity}` } }));

        const gearEmbed = new EmbedBuilder()
            .setTitle("Gear")
            .setTimestamp()
            .addFields(...general.gear.map(data => { return { name: data.name, value: `x${data.quantity}` } }));


        interaction.reply({
            embeds: [seedEmbed, gearEmbed],
        });
    }
}