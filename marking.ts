import PLANTS from "./plants";
import GEAR from "./gear";
import EGGS from "./eggs";

type MarkingItem = {
  name: string;
  type: 'plant' | 'gear' | 'egg';
};

type Markings = {
  [key: string]: MarkingItem[];
};

let markings: Markings = {};

export function getMarkedForUser(id: string): MarkingItem[] {
    if(!markings[id]) {
        markings[id] = [];
        save();
    }
    return markings[id];
}

export function toggleMark(id: string, itemName: string, type: 'plant' | 'gear' | 'egg'): boolean {
    const userMarks = getMarkedForUser(id);
    const existingIndex = userMarks.findIndex(item => item.name === itemName && item.type === type);
    
    if (existingIndex !== -1) {
        // Remove if already marked
        markings[id] = userMarks.filter((_, index) => index !== existingIndex);
        save();
        return false; // unmarked
    } else {
        // Add if not marked
        userMarks.push({ name: itemName, type });
        save();
        return true; // marked
    }
}

export function getAllMarked(): Markings {
    return markings;
}

// Migration function for backward compatibility
function migrateOldFormat(oldMarkings: any): Markings {
    const newMarkings: Markings = {};
    
    for (const [userId, items] of Object.entries(oldMarkings)) {
        if (Array.isArray(items) && items.length > 0 && typeof items[0] === 'string') {
            // Old format - detect type based on item lists
            newMarkings[userId] = (items as string[]).map(name => {
                let type: 'plant' | 'gear' | 'egg';
                
                if (PLANTS.includes(name)) {
                    type = 'plant';
                } else if (GEAR.includes(name)) {
                    type = 'gear';
                } else if (EGGS.includes(name)) {
                    type = 'egg';
                } else {
                    // Default to plant for unknown items (backward compatibility)
                    type = 'plant';
                    console.warn(`Unknown item type for "${name}", defaulting to plant`);
                }
                
                return { name, type };
            });
        } else {
            // New format or empty
            newMarkings[userId] = items as MarkingItem[];
        }
    }
    
    return newMarkings;
}

async function save() {
    const json = JSON.stringify(markings);
    await Bun.write("./data.json", json);
}

export async function load() {
    if (await Bun.file('./data.json').exists()) {
        const data = await Bun.file('./data.json').json();
        markings = migrateOldFormat(data);
        // Save migrated data
        await save();
    } else {
        markings = {};
        await save();
    }
}