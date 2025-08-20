const fetch = require('node-fetch');
const { pbkdf2Sync } = require('crypto');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            const value = valueParts.join('=');
            process.env[key] = value;
        }
    }
    console.log('✅ Variables de entorno cargadas desde .env.local');
} else {
    console.log('❌ No se encontró el archivo .env.local');
}

// Configuración de Airtable desde las variables de entorno
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_RAIZ_TABLE_ID = process.env.USUARIOS_RAIZ_TABLE_ID;

function generateSalt() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function hashPassword(password, salt) {
    return pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function cambiarPasswordGuaicaramo() {
    console.log('🔐 Iniciando cambio de contraseña para guaicaramo...');
    
    try {
        // Primero buscar el usuario guaicaramo
        const searchResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}?filterByFormula={Usuario}='guaicaramo'`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!searchResponse.ok) {
            throw new Error(`Error buscando usuario: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        
        if (!searchData.records || searchData.records.length === 0) {
            console.log('❌ Usuario guaicaramo no encontrado');
            return;
        }

        const userRecord = searchData.records[0];
        console.log('👤 Usuario encontrado:', {
            id: userRecord.id,
            usuario: userRecord.fields.Usuario,
            nombre: userRecord.fields['Nombre Completo'] || userRecord.fields['Nombre Razon Social'],
            fields: Object.keys(userRecord.fields)
        });

        // Generar nuevo salt y hash para la contraseña "123456"
        const newPassword = '123456';
        const newSalt = generateSalt();
        const newHash = hashPassword(newPassword, newSalt);

        console.log('🔑 Generando nuevas credenciales:', {
            password: newPassword,
            saltLength: newSalt.length,
            hashLength: newHash.length
        });

        // Actualizar la contraseña con Hash y Salt
        const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}/${userRecord.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    'Hash': newHash,
                    'Salt': newSalt
                }
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error actualizando contraseña: ${updateResponse.status} - ${errorText}`);
        }

        const result = await updateResponse.json();
        console.log('✅ Contraseña actualizada exitosamente para guaicaramo');
        console.log('🔑 Nueva contraseña: 123456');
        console.log('🧂 Nuevo salt:', newSalt);
        console.log('🔐 Nuevo hash:', newHash.substring(0, 20) + '...');
        
    } catch (error) {
        console.error('💥 Error cambiando contraseña:', error.message);
    }
}

// Ejecutar el cambio
cambiarPasswordGuaicaramo();
