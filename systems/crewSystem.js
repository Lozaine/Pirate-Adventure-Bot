const database = require('../database/database.js');
const randomizer = require('../utils/randomizer.js');

class CrewSystem {
    constructor() {
        this.pendingInvitations = new Map(); // crewId -> [userIds]
    }

    createCrew(name, captainId, captainData) {
        // Generate unique crew ID
        const crewId = `crew_${Date.now()}_${randomizer.getRandomInt(1000, 9999)}`;

        const newCrew = {
            id: crewId,
            name: name,
            captain: captainId,
            members: [captainId],
            level: 1,
            reputation: 0,
            bounty: 0,
            treasury: 0,
            ships: ['Going Merry'], // Default starting ship
            territories: [],
            victories: 0,
            treasuresFound: 0,
            locationsDiscovered: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        database.data.crews.set(crewId, newCrew);

        return {
            success: true,
            crew: newCrew
        };
    }

    findCrewByName(name) {
        const crews = Array.from(database.data.crews.values());
        return crews.find(crew => crew.name.toLowerCase() === name.toLowerCase());
    }

    inviteUser(crewId, userId) {
        const crew = database.getCrew(crewId);
        if (!crew) {
            return { success: false, error: 'Crew not found' };
        }

        // Check if user is already a member
        if (crew.members.includes(userId)) {
            return { success: false, error: 'User is already a member of this crew' };
        }

        // Check crew size limit
        if (crew.members.length >= this.getMaxCrewSize(crew.level)) {
            return { success: false, error: 'Crew is at maximum capacity' };
        }

        // Add to pending invitations
        if (!this.pendingInvitations.has(crewId)) {
            this.pendingInvitations.set(crewId, []);
        }

        const invitations = this.pendingInvitations.get(crewId);
        if (!invitations.includes(userId)) {
            invitations.push(userId);
        }

        return { success: true };
    }

    joinCrew(crewId, userId) {
        const crew = database.getCrew(crewId);
        if (!crew) {
            return { success: false, error: 'Crew not found' };
        }

        // Check if user has an invitation
        const invitations = this.pendingInvitations.get(crewId) || [];
        if (!invitations.includes(userId)) {
            return { success: false, error: 'You don\'t have an invitation to this crew' };
        }

        // Check crew size limit
        if (crew.members.length >= this.getMaxCrewSize(crew.level)) {
            return { success: false, error: 'Crew is at maximum capacity' };
        }

        // Add user to crew
        crew.members.push(userId);
        crew.lastActive = new Date().toISOString();

        // Remove invitation
        const invitationIndex = invitations.indexOf(userId);
        if (invitationIndex > -1) {
            invitations.splice(invitationIndex, 1);
        }

        // Update crew in database
        database.updateCrew(crewId, crew);

        return { success: true, crew: crew };
    }

    leaveCrew(crewId, userId) {
        const crew = database.getCrew(crewId);
        if (!crew) {
            return { success: false, error: 'Crew not found' };
        }

        if (!crew.members.includes(userId)) {
            return { success: false, error: 'You are not a member of this crew' };
        }

        // Check if user is captain
        if (crew.captain === userId) {
            if (crew.members.length > 1) {
                // Transfer captaincy to next member
                const newCaptain = crew.members.find(id => id !== userId);
                crew.captain = newCaptain;
                
                // Update new captain's role
                const newCaptainData = database.getUser(newCaptain);
                if (newCaptainData) {
                    newCaptainData.crewRole = 'captain';
                    database.updateUser(newCaptain, newCaptainData);
                }
            } else {
                // Last member leaving, delete crew
                database.data.crews.delete(crewId);
                return { success: true, crewDisbanded: true };
            }
        }

        // Remove user from crew
        crew.members = crew.members.filter(id => id !== userId);
        crew.lastActive = new Date().toISOString();

        // Update crew in database
        database.updateCrew(crewId, crew);

        return { success: true, crew: crew };
    }

    kickMember(crewId, targetUserId) {
        const crew = database.getCrew(crewId);
        if (!crew) {
            return { success: false, error: 'Crew not found' };
        }

        if (!crew.members.includes(targetUserId)) {
            return { success: false, error: 'User is not a member of this crew' };
        }

        if (crew.captain === targetUserId) {
            return { success: false, error: 'Cannot kick the captain' };
        }

        // Remove user from crew
        crew.members = crew.members.filter(id => id !== targetUserId);
        crew.lastActive = new Date().toISOString();

        // Update crew in database
        database.updateCrew(crewId, crew);

        return { success: true, crew: crew };
    }

    addCrewExperience(crewId, exp) {
        const crew = database.getCrew(crewId);
        if (!crew) return false;

        crew.reputation += exp;
        
        // Check for crew level up
        const expNeeded = this.getCrewExpRequirement(crew.level);
        if (crew.reputation >= expNeeded && crew.level < 50) {
            crew.level += 1;
            crew.reputation = 0; // Reset for next level
            
            // Notify crew members about level up
            return { levelUp: true, newLevel: crew.level };
        }

        database.updateCrew(crewId, crew);
        return { levelUp: false };
    }

    addCrewTreasure(crewId, amount) {
        const crew = database.getCrew(crewId);
        if (!crew) return false;

        crew.treasury += amount;
        crew.treasuresFound += 1;

        database.updateCrew(crewId, crew);
        return true;
    }

    addCrewVictory(crewId) {
        const crew = database.getCrew(crewId);
        if (!crew) return false;

        crew.victories += 1;
        crew.reputation += 10;

        database.updateCrew(crewId, crew);
        return true;
    }

    claimTerritory(crewId, locationName) {
        const crew = database.getCrew(crewId);
        if (!crew) return { success: false, error: 'Crew not found' };

        if (crew.territories.includes(locationName)) {
            return { success: false, error: 'Territory already claimed' };
        }

        // Check if territory is already claimed by another crew
        const allCrews = database.getAllCrews();
        const conflictCrew = allCrews.find(otherCrew => 
            otherCrew.id !== crewId && otherCrew.territories.includes(locationName)
        );

        if (conflictCrew) {
            return { 
                success: false, 
                error: `Territory is already claimed by ${conflictCrew.name}`,
                conflictCrew: conflictCrew
            };
        }

        crew.territories.push(locationName);
        crew.reputation += 25;
        database.updateCrew(crewId, crew);

        return { success: true, territory: locationName };
    }

    getMaxCrewSize(crewLevel) {
        return Math.min(20, 5 + crewLevel); // Start with 5, max 20
    }

    getCrewExpRequirement(level) {
        return 1000 * Math.pow(1.3, level - 1);
    }

    getCrewRanking() {
        const allCrews = database.getAllCrews();
        
        return allCrews
            .sort((a, b) => {
                // Sort by reputation, then by level, then by member count
                if (b.reputation !== a.reputation) return b.reputation - a.reputation;
                if (b.level !== a.level) return b.level - a.level;
                return b.members.length - a.members.length;
            })
            .map((crew, index) => ({
                rank: index + 1,
                crew: crew
            }));
    }

    calculateCrewBonus(crew, userData) {
        if (!crew) return { attack: 0, defense: 0, berryBonus: 0 };

        const memberCount = crew.members.length;
        const crewLevel = crew.level;

        return {
            attack: Math.floor((memberCount - 1) * 2 + crewLevel),
            defense: Math.floor((memberCount - 1) * 1.5 + crewLevel * 0.5),
            berryBonus: Math.floor(memberCount * 5 + crewLevel * 10) // Percentage bonus
        };
    }

    getCrewMemberStats(crewId) {
        const crew = database.getCrew(crewId);
        if (!crew) return null;

        const memberStats = crew.members.map(memberId => {
            const member = database.getUser(memberId);
            return {
                id: memberId,
                username: member?.username || 'Unknown',
                level: member?.level || 0,
                role: member?.crewRole || 'member',
                isOnline: member?.lastActive && 
                         (Date.now() - new Date(member.lastActive).getTime()) < 300000 // 5 minutes
            };
        });

        return {
            crew: crew,
            members: memberStats,
            totalLevel: memberStats.reduce((sum, member) => sum + member.level, 0),
            averageLevel: memberStats.length > 0 ? 
                         Math.floor(memberStats.reduce((sum, member) => sum + member.level, 0) / memberStats.length) : 0
        };
    }
}

// Create singleton instance
const crewSystem = new CrewSystem();

module.exports = crewSystem;
