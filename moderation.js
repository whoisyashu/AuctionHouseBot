const fs = require("fs");

const MODS_FILE = "mods.json";
const modPosition = { x: 10, y: 5, z: 10 }; // Mod Section Coordinates

// Load moderators from mods.json
function loadModerators() {
    try {
        if (fs.existsSync(MODS_FILE)) {
            return JSON.parse(fs.readFileSync(MODS_FILE));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Failed to load moderators:", error);
        return [];
    }
}

// Save moderators to file
function saveModerators(moderators) {
    fs.writeFileSync(MODS_FILE, JSON.stringify(moderators, null, 2));
}

// Check if user is a moderator
function isMod(userId) {
    const moderators = loadModerators();
    return moderators.includes(userId);
}

// Handle moderator commands
function handleModCommands(bot, user, message) {
    const args = message.split(" ");

    if (user.id === bot.info.owner.id) {
        let moderators = loadModerators();

        if (args[0] === "!add" && args[1] === "mod" && args[2]) {
            const mentionedUserId = args[2].replace(/[<@>]/g, "");
            if (!moderators.includes(mentionedUserId)) {
                moderators.push(mentionedUserId);
                saveModerators(moderators);
                bot.message.send(`✅ <@${mentionedUserId}> has been added as a moderator.`);
            } else {
                bot.message.send(`⚠️ <@${mentionedUserId}> is already a moderator.`);
            }
        }

        if (args[0] === "!remove" && args[1] === "mod" && args[2]) {
            const mentionedUserId = args[2].replace(/[<@>]/g, "");
            const index = moderators.indexOf(mentionedUserId);
            if (index !== -1) {
                moderators.splice(index, 1);
                saveModerators(moderators);
                bot.message.send(`❌ <@${mentionedUserId}> has been removed as a moderator.`);
            } else {
                bot.message.send(`⚠️ <@${mentionedUserId}> is not a moderator.`);
            }
        }
    }

    // Moderator Teleport Command
    if (message === "!mod") {
        if (!isMod(user.id)) {
            bot.message.send(`⛔ ${user.username}, you are not a moderator.`);
            return;
        }

        bot.player.teleport(user.id, modPosition.x, modPosition.y, modPosition.z)
            .then(() => bot.message.send(`🚀 ${user.username} has been teleported to the Mod Section.`))
            .catch(error => console.error(`Failed to teleport ${user.username} to Mod Section:`, error));
    }
}

module.exports = { handleModCommands, isMod };
