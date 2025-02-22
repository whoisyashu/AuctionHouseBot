function handleHelpCommand(bot, user, message) {
    

    // General Commands
    const generalHelp = `📜 **Help Menu (General)**  
🔹 \`!join\` - Join as a seller  
🔹 \`!assistemote\` - Assist remote control  
🔹 \`!grab\` - (Admin Only) Teleport to grab  
`;

    // Owner Commands
    const ownerHelp = `👑 **Help Menu (Owner)**  
🔹 \`!add mod @username\` - Add a new moderator (Owner only)  
🔹 \`!remove mod @username\` - Remove a moderator (Owner only)  
`;

    if(message === "!help"){
        bot.message.send(generalHelp);
    }else if(message === "!help owner"){
        bot.message.send(ownerHelp);
    }
    if (message !== "!help") return;
    
}

module.exports = { handleHelpCommand };
