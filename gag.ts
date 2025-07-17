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

type Cache = {
    seedsNGear?: SeedsNGear;
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

function formatForComparison(seedName: string) {
    return seedName.replaceAll(" ", "_").toLowerCase();
}

function onNewCache() {
    const marked = getAllMarked();
    const embedFields: { [userId: string]: any[] } = {};

    for (const [userId, seeds] of Object.entries(marked)) {
        embedFields[userId] = [];
        for (const seed of seeds) {
            const formattedSeed = formatForComparison(seed);
            if (cache.seedsNGear?.seeds.some(s => formatForComparison(s.name).includes(formattedSeed))) {
                embedFields[userId].push({
                    name: seed,
                    value: "is now available!"
                });
            }
        }
    }

    for (const [userId, fields] of Object.entries(embedFields)) {
        if (fields.length > 0) {
            const embed = new EmbedBuilder()
                .setTitle("Marked Seeds Available")
                .setDescription(`The following seeds you marked are now available!`)
                .addFields(fields)
                .setTimestamp();

            DMUserEmbed(userId, embed);
        }
    }
}

export function registerFetcher() {
    setInterval(async () => {
        try {
            const seedsNGear = await fetchSeedsNGear();
            cache.seedsNGear = seedsNGear;
        } catch (error) {
            console.error("Failed to fetch Seeds and Gear:", error);
        }

        const str = JSON.stringify(cache);
        const newHash = Bun.hash(str).toString();
        if (newHash !== cacheHash) {
            cacheHash = newHash;
            onNewCache();
        }
    }, 1000 * 10);
}