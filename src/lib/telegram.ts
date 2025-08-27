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
      // Filtro falló, obteniendo todos los usuarios como fallback
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
      return;
    }

    const usersData = await usersResponse.json();
    let telegramUsers: TelegramUser[] = usersData.records || [];

    // Filtrar para que solo notifique a David Hernandez
    telegramUsers = telegramUsers.filter(user => {
      return user.fields.Nombre === "David Hernandez";
    });

    if (telegramUsers.length === 0) {
      return;
    }

    // Crear el mensaje de notificación
    const mensaje = crearMensajeNotificacion(pedidoData);

    // Enviar mensaje a cada usuario activo
    let usuariosNotificados = 0;
    for (const user of telegramUsers) {
      const chatId = user.fields.ID_Chat;
      if (!chatId) {
        continue;
      }

      const exitoso = await enviarMensajeTelegram(TELEGRAM_BOT_TOKEN, chatId, mensaje);
      if (exitoso) {
        usuariosNotificados++;
      }
    }

  } catch (error) {
    // Error interno en el sistema de notificaciones
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

  let mensaje = `🚨 <b>NUEVO PEDIDO DE BIOCHAR BLEND</b> 🚨\n\n`;
  
  // Información del cliente
  mensaje += `👤 <b>DATOS DEL CLIENTE</b>\n`;
  mensaje += `• <b>Nombre:</b> ${pedidoData.nombreCliente}\n`;
  mensaje += `• <b>Cédula:</b> ${pedidoData.cedula}\n`;
  if (pedidoData.razonSocialCliente) {
    mensaje += `• <b>Razón Social:</b> ${pedidoData.razonSocialCliente}\n`;
  }
  mensaje += `\n`;
  
  // Información del pedido
  mensaje += `📦 <b>DETALLES DEL PEDIDO</b>\n`;
  mensaje += `• <b>Cantidad:</b> ${pedidoData.cantidad} kg\n`;
  mensaje += `• <b>Tipo de Envase:</b> ${pedidoData.unidadMedida}\n`;

  // Mostrar conversión automática según el tipo
  if (pedidoData.cantidadBigBags && pedidoData.cantidadBigBags > 0) {
    mensaje += `• <b>BigBags necesarios:</b> ${pedidoData.cantidadBigBags} unidades (600 kg c/u)\n`;
  }

  if (pedidoData.cantidadLonas && pedidoData.cantidadLonas > 0) {
    mensaje += `• <b>Lonas necesarias:</b> ${pedidoData.cantidadLonas} unidades (35 kg c/u)\n`;
  }

  if (pedidoData.destino) {
    mensaje += `• <b>Destino:</b> ${pedidoData.destino}\n`;
  }
  
  // Información financiera
  mensaje += `\n💰 <b>INFORMACIÓN FINANCIERA</b>\n`;
  mensaje += `• <b>4r4e3w2q
 }o9u76yt5 por kg:</b> $${precioPorKg.toLocaleString('es-CO')} COP\n`;
  mensaje += `• <b>Valor Total:</b> $${pedidoData.precioTotal.toLocaleString('es-CO')} COP\n\n`;

  // Información operativa
  mensaje += `⚙️ <b>INFORMACIÓN OPERATIVA</b>\n`;
  mensaje += `• <b>Fecha del Pedido:</b> ${fecha}\n`;
  mensaje += `• <b>Estado:</b> En proceso\n`;
  mensaje += `• <b>Origen:</b> Plataforma Web\n`;
  mensaje += `• <b>Operador Responsable:</b> Sistema Web\n\n`;
  
  mensaje += `🔔 Este pedido requiere tu atención inmediata para ser procesado.\n\n`;
  mensaje += `Sirius Regenerative Solutions S.A.S ZOMAC`;

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
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Activar Preparacion de Biochar Blend",
              switch_inline_query_current_chat: "Biochar Blend"
            }
          ]]
        }
      }),
    });

    if (!response.ok) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
}
