const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function connectToWhatsApp() {
    // 1. Configuración de sesión y versión
    const { state, saveCreds } = await useMultiFileAuthState('sesion_nueva');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
    });

    // 2. Lógica del Código de Emparejamiento (Pairing Code)
    if (!sock.authState.creds.registered) {
        await delay(5000); // Espera de seguridad para cargar el socket
        
        const numeroTelefono = "51931551811"; // Tu número configurado
        
        try {
            const code = await sock.requestPairingCode(numeroTelefono);
            console.log("╔════════════════════════════════════╗");
            console.log("   TU CÓDIGO DE CONEXIÓN ES: " + code);
            console.log("╚════════════════════════════════════╝");
        } catch (error) {
            console.log("Error al generar el código:", error);
        }
    }

    // 3. Guardar credenciales y manejar conexión
    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            console.log("Conexión cerrada, reintentando...");
            connectToWhatsApp();
        }
        if (connection === "open") {
            console.log("╔════════════════════════════════════╗");
            console.log("   ¡ATech Bot está EN LÍNEA! 🚀      ");
            console.log("╚════════════════════════════════════╝");
        }
    });

    // 4. Lógica de Mensajes con Diseño Pro
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && m.type === "notify") {
            const from = msg.key.remoteJid;
            const userMessage = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();

            // MENÚ PRINCIPAL
            if (['hola', 'inicio', 'menu', 'buenos días'].includes(userMessage)) {
                const welcomeMsg = 
                    '╔══════════════════════╗\n' +
                    '     *ATech Software Studio* 🛡️\n' +
                    '╚══════════════════════╝\n\n' +
                    'Hola, soy el asistente de Anderson. Selecciona un área especializada:\n\n' +
                    '🚀 *[1]* Desarrollo de Software\n' +
                    '🛡️ *[2]* Ciberseguridad & Auditoría\n' +
                    '⚙️ *[3]* Soporte Técnico\n' +
                    '👤 *[4]* Hablar con Anderson (Humano)\n\n' +
                    '👉 _Responde solo con el número de la opción._';
                
                await sock.sendMessage(from, { text: welcomeMsg });
            }

            // SUBMENÚ DESARROLLO
            else if (userMessage === '1') {
                await sock.sendMessage(from, { 
                    text: '🚀 *DEPARTAMENTO DE DESARROLLO*\n\n' +
                          'Selecciona una solución:\n' +
                          '🅰️ *APIs REST & Backend*\n' +
                          '🅱️ *Aplicaciones Fullstack*\n' +
                          '🆂 *Mantenimiento de Sistemas*'
                });
            }

            // SUBMENÚ SEGURIDAD
            else if (userMessage === '2') {
                await sock.sendMessage(from, { 
                    text: '🛡️ *CENTRO DE SEGURIDAD*\n\n' +
                          'Selecciona un servicio:\n' +
                          '🅳 *Pentesting (Hacking Ético)*\n' +
                          '🅴 *Blindaje de Servidores*\n' +
                          '🅵 *Análisis de Vulnerabilidades*'
                });
            }

            // RESPUESTA FINAL / CIERRE
            else if (['a', 'b', 's', 'd', 'e', 'f'].includes(userMessage)) {
                await sock.sendMessage(from, { 
                    text: '✅ *Solicitud procesada.*\n\nDetalla el tiempo estimado (ej: "1 mes") y Anderson revisará tu caso personalmente. ¡Gracias por confiar en ATech!' 
                });
            }
        }
    });
}

connectToWhatsApp();