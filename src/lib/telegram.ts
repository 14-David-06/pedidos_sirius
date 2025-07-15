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

    // Obtener usuarios de Telegram desde Airtable
    const usersUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TELEGRAM_USERS_TABLE_ID}`;
    const usersParams = new URLSearchParams({
      filterByFormula: `{Nombre} = "David Hernandez"`, // Por ahora solo notificar a David Hernandez
      maxRecords: '10'
    });

    const usersResponse = await fetch(`${usersUrl}?${usersParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!usersResponse.ok) {
      console.error('Error al obtener usuarios de Telegram:', usersResponse.status);
      return;
    }

    const usersData = await usersResponse.json();
    const telegramUsers: TelegramUser[] = usersData.records || [];

    if (telegramUsers.length === 0) {
      console.log('No se encontraron usuarios de Telegram para notificar');
      return;
    }

    // Crear el mensaje de notificación
    const mensaje = crearMensajeNotificacion(pedidoData);

    // Enviar mensaje a cada usuario
    for (const user of telegramUsers) {
      const chatId = user.fields.ID_Chat;
      if (!chatId) {
        console.log(`Usuario ${user.fields.Nombre} no tiene Chat ID configurado`);
        continue;
      }

      await enviarMensajeTelegram(TELEGRAM_BOT_TOKEN, chatId, mensaje);
    }

  } catch (error) {
    console.error('Error al enviar notificación por Telegram:', error);
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

  let mensaje = `🔔 *NUEVO PEDIDO DE BIOCHAR BLEND*\n\n`;
  mensaje += `📅 *Fecha:* ${fecha}\n`;
  mensaje += `👤 *Cliente:* ${pedidoData.nombreCliente}\n`;
  mensaje += `🆔 *Cédula:* ${pedidoData.cedula}\n`;
  mensaje += `⚖️ *Cantidad:* ${pedidoData.cantidad} kg\n`;
  mensaje += `📦 *Tipo de Envase:* ${pedidoData.unidadMedida}\n`;

  if (pedidoData.cantidadBigBags && pedidoData.cantidadBigBags > 0) {
    mensaje += `🛍️ *BigBags:* ${pedidoData.cantidadBigBags}\n`;
  }

  if (pedidoData.cantidadLonas && pedidoData.cantidadLonas > 0) {
    mensaje += `📋 *Lonas:* ${pedidoData.cantidadLonas}\n`;
  }

  mensaje += `💰 *Valor Total:* $${pedidoData.precioTotal.toLocaleString('es-CO')} COP\n`;

  if (pedidoData.destino) {
    mensaje += `🎯 *Destino:* ${pedidoData.destino}\n`;
  }

  mensaje += `\n✅ *Estado:* En proceso\n`;
  mensaje += `🤖 *Origen:* Plataforma Web\n\n`;
  mensaje += `_Este pedido requiere tu atención para ser procesado._`;

  return mensaje;
}

async function enviarMensajeTelegram(botToken: string, chatId: string, mensaje: string): Promise<void> {
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
    } else {
      console.log(`✅ Notificación enviada exitosamente a chat ID: ${chatId}`);
    }
  } catch (error) {
    console.error('Error al conectar con Telegram API:', error);
  }
}
