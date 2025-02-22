const emotes = require("../utils/emoteList");
const activeLoops = new Map();

module.exports = function handleEmoteCommands(bot, user, args) {
    const command = args[0];
    const emoteName = args.slice(1).join(" ");

    if (command === "!emotelist") {
        const page = args[1] ? parseInt(args[1]) : 1;
        const emoteKeys = Object.keys(emotes);
        const emotesForPage = emoteKeys.slice((page - 1) * 7, page * 7);

        let emoteListMessage = `Emote list (Page ${page}):\n`;
        emotesForPage.forEach(emote => {
            emoteListMessage += `\`${emote}\` - ${emotes[emote].id}\n`;
        });

        bot.whisper.send(user.id, emoteListMessage).catch(e => console.error(e));
        return;
    }

    if (!emotes[emoteName]) {
        bot.whisper.send(user.id, `Invalid emote name: ${emoteName}`);
        return;
    }

    if (command === "!emote") {
        bot.player.emote(user.id, emotes[emoteName].id)
            .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
    } 
    else if (command === "!loop") {
        if (activeLoops.has(user.id)) {
            clearInterval(activeLoops.get(user.id));
        }

        const loopInterval = setInterval(() => {
            bot.player.emote(user.id, emotes[emoteName].id)
                .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
        }, emotes[emoteName].duration * 1000);

        activeLoops.set(user.id, loopInterval);
        bot.whisper.send(user.id, `Looping ${emoteName} for ${user.username}.`);
    }
};

module.exports.activeLoops = activeLoops;
