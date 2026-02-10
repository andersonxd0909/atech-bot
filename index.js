const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
    });

    // --- AQUÍ PIDE EL CÓDIGO DE 8 DÍGITOS ---
    if (!sock.authState.creds.registered) {
        await delay(5000); // Esperamos a que cargue
        
        // Pon tu número aquí (ejemplo: 51999888777 para Perú)
        const numeroTelefono = "51931551811"; 
        
        const code = await sock.requestPairingCode(numeroTelefono);
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
}

connectToWhatsApp();