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

    if (!sock.authState.creds.registered) {
        await delay(5000);
        const numeroTelefono = "51900000000"; // <-- ASEGÚRATE QUE ESTÉ TU NÚMERO
        const code = await sock.requestPairingCode(numeroTelefono);
        console.log("TU CÓDIGO DE CONEXIÓN ES:", code);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "close") connectToWhatsApp();
        if (connection === "open") console.log("¡ATech Bot está en línea y operando! 🚀");
    });

    // --- AQUÍ ESTÁ LA LÓGICA QUE FALTABA ---
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === "notify") {
            const from = msg.key.remoteJid;
            const userMessage = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();

            // 1. SALUDO E INICIO
            if (['hola', 'inicio', 'buenos días'].includes(userMessage)) {
                await sock.sendMessage(from, { text: '💻 *Bienvenido a ATech Software Studio* 🛡️\n\nSoy el asistente inteligente de Anderson. ¿En qué área podemos trabajar?\n\n1️⃣ *Desarrollo de Software*\n2️⃣ *Ciberseguridad*\n3️⃣ *Soporte Técnico*' });
            }
            // 2. OPCIONES 1 y 2
            else if (userMessage === '1') {
                await sock.sendMessage(from, { text: '🚀 *Área de Desarrollo*\nA) APIs REST\nB) Apps Fullstack\nC) Mantenimiento' });
            }
            else if (userMessage === '2') {
                await sock.sendMessage(from, { text: '🛡️ *Área de Seguridad*\nD) Pentesting\nE) Blindaje\nF) Vulnerabilidades' });
            }
            // 3. RESPUESTA A LETRAS
            else if (['a', 'b', 'c', 'd', 'e', 'f'].includes(userMessage)) {
                await sock.sendMessage(from, { text: 'Entendido. ¿Cuánto tiempo estimas para el proyecto?\n\nEjemplo: "2 semanas".' });
            }
        }
    });
}

connectToWhatsApp();