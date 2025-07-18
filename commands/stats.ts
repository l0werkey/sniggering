import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, type APIEmbedField, type RestOrArray } from "discord.js";
import Command from "../command";
import { fetchSeedsNGear, fetchEggs } from "../gag";

export default class StatsCommand extends Command {
    public override data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName('gagstats')
            .setDescription('Shows current stats');
    }

    public override async execute(interaction: CommandInteraction): Promise<void> {
        try {
            // Defer the reply immediately to prevent timeout
            await interaction.deferReply();

            const general = await fetchSeedsNGear();
            const eggs = await fetchEggs();

            const seedEmbed = new EmbedBuilder()
                .setTitle("🌱 Seeds")
                .setTimestamp()
                .addFields(...general.seeds.map(data => { return { name: data.name, value: `x${data.quantity}` } }));

            const gearEmbed = new EmbedBuilder()
                .setTitle("⚙️ Gear")
                .setTimestamp()
                .addFields(...general.gear.map(data => { return { name: data.name, value: `x${data.quantity}` } }));

            const eggEmbed = new EmbedBuilder()
                .setTitle("🥚 Eggs")
                .setTimestamp()
                .addFields(...eggs.map(data => { return { name: data.name, value: `x${data.quantity}` } }));

            await interaction.editReply({
                embeds: [seedEmbed, gearEmbed, eggEmbed],
            });
        } catch (error) {
            console.error('Error in stats command:', error);
            
            const errorMessage = "Sorry, there was an error fetching the stats. Please try again later.";
            
            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage });
            } else if (!interaction.replied) {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
}