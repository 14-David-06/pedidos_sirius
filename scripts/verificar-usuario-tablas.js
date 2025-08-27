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
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;
const NOMBRE_COMPLETO_FIELD = process.env.NOMBRE_COMPLETO_FIELD || 'Nombre Completo';
const ROL_USUARIO_FIELD = process.env.ROL_USUARIO_FIELD || 'Rol Usuario';

// Validar variables de entorno requeridas
const requiredEnvVars = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'USUARIOS_RAIZ_TABLE_ID', 'USUARIOS_TABLE_ID'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Variable de entorno faltante: ${envVar}`);
        process.exit(1);
    }
}

// Obtener el userId desde argumentos de línea de comandos
const userId = process.argv[2];
if (!userId) {
    console.log('❌ Error: Debes proporcionar el userId como argumento.');
    console.log('   Ejemplo: node scripts/verificar-usuario-tablas.js <USER_ID>');
    process.exit(1);
}

async function verificarUsuarioEnTablas() {
    console.log('🔍 Verificando usuario:', userId);
    console.log('📋 Tabla raíz ID:', USUARIOS_RAIZ_TABLE_ID);
    console.log('📋 Tabla usuarios ID:', USUARIOS_TABLE_ID);
    console.log('');

    // 1. Buscar en tabla raíz con GET directo
    console.log('🔍 1. Buscando en tabla RAÍZ con GET directo...');
    try {
        const rootResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('   Status:', rootResponse.status, rootResponse.statusText);
        
        if (rootResponse.ok) {
            const data = await rootResponse.json();
            console.log('   ✅ ENCONTRADO en tabla raíz:');
            console.log('   - ID:', data.id);
            console.log('   - Campos:', Object.keys(data.fields));
        } else {
            const errorText = await rootResponse.text();
            console.log('   ❌ NO encontrado en tabla raíz:', errorText);
        }
    } catch (error) {
        console.log('   💥 Error buscando en tabla raíz:', error.message);
    }

    console.log('');

    // 2. Buscar en tabla usuarios con GET directo
    console.log('🔍 2. Buscando en tabla USUARIOS con GET directo...');
    try {
        const userResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('   Status:', userResponse.status, userResponse.statusText);
        
        if (userResponse.ok) {
            const data = await userResponse.json();
            console.log('   ✅ ENCONTRADO en tabla usuarios:');
            console.log('   - ID:', data.id);
            console.log('   - Campos:', Object.keys(data.fields));
            console.log(`   - Nombre:`, data.fields[NOMBRE_COMPLETO_FIELD] || 'N/A');
            console.log(`   - Rol:`, data.fields[ROL_USUARIO_FIELD] || 'N/A');
        } else {
            const errorText = await userResponse.text();
            console.log('   ❌ NO encontrado en tabla usuarios:', errorText);
        }
    } catch (error) {
        console.log('   💥 Error buscando en tabla usuarios:', error.message);
    }

    console.log('');
    console.log('🎯 CONCLUSIÓN:');
    console.log('   El error indica que el campo Entidad está configurado para');
    console.log(`   enlazar con la tabla ${USUARIOS_RAIZ_TABLE_ID} (raíz) pero el ID`);
    console.log(`   ${userId} pertenece a la tabla ${USUARIOS_TABLE_ID} (usuarios)`);
    console.log('');
    console.log('💡 RECOMENDACIONES:');
    console.log('   1. Verifica que el ID del usuario sea correcto');
    console.log('   2. Confirma que el campo Entidad esté enlazando a la tabla correcta');
    console.log('   3. Revisa los permisos de enlace entre tablas en Airtable');
}

// Ejecutar la función
verificarUsuarioEnTablas().catch(console.error);
