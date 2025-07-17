import { CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder, type APIEmbedField, type RestOrArray } from "discord.js";
import Command from "../command";
import PLANTS from "../plants";

import { getMarkedForUser, toggleMark } from "../marking";

function capitalize(text: string): string {
  return text
    .split(' ')
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(' ');
}

export default class MarkCommand extends Command {
    public override data(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName('mark')
            .setDescription('Mark fent')
            .addStringOption(option => 
                option.setName("seed")
                .setDescription("the seed")
                .setRequired(true)
                .addChoices([{name: "List Current Selections", value: "list"}, ...PLANTS.map(plant => { return { name: capitalize(plant), value: plant } })])
            ) as any;
    }

    public override async execute(interaction: CommandInteraction): Promise<void> {
        const seed = (interaction as any).options.getString("seed");
        const user = interaction.user;

        let additions = "";

        if(seed === "list") {
            const marked = await getMarkedForUser(user.id);
            if(marked.length === 0) {
                await interaction.reply({ content: "You have not marked any seeds yet.", flags: MessageFlags.Ephemeral });
                return;
            }

            const fields: RestOrArray<APIEmbedField> = marked.map(mark => {
                return {
                    name: mark,
                    value: `sigmoida`,
                    inline: true
                };
            });

            const embed = new EmbedBuilder()
                .setTitle(`Marked Seeds for ${user.username}`)
                .setTimestamp()
                .addFields(fields);

            await interaction.reply({ embeds: [embed] });

            return;
        }

        if (seed === "burning bud") {
            additions = "https://tenor.com/view/diddy-blud-diddy-gif-16820390887287528746";
        } else if (seed === "mango") {
            additions = "https://tenor.com/view/blox-fruits-blue-lock-meme-tuff-mango-gif-18047942390642216707"
        } else {
            additions = "https://tenor.com/view/mango-mango-mark-sinister-mark-invincible-trollface-gif-14377825471605416360"
        }

        const marked = toggleMark(user.id, seed);

        // await interaction.reply({
        //     content: `Marked ${seed} for ${user.username}. ${additions}`,
        //     flags: MessageFlags.Ephemeral
        // });
        if (marked) {
            await interaction.reply({
                content: `# **Marked** ${seed} for ${user.username}.\n${additions}`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: `# **Unmarked** ${seed} for ${user.username}.\n${additions}`,
                flags: MessageFlags.Ephemeral
            });
        }
    }
}