const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Aún sacará el QR por si acaso
        logger: pino({ level: "silent" }),
    });

    // --- AQUÍ ESTÁ EL TRUCO DEL CÓDIGO ---
    if (!sock.authState.creds.registered) {
        // ESPERA 5 SEGUNDOS Y LUEGO PIDE EL CÓDIGO
        await delay(5000); 
        const numero = "51931551811"; // <--- CAMBIA ESTO POR TU NÚMERO (con código de país, ej: 51 para Perú)
        const code = await sock.requestPairingCode(numero);
        console.log("-----------------------------------------");
        console.log("TU CÓDIGO DE CONEXIÓN ES:", code);
        console.log("-----------------------------------------");
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "close") connectToWhatsApp();
        if (connection === "open") console.log("¡ATech Bot está en línea! 🚀");
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === "notify") {
            const texto = msg.message?.conversation?.toLowerCase();
            const from = msg.key.remoteJid;

            if (texto === "hola") {
                await sock.sendMessage(from, { text: "💻 *Bienvenido a ATech Software Studio*\nSoy el asistente de Anderson." });
            }
        }
    });
}

connectToWhatsApp();