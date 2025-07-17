type Markings = {
  [key: string]: string[];
};

let markings: Markings = {};

export function getMarkedForUser(id: string) {
    if(!markings[id]) {
        markings[id] = [];
        save();
    }
    return markings[id];
}

export function toggleMark(id: string, seed: string): boolean {
    const userMarks = getMarkedForUser(id);
    const isMarked = userMarks.includes(seed);
    if (isMarked) {
        markings[id] = userMarks.filter(s => s !== seed);
    } else {
        userMarks.push(seed);
    }
    save();
    return !isMarked;
}

export function getAllMarked(): Markings {
    return markings;
}

async function save() {
    const json = JSON.stringify(markings);
    await Bun.write("./data.json", json);
}

export async function load() {
    if (await Bun.file('./data.json').exists()) {
        markings = await Bun.file('./data.json').json();
    } else {
        markings = {};
        await save();
    }
}