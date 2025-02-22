const { activeLoops } = require("./emote");

module.exports = function handleStopCommand(bot, user) {
    if (activeLoops.has(user.id)) {
        clearInterval(activeLoops.get(user.id));
        activeLoops.delete(user.id);
        bot.whisper.send(user.id, `Stopped looping emotes for ${user.username}.`);
    } else {
        bot.whisper.send(user.id, `No active emote loop to stop.`);
    }
};
