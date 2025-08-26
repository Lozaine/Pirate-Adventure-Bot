const randomizer = require('../utils/randomizer.js');

const onePieceCharacters = [
    // Straw Hat Pirates
    {
        name: 'Monkey D. Luffy',
        affiliation: 'Straw Hat Pirates',
        location: 'Grand Line',
        minLevel: 1,
        rarity: 'mythical',
        quote: 'I\'m gonna be King of the Pirates!',
        bounty: 3000000000,
        role: 'Captain'
    },
    {
        name: 'Roronoa Zoro',
        affiliation: 'Straw Hat Pirates',
        location: 'East Blue',
        minLevel: 5,
        rarity: 'epic',
        quote: 'I\'m going to be the world\'s greatest swordsman!',
        bounty: 1110000000,
        role: 'Swordsman'
    },
    {
        name: 'Nami',
        affiliation: 'Straw Hat Pirates',
        location: 'East Blue',
        minLevel: 3,
        rarity: 'rare',
        quote: 'Money is everything to me!',
        bounty: 366000000,
        role: 'Navigator'
    },
    {
        name: 'Usopp',
        affiliation: 'Straw Hat Pirates',
        location: 'East Blue',
        minLevel: 2,
        rarity: 'uncommon',
        quote: 'I am the great captain Usopp!',
        bounty: 500000000,
        role: 'Sniper'
    },
    {
        name: 'Sanji',
        affiliation: 'Straw Hat Pirates',
        location: 'East Blue',
        minLevel: 8,
        rarity: 'epic',
        quote: 'I\'ll never kick a woman, even if it means my death!',
        bounty: 1032000000,
        role: 'Cook'
    },
    {
        name: 'Tony Tony Chopper',
        affiliation: 'Straw Hat Pirates',
        location: 'Grand Line',
        minLevel: 10,
        rarity: 'rare',
        quote: 'Even if I become a real monster, I don\'t care!',
        bounty: 1000,
        role: 'Doctor'
    },
    {
        name: 'Nico Robin',
        affiliation: 'Straw Hat Pirates',
        location: 'Grand Line',
        minLevel: 15,
        rarity: 'epic',
        quote: 'I want to live!',
        bounty: 930000000,
        role: 'Archaeologist'
    },
    {
        name: 'Franky',
        affiliation: 'Straw Hat Pirates',
        location: 'Grand Line',
        minLevel: 20,
        rarity: 'rare',
        quote: 'SUPER!',
        bounty: 394000000,
        role: 'Shipwright'
    },
    {
        name: 'Brook',
        affiliation: 'Straw Hat Pirates',
        location: 'Grand Line',
        minLevel: 25,
        rarity: 'epic',
        quote: 'Yohohoho! May I see your panties?',
        bounty: 383000000,
        role: 'Musician'
    },
    {
        name: 'Jinbe',
        affiliation: 'Straw Hat Pirates',
        location: 'New World',
        minLevel: 30,
        rarity: 'epic',
        quote: 'I am a man who wants to be part of the future Pirate King\'s crew!',
        bounty: 1100000000,
        role: 'Helmsman'
    },

    // Revolutionary Army
    {
        name: 'Monkey D. Dragon',
        affiliation: 'Revolutionary Army',
        location: 'Grand Line',
        minLevel: 50,
        rarity: 'mythical',
        quote: 'One day, I will change this world!',
        bounty: 0, // Unknown
        role: 'Supreme Commander'
    },
    {
        name: 'Sabo',
        affiliation: 'Revolutionary Army',
        location: 'Grand Line',
        minLevel: 35,
        rarity: 'epic',
        quote: 'I won\'t let anyone hurt my brothers!',
        bounty: 602000000,
        role: 'Chief of Staff'
    },

    // Marines
    {
        name: 'Monkey D. Garp',
        affiliation: 'Marines',
        location: 'Grand Line',
        minLevel: 40,
        rarity: 'mythical',
        quote: 'I\'m just a Vice Admiral who likes donuts!',
        bounty: 0,
        role: 'Vice Admiral'
    },
    {
        name: 'Sengoku',
        affiliation: 'Marines',
        location: 'Grand Line',
        minLevel: 45,
        rarity: 'mythical',
        quote: 'Justice will prevail!',
        bounty: 0,
        role: 'Former Fleet Admiral'
    },
    {
        name: 'Aokiji',
        affiliation: 'Former Marines',
        location: 'New World',
        minLevel: 60,
        rarity: 'mythical',
        quote: 'Lazy justice...',
        bounty: 0,
        role: 'Former Admiral'
    },
    {
        name: 'Akainu',
        affiliation: 'Marines',
        location: 'New World',
        minLevel: 65,
        rarity: 'mythical',
        quote: 'Absolute justice!',
        bounty: 0,
        role: 'Fleet Admiral'
    },
    {
        name: 'Kizaru',
        affiliation: 'Marines',
        location: 'New World',
        minLevel: 60,
        rarity: 'mythical',
        quote: 'Have you ever been kicked at light speed?',
        bounty: 0,
        role: 'Admiral'
    },

    // Shichibukai / Warlords
    {
        name: 'Dracule Mihawk',
        affiliation: 'Former Shichibukai',
        location: 'Grand Line',
        minLevel: 30,
        rarity: 'mythical',
        quote: 'I don\'t hunt rabbits with a cannon.',
        bounty: 3590000000,
        role: 'World\'s Strongest Swordsman'
    },
    {
        name: 'Boa Hancock',
        affiliation: 'Former Shichibukai',
        location: 'Grand Line',
        minLevel: 25,
        rarity: 'epic',
        quote: 'Love is a hurricane!',
        bounty: 1659000000,
        role: 'Pirate Empress'
    },
    {
        name: 'Jinbe',
        affiliation: 'Former Shichibukai',
        location: 'Grand Line',
        minLevel: 30,
        rarity: 'epic',
        quote: 'A man should keep his word!',
        bounty: 1100000000,
        role: 'Knight of the Sea'
    },

    // Yonko
    {
        name: 'Shanks',
        affiliation: 'Red Hair Pirates',
        location: 'New World',
        minLevel: 70,
        rarity: 'mythical',
        quote: 'This hat means a lot to me. Promise me you\'ll give it back when you become a great pirate.',
        bounty: 4048900000,
        role: 'Yonko'
    },
    {
        name: 'Charlotte Linlin',
        affiliation: 'Big Mom Pirates',
        location: 'New World',
        minLevel: 65,
        rarity: 'mythical',
        quote: 'Mama mama! Wedding cake!',
        bounty: 4388000000,
        role: 'Yonko'
    },
    {
        name: 'Kaido',
        affiliation: 'Beast Pirates',
        location: 'New World',
        minLevel: 70,
        rarity: 'mythical',
        quote: 'In a one-on-one fight, always bet on Kaido!',
        bounty: 4611100000,
        role: 'Yonko'
    },

    // East Blue Characters
    {
        name: 'Buggy',
        affiliation: 'Buggy Pirates',
        location: 'East Blue',
        minLevel: 1,
        rarity: 'uncommon',
        quote: 'I am the future Pirate King, Buggy!',
        bounty: 3189000000,
        role: 'Yonko'
    },
    {
        name: 'Captain Kuro',
        affiliation: 'Black Cat Pirates',
        location: 'East Blue',
        minLevel: 3,
        rarity: 'rare',
        quote: 'I\'ve planned everything perfectly.',
        bounty: 16000000,
        role: 'Captain'
    },
    {
        name: 'Don Krieg',
        affiliation: 'Krieg Pirates',
        location: 'East Blue',
        minLevel: 5,
        rarity: 'rare',
        quote: 'I am the strongest man in East Blue!',
        bounty: 17000000,
        role: 'Admiral'
    },
    {
        name: 'Arlong',
        affiliation: 'Arlong Pirates',
        location: 'East Blue',
        minLevel: 8,
        rarity: 'rare',
        quote: 'Fishmen are the superior race!',
        bounty: 20000000,
        role: 'Captain'
    },

    // Grand Line Characters
    {
        name: 'Crocodile',
        affiliation: 'Baroque Works',
        location: 'Grand Line',
        minLevel: 20,
        rarity: 'epic',
        quote: 'Dreams? Hah! Those are for fools!',
        bounty: 1965000000,
        role: 'Former Shichibukai'
    },
    {
        name: 'Enel',
        affiliation: 'Shandian God',
        location: 'Sky Island',
        minLevel: 30,
        rarity: 'epic',
        quote: 'I am God!',
        bounty: 500000000,
        role: 'False God'
    },
    {
        name: 'Rob Lucci',
        affiliation: 'CP9',
        location: 'Enies Lobby',
        minLevel: 35,
        rarity: 'epic',
        quote: 'Dark justice is still justice.',
        bounty: 0,
        role: 'CP0 Agent'
    },
    {
        name: 'Gecko Moria',
        affiliation: 'Thriller Bark Pirates',
        location: 'Thriller Bark',
        minLevel: 25,
        rarity: 'rare',
        quote: 'Others\' shadows will make me Pirate King!',
        bounty: 320000000,
        role: 'Former Shichibukai'
    },

    // Supporting Characters
    {
        name: 'Portgas D. Ace',
        affiliation: 'Whitebeard Pirates',
        location: 'Grand Line',
        minLevel: 40,
        rarity: 'mythical',
        quote: 'Thank you for loving me!',
        bounty: 550000000,
        role: '2nd Division Commander'
    },
    {
        name: 'Trafalgar Law',
        affiliation: 'Heart Pirates',
        location: 'New World',
        minLevel: 45,
        rarity: 'epic',
        quote: 'I don\'t like bread. I like rice balls.',
        bounty: 3000000000,
        role: 'Captain'
    },
    {
        name: 'Eustass Kid',
        affiliation: 'Kid Pirates',
        location: 'New World',
        minLevel: 45,
        rarity: 'epic',
        quote: 'I\'ll show them what real strength looks like!',
        bounty: 3000000000,
        role: 'Captain'
    }
];

class CharacterSystem {
    getAllCharacters() {
        return onePieceCharacters;
    }

    getRandomCharacterForLocation(location, userLevel) {
        const availableCharacters = onePieceCharacters.filter(character => {
            // Character must be appropriate for location and user level
            const locationMatch = character.location === location || 
                                 character.location === 'Grand Line' || 
                                 (location === 'New World' && character.minLevel <= userLevel);
            
            const levelMatch = character.minLevel <= userLevel + 10; // Can meet characters up to 10 levels higher
            
            return locationMatch && levelMatch;
        });

        if (availableCharacters.length === 0) {
            return this.getDefaultCharacter(location);
        }

        // Weight by rarity (rarer characters are less likely to appear)
        const weightedCharacters = [];
        availableCharacters.forEach(character => {
            let weight = 1;
            switch (character.rarity) {
                case 'common': weight = 10; break;
                case 'uncommon': weight = 6; break;
                case 'rare': weight = 3; break;
                case 'epic': weight = 1; break;
                case 'mythical': weight = 0.5; break;
            }
            
            // Add multiple copies based on weight
            for (let i = 0; i < weight * 10; i++) {
                weightedCharacters.push(character);
            }
        });

        return randomizer.getRandomElement(weightedCharacters);
    }

    getDefaultCharacter(location) {
        // Fallback characters for when no main characters are available
        const defaultCharacters = {
            'East Blue': {
                name: 'Local Pirate',
                affiliation: 'Independent',
                location: 'East Blue',
                minLevel: 1,
                rarity: 'common',
                quote: 'The Grand Line awaits!',
                bounty: 1000000,
                role: 'Rookie Pirate'
            },
            'Grand Line': {
                name: 'Veteran Pirate',
                affiliation: 'Independent',
                location: 'Grand Line',
                minLevel: 20,
                rarity: 'common',
                quote: 'I\'ve sailed these waters for years!',
                bounty: 50000000,
                role: 'Veteran'
            },
            'New World': {
                name: 'New World Survivor',
                affiliation: 'Independent',
                location: 'New World',
                minLevel: 50,
                rarity: 'common',
                quote: 'Only the strong survive in the New World!',
                bounty: 200000000,
                role: 'Survivor'
            }
        };

        return defaultCharacters[location] || defaultCharacters['East Blue'];
    }

    getCharactersByAffiliation(affiliation) {
        return onePieceCharacters.filter(character => 
            character.affiliation.toLowerCase().includes(affiliation.toLowerCase())
        );
    }

    getCharactersByLocation(location) {
        return onePieceCharacters.filter(character => character.location === location);
    }

    getCharactersByRarity(rarity) {
        return onePieceCharacters.filter(character => character.rarity === rarity);
    }

    getStrawHatPirates() {
        return this.getCharactersByAffiliation('Straw Hat Pirates');
    }

    getYonko() {
        return onePieceCharacters.filter(character => character.role === 'Yonko');
    }

    getAdmirals() {
        return onePieceCharacters.filter(character => 
            character.role.includes('Admiral') && character.affiliation === 'Marines'
        );
    }

    getShichibukai() {
        return onePieceCharacters.filter(character => 
            character.affiliation.includes('Shichibukai') || character.role.includes('Shichibukai')
        );
    }

    getRevolutionaries() {
        return this.getCharactersByAffiliation('Revolutionary Army');
    }

    searchCharacters(query) {
        const lowerQuery = query.toLowerCase();
        return onePieceCharacters.filter(character =>
            character.name.toLowerCase().includes(lowerQuery) ||
            character.affiliation.toLowerCase().includes(lowerQuery) ||
            character.role.toLowerCase().includes(lowerQuery) ||
            character.quote.toLowerCase().includes(lowerQuery)
        );
    }

    getCharacterByName(name) {
        return onePieceCharacters.find(character => 
            character.name.toLowerCase() === name.toLowerCase()
        );
    }

    getHighBountyCharacters(minBounty = 1000000000) {
        return onePieceCharacters
            .filter(character => character.bounty >= minBounty)
            .sort((a, b) => b.bounty - a.bounty);
    }

    getCharactersForLevel(level) {
        return onePieceCharacters.filter(character => 
            character.minLevel <= level && character.minLevel >= level - 20
        );
    }
}

// Create singleton instance
const characterSystem = new CharacterSystem();

module.exports = characterSystem;
