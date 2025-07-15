// Utilidades para enviar notificaciones por Telegram

interface TelegramUser {
  id: string;
  fields: {
    Nombre: string;
    ID_Chat: string;
    Activo?: boolean;
  };
}

interface PedidoData {
  cedula: string;
  nombreCliente: string;
  razonSocialCliente: string;
  cantidad: number;
  unidadMedida: string;
  precioTotal: number;
  destino?: string;
  cantidadBigBags?: number;
  cantidadLonas?: number;
}

export async function sendTelegramNotification(pedidoData: PedidoData): Promise<void> {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TELEGRAM_USERS_TABLE_ID = process.env.TELEGRAM_USERS_TABLE_ID;

    if (!TELEGRAM_BOT_TOKEN || !AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !TELEGRAM_USERS_TABLE_ID) {
      console.error('Faltan configuraciones de Telegram o Airtable');
      return;
    }

    // Obtener usuarios de Telegram desde Airtable - Solo notificar a David Hernandez por ahora
    const usersUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TELEGRAM_USERS_TABLE_ID}`;
    
    // Filtrar solo para David Hernandez
    let usersParams = new URLSearchParams({
      filterByFormula: `{Nombre} = "David Hernandez"`,
      maxRecords: '10'
    });

    let usersResponse = await fetch(`${usersUrl}?${usersParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Si el filtro falla, intentar sin filtro y luego filtrar en código
    if (!usersResponse.ok && usersResponse.status === 422) {
      console.log('Filtro por nombre falló, obteniendo todos los usuarios...');
      usersParams = new URLSearchParams({
        maxRecords: '50'
      });
      
      usersResponse = await fetch(`${usersUrl}?${usersParams}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!usersResponse.ok) {
      console.error('Error al obtener usuarios de Telegram:', usersResponse.status);
      try {
        const errorData = await usersResponse.text();
        console.error('Detalles del error:', errorData);
      } catch (e) {
        console.error('No se pudo obtener detalles del error');
      }
      return;
    }

    const usersData = await usersResponse.json();
    let telegramUsers: TelegramUser[] = usersData.records || [];

    // Filtrar para que solo notifique a David Hernandez
    telegramUsers = telegramUsers.filter(user => {
      return user.fields.Nombre === "David Hernandez";
    });

    if (telegramUsers.length === 0) {
      console.log('No se encontró a David Hernandez en la lista de usuarios de Telegram');
      return;
    }

    console.log(`📋 Se notificará solo a: ${telegramUsers.map(u => u.fields.Nombre).join(', ')}`);

    // Crear el mensaje de notificación
    const mensaje = crearMensajeNotificacion(pedidoData);

    // Enviar mensaje a cada usuario activo
    let usuariosNotificados = 0;
    for (const user of telegramUsers) {
      const chatId = user.fields.ID_Chat;
      if (!chatId) {
        console.log(`❌ Usuario ${user.fields.Nombre} no tiene Chat ID configurado`);
        continue;
      }

      const exitoso = await enviarMensajeTelegram(TELEGRAM_BOT_TOKEN, chatId, mensaje);
      if (exitoso) {
        usuariosNotificados++;
        console.log(`✅ Notificación enviada a: ${user.fields.Nombre} (Chat ID: ${chatId})`);
      } else {
        console.log(`❌ Error al notificar a: ${user.fields.Nombre} (Chat ID: ${chatId})`);
      }
    }

    console.log(`📊 Resumen: ${usuariosNotificados}/${telegramUsers.length} usuarios notificados exitosamente`);

  } catch (error) {
    console.error('❌ Error general al enviar notificación por Telegram:', error);
  }
}

function crearMensajeNotificacion(pedidoData: PedidoData): string {
  const fecha = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const precioPorKg = 1190;

  let mensaje = `🚨 *NUEVO PEDIDO DE BIOCHAR BLEND* 🚨\n\n`;
  
  // Información del cliente
  mensaje += `👤 *DATOS DEL CLIENTE*\n`;
  mensaje += `• *Nombre:* ${pedidoData.nombreCliente}\n`;
  mensaje += `• *Cédula:* ${pedidoData.cedula}\n`;
  if (pedidoData.razonSocialCliente) {
    mensaje += `• *Razón Social:* ${pedidoData.razonSocialCliente}\n`;
  }
  mensaje += `\n`;
  
  // Información del pedido
  mensaje += `📦 *DETALLES DEL PEDIDO*\n`;
  mensaje += `• *Cantidad:* ${pedidoData.cantidad} kg\n`;
  mensaje += `• *Tipo de Envase:* ${pedidoData.unidadMedida}\n`;

  // Mostrar conversión automática según el tipo
  if (pedidoData.cantidadBigBags && pedidoData.cantidadBigBags > 0) {
    mensaje += `• *BigBags necesarios:* ${pedidoData.cantidadBigBags} unidades (600 kg c/u)\n`;
  }

  if (pedidoData.cantidadLonas && pedidoData.cantidadLonas > 0) {
    mensaje += `• *Lonas necesarias:* ${pedidoData.cantidadLonas} unidades (35 kg c/u)\n`;
  }

  if (pedidoData.destino) {
    mensaje += `• *Destino:* ${pedidoData.destino}\n`;
  }
  
  // Información financiera
  mensaje += `\n💰 *INFORMACIÓN FINANCIERA*\n`;
  mensaje += `• *Precio por kg:* $${precioPorKg.toLocaleString('es-CO')} COP\n`;
  mensaje += `• *Valor Total:* $${pedidoData.precioTotal.toLocaleString('es-CO')} COP\n\n`;

  // Información operativa
  mensaje += `⚙️ *INFORMACIÓN OPERATIVA*\n`;
  mensaje += `• *Fecha del Pedido:* ${fecha}\n`;
  mensaje += `• *Estado:* En proceso\n`;
  mensaje += `• *Origen:* Plataforma Web\n`;
  mensaje += `• *Operador Responsable:* Sistema Web\n\n`;
  
  mensaje += `🔔 *Este pedido requiere tu atención inmediata para ser procesado.*\n\n`;
  mensaje += `_Sirius Regenerative Solutions S.A.S ZOMAC_`;

  return mensaje;
}

async function enviarMensajeTelegram(botToken: string, chatId: string, mensaje: string): Promise<boolean> {
  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: 'Markdown'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al enviar mensaje de Telegram:', errorData);
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error('Error al conectar con Telegram API:', error);
    return false;
  }
}
