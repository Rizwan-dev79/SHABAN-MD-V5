const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "uptime", "a"],
    desc: "Check if the bot is online and active",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const status = ` *📡 𓆰𝑆𝛥𝛭𝛨闩乂  𝖆𝖎 𓆪⁩ is alive! 👾*

✅ *Status:* Active  
👑 *Owner:* ${config.OWNER_NAME}  
🧩 *Version:* 3.0.0  
🎯 *Mode:* ${config.MODE}  
🎛️ *Prefix:* ${config.PREFIX}  
💾 *RAM Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB  
🖥️ *Host:* ${os.hostname()}  
⏱️ *Uptime:* ${runtime(process.uptime())}
__________________________________
${config.DESCRIPTION}`;

        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/1f6h2j.jpg" },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                     newsletterJid: '120363358310754973@newsletter',
                    newsletterName: '𓆰𝑆𝛥𝛭𝛨闩乂 𝑇𝛯𝐶𝛨𓆪⁩',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
