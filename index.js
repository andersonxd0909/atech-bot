const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Configuración del cliente
const client = new Client({
    authStrategy: new LocalAuth(), // Guarda la sesión para no escanear siempre
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// Generar QR en consola
client.on('qr', (qr) => {
    console.log('ESCANEAME PARA CONECTAR:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('¡ATech Bot está en línea y operando! 🚀');
});

// Lógica de mensajes
client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const userMessage = msg.body.toLowerCase();

    // 1. SALUDO INICIAL / MENÚ PRINCIPAL
    if (['hola', 'inicio', 'buenos días', 'buenas tardes'].includes(userMessage)) {
        await client.sendMessage(msg.from, 
            '💻 *Bienvenido a ATech Software Studio* 🛡️\n\n' +
            'Soy el asistente inteligente de Anderson. ¿En qué área de ingeniería podemos trabajar hoy?\n\n' +
            'Escribe el *NÚMERO* de la opción:\n' +
            '1️⃣ *Desarrollo de Software* (Backend/Apps)\n' +
            '2️⃣ *Ciberseguridad* (Auditoría/Pentesting)\n' +
            '3️⃣ *Soporte Técnico Especializado*'
        );
    }

    // 2. NIVEL DE CATEGORÍAS
    else if (userMessage === '1') {
        await client.sendMessage(msg.from, 
            '🚀 *Área de Desarrollo*\n' +
            '¿Qué tipo de solución buscas? Escribe la *LETRA*:\n' +
            'A) APIs REST y Backend\n' +
            'B) Aplicaciones Fullstack\n' +
            'C) Mantenimiento de Sistemas'
        );
    } 
    else if (userMessage === '2') {
        await client.sendMessage(msg.from, 
            '🛡️ *Área de Seguridad*\n' +
            '¿Cómo podemos protegerte? Escribe la *LETRA*:\n' +
            'D) Hacking Ético (Pentesting)\n' +
            'E) Blindaje de Servidores\n' +
            'F) Análisis de Vulnerabilidades'
        );
    }

    // 3. NIVEL DE DURACIÓN (Maneja las letras A hasta la F)
    else if (['a', 'b', 'c', 'd', 'e', 'f'].includes(userMessage)) {
        await client.sendMessage(msg.from, 
            'Entendido. Para darte un presupuesto exacto, ¿cuánto tiempo estimas para el proyecto?\n\n' +
            'Ejemplo: "2 semanas", "3 meses", "Urgente".'
        );
    }

    // 4. CIERRE (Si el mensaje es más largo, asumimos que es la duración)
    else if (userMessage.length > 5 && !isNaN(parseInt(userMessage.charAt(0)))) {
        // Esto es una lógica simple para detectar cuando ya dieron una respuesta final
        await client.sendMessage(msg.from, 
            '✅ *Solicitud Recibida.*\n\n' +
            'He enviado estos detalles a Anderson. Él revisará tu caso y te responderá en breve. ¡Gracias por confiar en ATech!'
        );
    }
});

client.initialize();