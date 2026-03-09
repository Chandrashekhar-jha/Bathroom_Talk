const adjectives = [
    'Silent', 'Hidden', 'Velvet', 'Mystic', 'Shadow', 'Cosmic', 'Golden', 'Silver',
    'Crystal', 'Neon', 'Phantom', 'Ghost', 'Lunar', 'Solar', 'Arctic', 'Thunder',
    'Blazing', 'Frozen', 'Electric', 'Quantum', 'Turbo', 'Neo', 'Hyper', 'Ultra',
    'Dark', 'Bright', 'Swift', 'Scarlet', 'Crimson', 'Azure', 'Jade', 'Ember',
    'Storm', 'Night', 'Dawn', 'Dusk', 'Iron', 'Steel', 'Glass', 'Mirror',
    'Atomic', 'Sonic', 'Plasma', 'Volt', 'Nova', 'Astral', 'Void', 'Echo',
];

const animals = [
    'Tiger', 'Fox', 'Wolf', 'Hawk', 'Bear', 'Lion', 'Eagle', 'Panda',
    'Serpent', 'Dragon', 'Raven', 'Owl', 'Falcon', 'Lynx', 'Jaguar', 'Panther',
    'Cobra', 'Viper', 'Shark', 'Whale', 'Dolphin', 'Osprey', 'Manta', 'Kraken',
    'Phoenix', 'Griffin', 'Sphinx', 'Chimera', 'Hydra', 'Pegasus', 'Unicorn', 'Basilisk',
    'Mantis', 'Hornet', 'Wasp', 'Scorpion', 'Tarantula', 'Dingo', 'Coyote', 'Hyena',
    'Cheetah', 'Leopard', 'Cougar', 'Bison', 'Moose', 'Elk', 'Ram', 'Boar',
];

export function generateAnonymousName(): string {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adj}${animal}`;
}

export function generateUniqueNameForGroup(existingNames: string[]): string {
    let name = generateAnonymousName();
    let attempts = 0;
    while (existingNames.includes(name) && attempts < 100) {
        name = generateAnonymousName();
        attempts++;
    }
    // If all names taken (very unlikely), add a number suffix
    if (existingNames.includes(name)) {
        name = `${name}${Math.floor(Math.random() * 999)}`;
    }
    return name;
}
