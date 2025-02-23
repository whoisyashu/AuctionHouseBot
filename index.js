const { Highrise, Events, Facing, Emotes } = require("highrise.sdk.dev");
const { token, room } = require("./config");

const bot = new Highrise({
    Events: [
        Events.Messages,
        Events.Joins,
        Events.Emotes,
        Events.Leaves,
        Events.Movements,
        Events.Reactions,
        Events.DirectMessages,
        Events.Tips,
    ],
});

bot.on("ready", () => {
    console.log("Bot is live now.");
    bot.player.teleport(bot.info.user.id, 19.5, 0, 14.5, Facing.FrontLeft);
    bot.message.send("I am still alive!");
});

bot.on("playerJoin", (user) => {
    bot.player.emote(bot.info.user.id, Emotes.Bow.id);
    bot.message.send(`${user.username}, welcome to the 🏦 Auction House 🏦!`);
});


const sellerQueue = []; // Merged queue for both Fixed & Multi
let currentSeller = null;
let auctionTimer = null;
let auctionRunning = false;
let auctionStatusInterval = null;
const grabPosition = { x: 16.5, y: 7, z: 14.5, facing: "FrontLeft" };
const stagePosition = { x: 1.5, y: 1.75, z: 6.5 };
const audiencePosition = { x: 19.5, y: 0, z: 14.5 };

bot.on("chatCreate", async (user, message) => {
    if (message.startsWith("!join")) {
        if (!sellerQueue.includes(user.id)) {
            sellerQueue.push(user.id);
            bot.message.send(`${user.username} has joined the auction queue!`);
        } else {
            bot.message.send(`${user.username}, you are already in the queue!`);
        }

        if (!auctionRunning) {
            nextSeller();
        }
    }

    if (message === "!done" && currentSeller === user.id) {
        bot.message.send(`${user.username} has ended their auction early.`);
        clearTimeout(auctionTimer);
        teleportToAudience(currentSeller);
        setTimeout(() => nextSeller(), 5000);
    }
    if (message === "!grab") {
        bot.player.teleport(user.id, grabPosition.x,grabPosition.y,grabPosition.z,grabPosition.facing);
    }
});

async function nextSeller() {
    if (sellerQueue.length === 0) {
        bot.message.send("No more sellers in the queue. Waiting for new sellers...");
        currentSeller = null;
        auctionRunning = false;
        stopAuctionStatusUpdates();
        return;
    }

    auctionRunning = true;
    startAuctionStatusUpdates();

    bot.message.send("⏳ Next seller coming in 5 seconds...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    currentSeller = sellerQueue.shift();

    bot.room.players.username(currentSeller).then(username => {
        bot.message.send(`🎤 ${username}, you have 2 minutes.`);
    });

    await teleportToStage(currentSeller);

    auctionTimer = setTimeout(() => {
        bot.message.send(`⏳ Time's up! Moving to the next seller.`);
        teleportToAudience(currentSeller);
        setTimeout(() => nextSeller(), 5000);
    }, 2 * 60 * 1000);
}

async function teleportToStage(userId) {
    try {
        await bot.player.teleport(userId, stagePosition.x, stagePosition.y, stagePosition.z);
        bot.message.send(`Seller has been teleported to the auction stage!`);
    } catch (error) {
        console.error(`Failed to teleport ${userId} to the stage:`, error);
    }
}

async function teleportToAudience(userId) {
    try {
        await bot.player.teleport(userId, audiencePosition.x, audiencePosition.y, audiencePosition.z);
    } catch (error) {
        console.error(`Failed to teleport ${userId} back to the audience:`, error);
    }
}

function startAuctionStatusUpdates() {
    if (auctionStatusInterval) return;

    auctionStatusInterval = setInterval(async () => {
        if (!auctionRunning) {
            stopAuctionStatusUpdates();
            return;
        }

        let nextSellers = await Promise.all(sellerQueue.slice(0, 3).map(async (id, index) => {
            return bot.room.players.username(id).then(username => `${index + 1}. ${username}`);
        }));

        let currentSellerName = currentSeller
            ? await bot.room.players.username(currentSeller)
            : "None";

        bot.message.send(`🎤Auction Status Update:\nCurrent Seller: ${currentSellerName}\nNext Sellers:\n${nextSellers.join("\n") || "None"}`);
    }, 30 * 1000);
}

function stopAuctionStatusUpdates() {
    if (auctionStatusInterval) {
        clearInterval(auctionStatusInterval);
        auctionStatusInterval = null;
    }
}

const activeLoops = new Map(); // Stores looping emotes per user

const emotes = {
  kiss: { id: "emote-kiss", duration: 3 },
  laugh: { id: "emote-laughing", duration: 3 },
  sit: { id: "idle-loop-sitfloor", duration: 10 },
  lust: { id: "emote-lust", duration: 5 },
  curse: { id: "emoji-cursing", duration: 2.5 },
  greedy: { id: "emote-greedy", duration: 4.8 },
  flex: { id: "emoji-flex", duration: 3 },
  gag: { id: "emoji-gagging", duration: 6 },
  celebrate: { id: "emoji-celebrate", duration: 4 },
  macarena: { id: "dance-macarena", duration: 12.5 },
  tiktok8: { id: "dance-tiktok8", duration: 11 },
  blackpink: { id: "dance-blackpink", duration: 7 },
  model: { id: "emote-model", duration: 6.3 },
  tiktok2: { id: "dance-tiktok2", duration: 11 },
  pennywise: { id: "dance-pennywise", duration: 1.5 },
  bow: { id: "emote-bow", duration: 3.3 },
  russian: { id: "dance-russian", duration: 10.3 },
  curtsy: { id: "emote-curtsy", duration: 2.8 },
  snowball: { id: "emote-snowball", duration: 6 },
  hot: { id: "emote-hot", duration: 4.8 },
  snowangel: { id: "emote-snowangel", duration: 6.8 },
  charge: { id: "emote-charging", duration: 8.5 },
  cartdance: { id: "dance-shoppingcart", duration: 8 },
  confused: { id: "emote-confused", duration: 9.3 },
  hype: { id: "idle-enthusiastic", duration: 16.5 },
  psychic: { id: "emote-telekinesis", duration: 11 },
  float: { id: "emote-float", duration: 9.3 },
  teleport: { id: "emote-teleporting", duration: 12.5 },
  swordfight: { id: "emote-swordfight", duration: 6 },
  maniac: { id: "emote-maniac", duration: 5.5 },
  energyball: { id: "emote-energyball", duration: 8.3 },
  snake: { id: "emote-snake", duration: 6 },
  sing: { id: "idle_singing", duration: 11 },
  frog: { id: "emote-frog", duration: 15 },
  pose: { id: "emote-superpose", duration: 4.6 },
  cute: { id: "emote-cute", duration: 7.3 },
  tiktok9: { id: "dance-tiktok9", duration: 13 },
  weird: { id: "dance-weird", duration: 22 },
  tiktok10: { id: "dance-tiktok10", duration: 9 },
  pose7: { id: "emote-pose7", duration: 5.3 },
  pose8: { id: "emote-pose8", duration: 4.6 },
  casualdance: { id: "idle-dance-casual", duration: 9.7 },
  pose1: { id: "emote-pose1", duration: 3 },
  pose3: { id: "emote-pose3", duration: 4.7 },
  pose5: { id: "emote-pose5", duration: 5 },
  cutey: { id: "emote-cutey", duration: 3.5 },
  punkguitar: { id: "emote-punkguitar", duration: 10 },
  zombierun: { id: "emote-zombierun", duration: 10 },
  fashionista: { id: "emote-fashionista", duration: 6 },
  gravity: {id: "emote-gravity", duration: 9.8},
  icecream: { id: "dance-icecream", duration: 15 },
  wrongdance: { id: "dance-wrong", duration: 13 },
  uwu: { id: "idle-uwu", duration: 25 },
  tiktok4: { id: "idle-dance-tiktok4", duration: 16 },
  shy: { id: "emote-shy2", duration: 5 },
  anime: { id: "dance-anime", duration: 7.8 },
};
// Promote the Free Grab Room every 2 minutes
const emotePages = Math.ceil(Object.keys(emotes).length / 7);
bot.on("chatCreate", async (user, message) => {
    const args = message.toLowerCase().split(" "); // Convert input to lowercase
    const command = args[0];
    const emoteName = args.slice(1).join(" ");
    if (command === "!assistemote") {
      const assistMessage = `
        List of Commands for User Fun:
        1.!emote <emote_name>
        2.!loop <emote_name>
        3.!stop
        4.!emotelist <page_number>
        Use these commands to have fun with emotes! 🎉
      `;
  
      bot.message.send(assistMessage).catch(e => console.error(e));
    }
    else if (command === "!emotelist") {
      const page = args[1] ? parseInt(args[1]) : 1;
      
      if (isNaN(page) || page < 1 || page > emotePages) {
        bot.message.send(`Usage: !emotelist <page_number>. Valid page numbers are from 1 to ${emotePages}.`);
        return;
      }
  
      const emoteKeys = Object.keys(emotes);
      const emotesForPage = emoteKeys.slice((page - 1) * 7, page * 7);
      
      let emoteListMessage = `Emote list (Page ${page}/${emotePages}):\n`;
      emotesForPage.forEach(emote => {
        emoteListMessage += `\`${emote}\` - ${emotes[emote].id}\n`;
      });
  
      bot.message.send(emoteListMessage).catch(e => console.error(e));
    }
    else if (command === "!emote") {
      if (!emotes[emoteName]) {
        bot.message.send(`Invalid emote name: ${emoteName}`);
        return;
      }
  
      bot.player.emote(user.id, emotes[emoteName].id)
        .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
  
    } else if (command === "!loop") {
      if (!emotes[emoteName]) {
        bot.message.send(`Invalid emote name: ${emoteName}`);
        return;
      }
  
      // Stop previous loop if already active for the user
      if (activeLoops.has(user.id)) {
        clearInterval(activeLoops.get(user.id));
      }
  
      // Start looping the emote
      const loopInterval = setInterval(() => {
        bot.player.emote(user.id, emotes[emoteName].id)
          .catch(e => console.error(`[ERROR] Failed to perform emote:`, e));
      }, emotes[emoteName].duration * 1000);
  
      activeLoops.set(user.id, loopInterval);
      bot.message.send(`Looping ${emoteName} for ${user.username}.`);
  
    } else if (command === "!stop") {
      if (activeLoops.has(user.id)) {
        clearInterval(activeLoops.get(user.id));
        activeLoops.delete(user.id);
        bot.message.send(`Stopped looping emotes for ${user.username}.`);
      } else {
        bot.message.send(`No active emote loop to stop.`);
      }
    }
  });

  const { handleModCommands, isMod } = require("./moderation");

bot.on("chatCreate", async (user, message) => {
    handleModCommands(bot, user, message);

    if (message === "!modlist") {
        bot.message.send(`🔹 Moderators: ${loadModerators().map(id => `<@${id}>`).join(", ") || "None"}`);
    }
});
const { handleHelpCommand } = require("./help");

bot.on("chatCreate", async (user, message) => {
    handleHelpCommand(bot, user, message);
});

let helpInterval = null; // Interval reference

// Function to start periodic help messages
function startHelpMessages(bot) {
    if (helpInterval) return; // Prevent multiple intervals

    helpInterval = setInterval(async () => {
        const players = await bot.room.players.get(); // Get list of players in the room

        if (players.length === 0) {
            stopHelpMessages(); // Stop if no one is in the room
            return;
        }

        // General Help Message
        const generalHelp = `📜 **Help Menu (General)**  
🔹 \`!join\` - Join as a seller  
🔹 \`!assistemote\` - Assist remote control  
🔹 \`!grab\` - (Admin Only) Teleport to grab`;

        bot.message.send(generalHelp);
    }, 90 * 1000); // 1.5 minutes interval
}

// Function to stop periodic help messages
function stopHelpMessages() {
    if (helpInterval) {
        clearInterval(helpInterval);
        helpInterval = null;
    }
}

// Start Help Messages when bot starts
bot.on("ready", () => {
    startHelpMessages(bot);
});


bot.login(token, room);
