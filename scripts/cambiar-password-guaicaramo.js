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

// Configuración adicional desde variables de entorno
const TARGET_USERNAME = process.env.TARGET_USERNAME;
const USUARIO_FIELD = process.env.USUARIO_FIELD || 'Usuario';
const NOMBRE_COMPLETO_FIELD = process.env.NOMBRE_COMPLETO_FIELD || 'Nombre Completo';
const NOMBRE_RAZON_SOCIAL_FIELD = process.env.NOMBRE_RAZON_SOCIAL_FIELD || 'Nombre Razon Social';
const HASH_FIELD = process.env.HASH_FIELD || 'Hash';
const SALT_FIELD = process.env.SALT_FIELD || 'Salt';
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || '123456';

// Validar variables de entorno requeridas
const requiredEnvVars = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'USUARIOS_RAIZ_TABLE_ID', 'TARGET_USERNAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Variable de entorno faltante: ${envVar}`);
        process.exit(1);
    }
}

function generateSalt() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function hashPassword(password, salt) {
    return pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function cambiarPasswordGuaicaramo() {
    console.log(`🔐 Iniciando cambio de contraseña para ${TARGET_USERNAME}...`);
    
    try {
        // Primero buscar el usuario
        const searchResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}?filterByFormula={${USUARIO_FIELD}}='${TARGET_USERNAME}'`, {
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
            console.log(`❌ Usuario ${TARGET_USERNAME} no encontrado`);
            return;
        }

        const userRecord = searchData.records[0];
        console.log('👤 Usuario encontrado:', {
            id: userRecord.id,
            usuario: userRecord.fields[USUARIO_FIELD],
            nombre: userRecord.fields[NOMBRE_COMPLETO_FIELD] || userRecord.fields[NOMBRE_RAZON_SOCIAL_FIELD],
            fields: Object.keys(userRecord.fields)
        });

        // Generar nuevo salt y hash para la contraseña
        const newPassword = DEFAULT_PASSWORD;
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
                    [HASH_FIELD]: newHash,
                    [SALT_FIELD]: newSalt
                }
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error actualizando contraseña: ${updateResponse.status} - ${errorText}`);
        }

        const result = await updateResponse.json();
        console.log(`✅ Contraseña actualizada exitosamente para ${TARGET_USERNAME}`);
        console.log(`🔑 Nueva contraseña: ${DEFAULT_PASSWORD}`);
        console.log('🧂 Nuevo salt:', newSalt);
        console.log('🔐 Nuevo hash:', newHash.substring(0, 20) + '...');
        
    } catch (error) {
        console.error('💥 Error cambiando contraseña:', error.message);
    }
}

// Ejecutar el cambio
cambiarPasswordGuaicaramo();
