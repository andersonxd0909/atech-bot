const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function connectToWhatsApp() {
    // CAMBIO DE NOMBRE DE CARPETA PARA LIMPIAR ERRORES
    const { state, saveCreds } = await useMultiFileAuthState('sesion_definitiva_atech');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
    });

    if (!sock.authState.creds.registered) {
        await delay(5000);
        // TU NÚMERO SIN ESPACIOS NI +
        const numeroTelefono = "51931551811"; 
        
        try {
            const code = await sock.requestPairingCode(numeroTelefono);
            console.log("---------------------------------------");
            console.log("USA ESTE CÓDIGO AHORA: " + code);
            console.log("---------------------------------------");
        } catch (error) {
            console.log("Error al generar el código:", error);
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "close") connectToWhatsApp();
        if (connection === "open") {
            console.log("¡ATech Bot está EN LÍNEA! 🚀");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === "notify") {
            const from = msg.key.remoteJid;
            const text = (msg.message?.conversation || "").toLowerCase();
            if (text === "hola") {
                await sock.sendMessage(from, { text: "💻 *ATech Software Studio*\nHola, soy el bot de Anderson." });
            }
        }
    });
}

connectToWhatsApp();