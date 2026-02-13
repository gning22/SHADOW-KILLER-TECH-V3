const { default: makeWASocket, useMultiFileAuthState, delay, disconnectReason, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

// --- ANALYSE DES VARIABLES GLOBALES ---
const OWNER = "221763175367"; 
const PREFIXE = "!";
const SESSION_NAME = "KILLERMD"; 
const LOGO = "https://files.catbox.moe/o3p92m.png";
const AUDIO = "https://files.catbox.moe/o3p92m.mp3"; 

async function startShadowEmpire() {
    // Nettoyage de la mémoire au démarrage
    const { state, saveCreds } = await useMultiFileAuthState('session_killer');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: [SESSION_NAME, "Chrome", "3.0.0"]
    });

    // --- LOGIQUE DE PAIRING VÉRIFIÉE ---
    if (!sock.authState.creds.registered) {
        console.log(`\n[ ${SESSION_NAME} ] ➔ Analyse des protocoles...`);
        await delay(10000); 
        try {
            let code = await sock.requestPairingCode(OWNER);
            console.log(`\n👑 CODE DE PAIRING : ${code}\n`);
        } catch (e) {
            console.log("⚠️ ERREUR : Serveur WhatsApp occupé. Patientez 15 min.");
        }
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (text.startsWith(PREFIXE)) {
            const command = text.slice(1).trim().split(/ +/).shift().toLowerCase();

            switch (command) {
                case 'menu':
                    const menuBody = `╭━━〔 💀 *SHADOW KILLER* 💀 〕━━┈\n┃\n┃ 👋 Salut @${from.split('@')[0]}\n┃ 🤖 *SESSION :* ${SESSION_NAME}\n┃\n┃ 📜 *!admin* (Gestion)\n┃ 🎮 *!fun* (Jeux)\n┃ 📥 *!dl* (Download)\n┃ 🎨 *!s* (Stickers)\n┃\n╰━━━━━━━━━━━━━━━━━━━━┈`;
                    
                    await sock.sendMessage(from, { image: { url: LOGO }, caption: menuBody, mentions: [from] });
                    await sock.sendMessage(from, { audio: { url: AUDIO }, mimetype: 'audio/mp4', ptt: true });
                    break;

                case 'ping':
                    await sock.sendMessage(from, { text: "⚡ *Latence : Minimale. Système : Opérationnel.*" });
                    break;
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = (lastDisconnect.error instanceof Boom)?.output?.statusCode;
            if (reason !== disconnectReason.loggedOut) startShadowEmpire();
        } else if (connection === 'open') {
            console.log(`✅ [ ${SESSION_NAME} ] : CONNEXION ÉTABLIE AVEC SUCCÈS !`);
        }
    });
}

startShadowEmpire();
