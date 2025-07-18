import { CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder, type APIEmbedField, type RestOrArray } from "discord.js";
import Command from "../command";
import PLANTS from "../plants";
import GEAR from "../gear";
import EGGS from "../eggs";

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
        const plantChoices = PLANTS.map(plant => ({ 
            name: `🌱 ${capitalize(plant)}`, 
            value: `plant:${plant}` 
        }));
        
        const gearChoices = GEAR.map(gear => ({ 
            name: `⚙️ ${capitalize(gear)}`, 
            value: `gear:${gear}` 
        }));

        const eggChoices = EGGS.map(egg => ({ 
            name: `🥚 ${capitalize(egg)}`, 
            value: `egg:${egg}` 
        }));

        return new SlashCommandBuilder()
            .setName('mark')
            .setDescription('Mark plants, gear, or eggs for notifications')
            .addStringOption(option => 
                option.setName("item")
                .setDescription("the plant, gear, or egg item")
                .setRequired(true)
                .addChoices([
                    {name: "📋 List Current Selections", value: "list"}, 
                    ...plantChoices,
                    ...gearChoices,
                    ...eggChoices
                ])
            ) as any;
    }

    public override async execute(interaction: CommandInteraction): Promise<void> {
        const item = (interaction as any).options.getString("item");
        const user = interaction.user;

        let additions = "";

        if(item === "list") {
            const marked = getMarkedForUser(user.id);
            if(marked.length === 0) {
                await interaction.reply({ content: "You have not marked any items yet.", flags: MessageFlags.Ephemeral });
                return;
            }

            const fields: RestOrArray<APIEmbedField> = marked.map(mark => {
                const typeEmoji = mark.type === 'plant' ? '🌱' : mark.type === 'gear' ? '⚙️' : '🥚';
                const typeName = mark.type === 'plant' ? 'Plant' : mark.type === 'gear' ? 'Gear' : 'Egg';
                return {
                    name: `${typeEmoji} ${capitalize(mark.name)}`,
                    value: `${typeName}`,
                    inline: true
                };
            });

            const embed = new EmbedBuilder()
                .setTitle(`Marked Items for ${user.username}`)
                .setDescription(`🌱 Plants • ⚙️ Gear • 🥚 Eggs`)
                .setTimestamp()
                .addFields(fields);

            await interaction.reply({ embeds: [embed] });
            return;
        }

        // Parse the item selection
        const [itemType, itemName] = item.split(':') as ['plant' | 'gear' | 'egg', string];
        
        if (!itemType || !itemName) {
            await interaction.reply({ content: "Invalid item selection!", flags: MessageFlags.Ephemeral });
            return;
        }

        if (itemName === "burning bud") {
            additions = "https://tenor.com/view/diddy-blud-diddy-gif-16820390887287528746";
        } else if (itemName === "mango") {
            additions = "https://tenor.com/view/blox-fruits-blue-lock-meme-tuff-mango-gif-18047942390642216707"
        } else {
            additions = "https://tenor.com/view/mango-mango-mark-sinister-mark-invincible-trollface-gif-14377825471605416360"
        }

        const marked = toggleMark(user.id, itemName, itemType);
        const typeEmoji = itemType === 'plant' ? '🌱' : itemType === 'gear' ? '⚙️' : '🥚';
        const typeName = itemType === 'plant' ? 'Plant' : itemType === 'gear' ? 'Gear' : 'Egg';

        if (marked) {
            await interaction.reply({
                content: `# **Marked** ${typeEmoji} ${itemName} (${typeName}) for ${user.username}.\n${additions}`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: `# **Unmarked** ${typeEmoji} ${itemName} (${typeName}) for ${user.username}.\n${additions}`,
                flags: MessageFlags.Ephemeral
            });
        }
    }
}