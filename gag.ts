// 

import { EmbedBuilder } from "discord.js";
import { DMUserEmbed } from ".";
import { getAllMarked } from "./marking";

type Item = {
  name: string;
  quantity: number;
};

type SeedsNGear = {
    seeds: Item[],
    gear: Item[]
}

type Eggs = Item[];

type Cache = {
    seedsNGear?: SeedsNGear;
    eggs?: Eggs;
}

export let cache: Cache = {};
export let cacheHash: string = "";

function parseItem(str: string): Item {
  const match = str.match(/^(.*)\s\*\*x(\d+)\*\*$/);
  if (!match) {
    return {
      name: str,
      quantity: 1,
    };
  }
  return {
    name: (match[1] ?? '').trim(),
    quantity: parseInt(match[2] ?? '1', 10),
  };
}

export async function fetchSeedsNGear(): Promise<SeedsNGear> {
    const url = `https://growagardenstock.com/api/stock?type=gear-seeds&ts=${Date.now()}`;

    const response = await fetch(url);
    const data = await response.json() as any;

    return {
        seeds: data.seeds.map(parseItem),
        gear: data.gear.map(parseItem)
    }
}

export async function fetchEggs(): Promise<Item[]> {
    const url = `https://growagardenstock.com/api/stock?type=egg&ts=${Date.now()}`;

    const response = await fetch(url);
    const data = await response.json() as any;

    // Deduplicate and merge eggs
    const eggMap = new Map<string, number>();
    
    for (const eggStr of data.egg) {
        const parsed = parseItem(eggStr);
        const existing = eggMap.get(parsed.name) || 0;
        eggMap.set(parsed.name, existing + parsed.quantity);
    }

    return Array.from(eggMap.entries()).map(([name, quantity]) => ({
        name,
        quantity
    }));
}

function formatForComparison(seedName: string) {
    return seedName.replaceAll(" ", "_").toLowerCase();
}

function onNewCache() {
    const marked = getAllMarked();
    const embedFields: { [userId: string]: { plants: any[], gear: any[], eggs: any[] } } = {};

    for (const [userId, items] of Object.entries(marked)) {
        embedFields[userId] = { plants: [], gear: [], eggs: [] };
        
        for (const item of items) {
            const formattedName = formatForComparison(item.name);
            
            if (item.type === 'plant') {
                // Check if this plant/seed is available
                if (cache.seedsNGear?.seeds.some(s => formatForComparison(s.name).includes(formattedName))) {
                    embedFields[userId].plants.push({
                        name: `🌱 ${item.name}`,
                        value: "is now available!",
                        inline: true
                    });
                }
            } else if (item.type === 'gear') {
                // Check if this gear is available
                if (cache.seedsNGear?.gear.some(g => formatForComparison(g.name).includes(formattedName))) {
                    embedFields[userId].gear.push({
                        name: `⚙️ ${item.name}`,
                        value: "is now available!",
                        inline: true
                    });
                }
            } else if (item.type === 'egg') {
                // Check if this egg is available
                if (cache.eggs?.some(e => formatForComparison(e.name).includes(formattedName))) {
                    embedFields[userId].eggs.push({
                        name: `🥚 ${item.name}`,
                        value: "is now available!",
                        inline: true
                    });
                }
            }
        }
    }

    for (const [userId, fields] of Object.entries(embedFields)) {
        const allFields = [...fields.plants, ...fields.gear, ...fields.eggs];
        
        if (allFields.length > 0) {
            let title = "Marked Items Available";
            let description = "The following items you marked are now available!";
            
            const typeCount = [
                fields.plants.length > 0 ? "🌱 **Plants**" : "",
                fields.gear.length > 0 ? "⚙️ **Gear**" : "",
                fields.eggs.length > 0 ? "🥚 **Eggs**" : ""
            ].filter(Boolean);
            
            if (typeCount.length > 1) {
                description += "\n\n" + typeCount.join(" • ");
            } else if (fields.plants.length > 0) {
                title = "Marked Plants Available";
                description = "The following plants you marked are now available! 🌱";
            } else if (fields.gear.length > 0) {
                title = "Marked Gear Available";
                description = "The following gear you marked is now available! ⚙️";
            } else if (fields.eggs.length > 0) {
                title = "Marked Eggs Available";
                description = "The following eggs you marked are now available! 🥚";
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .addFields(allFields)
                .setTimestamp();

            DMUserEmbed(userId, embed);
        }
    }
}

export function registerFetcher() {
    setInterval(async () => {
        try {
            const seedsNGear = await fetchSeedsNGear();
            const eggs = await fetchEggs();
            cache.seedsNGear = seedsNGear;
            cache.eggs = eggs;
        } catch (error) {
            console.error("Failed to fetch Seeds, Gear, and Eggs:", error);
        }

        const str = JSON.stringify(cache);
        const newHash = Bun.hash(str).toString();
        if (newHash !== cacheHash) {
            cacheHash = newHash;
            onNewCache();
        }
    }, 1000 * 10);
}