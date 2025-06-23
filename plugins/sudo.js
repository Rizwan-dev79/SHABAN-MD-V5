const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

/* ========================
𓆰𝑆𝛥𝛭𝛨闩乂  𝖆𝖎  𓆪⁩ SUDO MANAGEMENT
========================= */

const HEADER = `𓆰𝑆𝛥𝛭𝛨闩乂  𝖆𝖎  𓆪⁩ *SUDO System*`;
const FOOTER = `\n*© 2024 𓆰𝑆𝛥𝛭𝛨闩乂  𝖆𝖎  𓆪⁩*`;

// Helper functions
const getValidJid = (message, match) => {
  const jid = message.reply_message?.jid || message.mention?.[0] || match;
  return jidToNum(jid);
};

const formatResponse = (content) => {
  return `${HEADER}\n\n${content}\n${FOOTER}`;
};

// Temporary SUDO storage
const tempSudoOwners = new Map();

/* ========================
 SUDO MANAGEMENT COMMANDS
========================= */

bot(
  {
    pattern: 'setsudo ?(.*)',
    fromMe: true,
    desc: 'Add user to SUDO (permanent or temporary)',
    type: 'vars',
  },
  async (message, match) => {
    try {
      const [input, duration] = match.split(' ');
      const jid = getValidJid(message, input);
      
      if (!jid) {
        return await message.send(formatResponse(
          'Example:\n' +
          '• `setsudo 9876543210` (permanent)\n' +
          '• `setsudo 9876543210 24h` (temporary for 24 hours)'
        ));
      }

      // Handle temporary SUDO
      if (duration) {
        const hours = parseInt(duration.replace('h', ''));
        if (isNaN(hours) {
          return await message.send(formatResponse('Invalid duration format. Use like `24h`'));
        }

        const expiry = Date.now() + (hours * 60 * 60 * 1000);
        tempSudoOwners.set(jid, expiry);
        
        return await message.send(formatResponse(
          `⏳ Added *${jid}* as temporary SUDO for ${hours} hours\n` +
          `Expires: ${new Date(expiry).toLocaleString()}`
        ));
      }

      // Permanent SUDO
      const vars = await getVars(message.id);
      const updatedSudo = rmComma(`${vars.SUDO || ''},${jid}`);
      await setVar({ SUDO: updatedSudo }, message.id);
      
      return await message.send(formatResponse(
        `✅ Added *${jid}* to SUDO list\n` +
        `Current SUDOs: ${updatedSudo}`
      ));
    } catch (error) {
      return await message.send(formatResponse(`❌ Error: ${error.message}`));
    }
  }
);

bot(
  {
    pattern: 'delsudo ?(.*)',
    fromMe: true,
    desc: 'Remove user from SUDO list',
    type: 'vars',
  },
  async (message, match) => {
    try {
      const jid = getValidJid(message, match);
      if (!jid) {
        return await message.send(formatResponse(
          'Example:\n' +
          '• `delsudo 9876543210`\n' +
          '• Reply to user with `delsudo`'
        ));
      }

      // Remove from temporary SUDO
      if (tempSudoOwners.has(jid)) {
        tempSudoOwners.delete(jid);
        return await message.send(formatResponse(
          `♻️ Removed *${jid}* from temporary SUDO list`
        ));
      }

      // Remove from permanent SUDO
      const vars = await getVars(message.id);
      if (!vars.SUDO) {
        return await message.send(formatResponse('No SUDO numbers configured'));
      }

      const updatedSudo = rmComma(vars.SUDO.replace(jid, ''));
      await setVar({ SUDO: updatedSudo }, message.id);
      
      return await message.send(formatResponse(
        `✅ Removed *${jid}* from SUDO list\n` +
        `Remaining SUDOs: ${updatedSudo || 'None'}`
      ));
    } catch (error) {
      return await message.send(formatResponse(`❌ Error: ${error.message}`));
    }
  }
);

bot(
  {
    pattern: 'getsudo ?(.*)',
    fromMe: true,
    desc: 'Show all SUDO users (permanent & temporary)',
    type: 'vars',
  },
  async (message, match) => {
    try {
      const vars = await getVars(message.id);
      let response = '';

      // Permanent SUDOs
      response += `🔹 *Permanent SUDOs*:\n${vars.SUDO || 'None'}\n\n`;

      // Temporary SUDOs
      if (tempSudoOwners.size > 0) {
        response += `⏳ *Temporary SUDOs*:\n`;
        tempSudoOwners.forEach((expiry, jid) => {
          response += `• ${jid} (expires: ${new Date(expiry).toLocaleString()})\n`;
        });
      } else {
        response += `No temporary SUDOs configured`;
      }

      return await message.send(formatResponse(response));
    } catch (error) {
      return await message.send(formatResponse(`❌ Error: ${error.message}`));
    }
  }
);

// Cleanup expired temporary SUDOs
setInterval(() => {
  const now = Date.now();
  tempSudoOwners.forEach((expiry, jid) => {
    if (now > expiry) {
      tempSudoOwners.delete(jid);
    }
  });
}, 3600000); // Check every hour
