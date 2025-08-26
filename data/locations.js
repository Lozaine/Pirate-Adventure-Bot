const randomizer = require('../utils/randomizer.js');

const locations = [
    // East Blue Locations (Levels 1-15)
    {
        name: 'East Blue',
        description: 'The weakest of the four seas, known as the peaceful sea where many legendary pirates began their journey.',
        minLevel: 1,
        maxLevel: 15,
        dangerLevel: 'low',
        type: 'sea',
        region: 'East Blue'
    },
    {
        name: 'Foosha Village',
        description: 'A small peaceful village where Monkey D. Luffy grew up. The windmill and Partys Bar are local landmarks.',
        minLevel: 1,
        maxLevel: 5,
        dangerLevel: 'very_low',
        type: 'village',
        region: 'East Blue'
    },
    {
        name: 'Shells Town',
        description: 'A Marine base town where Captain Morgan once ruled with an iron fist.',
        minLevel: 2,
        maxLevel: 8,
        dangerLevel: 'low',
        type: 'town',
        region: 'East Blue'
    },
    {
        name: 'Orange Town',
        description: 'A town that was terrorized by Buggy the Clown and his crew.',
        minLevel: 3,
        maxLevel: 10,
        dangerLevel: 'moderate',
        type: 'town',
        region: 'East Blue'
    },
    {
        name: 'Syrup Village',
        description: 'Usopp\'s hometown, known for its peaceful atmosphere and the mansion on the hill.',
        minLevel: 3,
        maxLevel: 8,
        dangerLevel: 'low',
        type: 'village',
        region: 'East Blue'
    },
    {
        name: 'Baratie',
        description: 'A floating restaurant in the middle of the ocean, famous for its excellent cuisine.',
        minLevel: 5,
        maxLevel: 12,
        dangerLevel: 'moderate',
        type: 'restaurant',
        region: 'East Blue'
    },
    {
        name: 'Arlong Park',
        description: 'The former base of the Arlong Pirates, built as a monument to fishman superiority.',
        minLevel: 8,
        maxLevel: 15,
        dangerLevel: 'high',
        type: 'base',
        region: 'East Blue'
    },
    {
        name: 'Loguetown',
        description: 'The town of beginning and end, where Gold Roger was born and executed.',
        minLevel: 10,
        maxLevel: 15,
        dangerLevel: 'moderate',
        type: 'town',
        region: 'East Blue'
    },

    // Grand Line Paradise Locations (Levels 16-40)
    {
        name: 'Grand Line',
        description: 'The most dangerous sea in the world, where only the strongest pirates dare to sail.',
        minLevel: 15,
        maxLevel: 60,
        dangerLevel: 'high',
        type: 'sea',
        region: 'Grand Line'
    },
    {
        name: 'Reverse Mountain',
        description: 'The mountain where all four seas\' currents converge, the entrance to the Grand Line.',
        minLevel: 15,
        maxLevel: 20,
        dangerLevel: 'very_high',
        type: 'mountain',
        region: 'Grand Line'
    },
    {
        name: 'Whisky Peak',
        description: 'A town of bounty hunters disguised as a welcoming party island.',
        minLevel: 16,
        maxLevel: 25,
        dangerLevel: 'moderate',
        type: 'town',
        region: 'Grand Line'
    },
    {
        name: 'Little Garden',
        description: 'A prehistoric island inhabited by giants and ancient creatures.',
        minLevel: 18,
        maxLevel: 28,
        dangerLevel: 'high',
        type: 'prehistoric_island',
        region: 'Grand Line'
    },
    {
        name: 'Drum Island',
        description: 'A winter island known for its medical expertise and cherry blossoms.',
        minLevel: 20,
        maxLevel: 30,
        dangerLevel: 'moderate',
        type: 'winter_island',
        region: 'Grand Line'
    },
    {
        name: 'Alabasta',
        description: 'A desert kingdom caught in civil war, home to ancient mysteries.',
        minLevel: 22,
        maxLevel: 35,
        dangerLevel: 'high',
        type: 'kingdom',
        region: 'Grand Line'
    },
    {
        name: 'Rainbase',
        description: 'The gambling city in Alabasta, former base of Baroque Works.',
        minLevel: 25,
        maxLevel: 35,
        dangerLevel: 'very_high',
        type: 'city',
        region: 'Grand Line'
    },
    {
        name: 'Jaya',
        description: 'An island with a rich history of explorers and the legend of Noland.',
        minLevel: 28,
        maxLevel: 38,
        dangerLevel: 'moderate',
        type: 'island',
        region: 'Grand Line'
    },
    {
        name: 'Skypiea',
        description: 'A sky island 10,000 meters above the ocean, home to the Shandians and sky people.',
        minLevel: 30,
        maxLevel: 40,
        dangerLevel: 'high',
        type: 'sky_island',
        region: 'Grand Line'
    },
    {
        name: 'Long Ring Long Land',
        description: 'An island where everything is unnaturally long and stretched.',
        minLevel: 32,
        maxLevel: 38,
        dangerLevel: 'low',
        type: 'island',
        region: 'Grand Line'
    },
    {
        name: 'Water 7',
        description: 'A water metropolis famous for shipbuilding and the Galley-La Company.',
        minLevel: 35,
        maxLevel: 45,
        dangerLevel: 'moderate',
        type: 'city',
        region: 'Grand Line'
    },
    {
        name: 'Enies Lobby',
        description: 'The judicial island of the World Government, where justice never sleeps.',
        minLevel: 38,
        maxLevel: 50,
        dangerLevel: 'extreme',
        type: 'government_facility',
        region: 'Grand Line'
    },
    {
        name: 'Thriller Bark',
        description: 'A massive ship disguised as an island, ruled by Gecko Moria and filled with zombies.',
        minLevel: 40,
        maxLevel: 50,
        dangerLevel: 'very_high',
        type: 'ship_island',
        region: 'Grand Line'
    },
    {
        name: 'Sabaody Archipelago',
        description: 'The final island before the New World, known for its bubble-based ecosystem.',
        minLevel: 45,
        maxLevel: 55,
        dangerLevel: 'extreme',
        type: 'archipelago',
        region: 'Grand Line'
    },

    // New World Locations (Levels 50+)
    {
        name: 'New World',
        description: 'The second half of the Grand Line, where only the most powerful pirates survive.',
        minLevel: 50,
        maxLevel: 100,
        dangerLevel: 'extreme',
        type: 'sea',
        region: 'New World'
    },
    {
        name: 'Fishman Island',
        description: 'An underwater kingdom 10,000 meters below sea level.',
        minLevel: 50,
        maxLevel: 60,
        dangerLevel: 'high',
        type: 'underwater_kingdom',
        region: 'New World'
    },
    {
        name: 'Punk Hazard',
        description: 'A research island split between fire and ice, former government laboratory.',
        minLevel: 55,
        maxLevel: 70,
        dangerLevel: 'extreme',
        type: 'research_island',
        region: 'New World'
    },
    {
        name: 'Dressrosa',
        description: 'The kingdom of love, passion, and toys, ruled by the Donquixote Family.',
        minLevel: 60,
        maxLevel: 75,
        dangerLevel: 'extreme',
        type: 'kingdom',
        region: 'New World'
    },
    {
        name: 'Zou',
        description: 'A massive elephant carrying an ancient civilization on its back.',
        minLevel: 65,
        maxLevel: 80,
        dangerLevel: 'very_high',
        type: 'elephant_island',
        region: 'New World'
    },
    {
        name: 'Whole Cake Island',
        description: 'Big Mom\'s territory, a sweet paradise with deadly inhabitants.',
        minLevel: 70,
        maxLevel: 85,
        dangerLevel: 'extreme',
        type: 'yonko_territory',
        region: 'New World'
    },
    {
        name: 'Totto Land',
        description: 'Big Mom\'s vast territory consisting of 35 islands made of food.',
        minLevel: 70,
        maxLevel: 90,
        dangerLevel: 'extreme',
        type: 'archipelago',
        region: 'New World'
    },
    {
        name: 'Wano Country',
        description: 'A isolated country of samurai, ruled by the Beast Pirates.',
        minLevel: 75,
        maxLevel: 95,
        dangerLevel: 'extreme',
        type: 'samurai_country',
        region: 'New World'
    },
    {
        name: 'Onigashima',
        description: 'Kaido\'s fortress island shaped like a skull.',
        minLevel: 80,
        maxLevel: 100,
        dangerLevel: 'legendary',
        type: 'fortress',
        region: 'New World'
    },

    // Special/Hidden Locations
    {
        name: 'Raftel',
        description: 'The final island of the Grand Line, where the One Piece treasure awaits.',
        minLevel: 90,
        maxLevel: 100,
        dangerLevel: 'legendary',
        type: 'final_island',
        region: 'New World'
    },
    {
        name: 'Marineford',
        description: 'The headquarters of the Marines, site of the great war.',
        minLevel: 60,
        maxLevel: 90,
        dangerLevel: 'extreme',
        type: 'marine_hq',
        region: 'Grand Line'
    },
    {
        name: 'Impel Down',
        description: 'The great underwater prison where the world\'s most dangerous criminals are held.',
        minLevel: 55,
        maxLevel: 85,
        dangerLevel: 'extreme',
        type: 'prison',
        region: 'Grand Line'
    },
    {
        name: 'Mariejois',
        description: 'The holy land where the World Nobles reside, seat of world power.',
        minLevel: 80,
        maxLevel: 100,
        dangerLevel: 'legendary',
        type: 'holy_land',
        region: 'Red Line'
    }
];

class LocationSystem {
    getAllLocations() {
        return locations;
    }

    getLocationByName(name) {
        return locations.find(location => 
            location.name.toLowerCase() === name.toLowerCase()
        );
    }

    getLocationsByRegion(region) {
        return locations.filter(location => location.region === region);
    }

    getLocationsByType(type) {
        return locations.filter(location => location.type === type);
    }

    getLocationsByDangerLevel(dangerLevel) {
        return locations.filter(location => location.dangerLevel === dangerLevel);
    }

    getLocationsForLevel(level) {
        return locations.filter(location => 
            level >= location.minLevel && level <= location.maxLevel + 10
        );
    }

    getRandomLocationForLevel(userLevel) {
        const availableLocations = this.getLocationsForLevel(userLevel);
        
        if (availableLocations.length === 0) {
            // Fallback to current region based on level
            if (userLevel <= 15) {
                return this.getLocationByName('East Blue');
            } else if (userLevel <= 50) {
                return this.getLocationByName('Grand Line');
            } else {
                return this.getLocationByName('New World');
            }
        }

        // Weight locations by how appropriate they are for the user's level
        const weightedLocations = [];
        availableLocations.forEach(location => {
            let weight = 1;
            
            // Prefer locations closer to user's level
            const levelDiff = Math.abs(location.minLevel - userLevel);
            if (levelDiff <= 5) weight = 5;
            else if (levelDiff <= 10) weight = 3;
            else weight = 1;

            // Add danger level considerations
            if (location.dangerLevel === 'very_low' && userLevel > 10) weight *= 0.5;
            if (location.dangerLevel === 'extreme' && userLevel < location.minLevel + 5) weight *= 0.3;
            if (location.dangerLevel === 'legendary' && userLevel < location.minLevel + 10) weight *= 0.1;

            for (let i = 0; i < weight * 10; i++) {
                weightedLocations.push(location);
            }
        });

        return randomizer.getRandomElement(weightedLocations);
    }

    getNextRegionForLevel(level) {
        if (level <= 15) return 'East Blue';
        if (level <= 50) return 'Grand Line';
        return 'New World';
    }

    getRegionProgression() {
        return [
            { region: 'East Blue', minLevel: 1, maxLevel: 15, description: 'Where every pirate\'s journey begins' },
            { region: 'Grand Line', minLevel: 16, maxLevel: 50, description: 'The pirate\'s graveyard' },
            { region: 'New World', minLevel: 51, maxLevel: 100, description: 'Where only the strongest survive' }
        ];
    }

    getExplorationTargets(userLevel, currentLocation) {
        const currentLoc = this.getLocationByName(currentLocation);
        const availableLocations = this.getLocationsForLevel(userLevel);

        // Filter out current location and suggest new ones
        return availableLocations
            .filter(loc => loc.name !== currentLocation)
            .map(loc => ({
                ...loc,
                difficulty: this.calculateDifficulty(userLevel, loc),
                recommended: this.isRecommendedForLevel(userLevel, loc)
            }))
            .sort((a, b) => {
                // Sort by recommended first, then by difficulty
                if (a.recommended && !b.recommended) return -1;
                if (!a.recommended && b.recommended) return 1;
                return a.difficulty - b.difficulty;
            })
            .slice(0, 5); // Return top 5 suggestions
    }

    calculateDifficulty(userLevel, location) {
        const levelDiff = location.minLevel - userLevel;
        const dangerMultiplier = {
            'very_low': 0.5,
            'low': 1,
            'moderate': 1.5,
            'high': 2,
            'very_high': 3,
            'extreme': 4,
            'legendary': 5
        };

        return Math.max(0, levelDiff + (dangerMultiplier[location.dangerLevel] || 1));
    }

    isRecommendedForLevel(userLevel, location) {
        const difficulty = this.calculateDifficulty(userLevel, location);
        return difficulty >= -5 && difficulty <= 2; // Slightly below to slightly above current level
    }

    getLocationsByDifficultyRange(userLevel, minDiff = -3, maxDiff = 3) {
        return locations.filter(location => {
            const difficulty = this.calculateDifficulty(userLevel, location);
            return difficulty >= minDiff && difficulty <= maxDiff;
        });
    }

    getSpecialLocations() {
        return locations.filter(location => 
            ['final_island', 'holy_land', 'marine_hq', 'prison', 'yonko_territory'].includes(location.type)
        );
    }

    getIslandsByType() {
        const types = {};
        locations.forEach(location => {
            if (!types[location.type]) {
                types[location.type] = [];
            }
            types[location.type].push(location);
        });
        return types;
    }

    searchLocations(query) {
        const lowerQuery = query.toLowerCase();
        return locations.filter(location =>
            location.name.toLowerCase().includes(lowerQuery) ||
            location.description.toLowerCase().includes(lowerQuery) ||
            location.type.toLowerCase().includes(lowerQuery) ||
            location.region.toLowerCase().includes(lowerQuery)
        );
    }

    getLocationPath(fromLocation, toLocation) {
        const from = this.getLocationByName(fromLocation);
        const to = this.getLocationByName(toLocation);
        
        if (!from || !to) return null;

        // Simple path calculation based on region progression
        const regions = ['East Blue', 'Grand Line', 'New World'];
        const fromIndex = regions.indexOf(from.region);
        const toIndex = regions.indexOf(to.region);

        if (fromIndex === -1 || toIndex === -1) return null;

        const path = [];
        if (fromIndex < toIndex) {
            for (let i = fromIndex; i <= toIndex; i++) {
                path.push(regions[i]);
            }
        } else {
            for (let i = fromIndex; i >= toIndex; i--) {
                path.push(regions[i]);
            }
        }

        return path;
    }
}

// Create singleton instance
const locationSystem = new LocationSystem();

module.exports = locationSystem;
