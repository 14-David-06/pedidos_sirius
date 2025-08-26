import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Función para generar hash de contraseña
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export async function POST(request: NextRequest) {
  console.log('🔍 [VERIFY] Verificando contraseña...');
  
  try {
    const body = await request.json();
    const { password, storedHash, storedSalt } = body;
    
    if (!password || !storedHash || !storedSalt) {
      return NextResponse.json({ 
        error: 'Faltan parámetros requeridos: password, storedHash, storedSalt'
      }, { status: 400 });
    }
    
    console.log('🔑 [VERIFY] Datos recibidos:', {
      passwordLength: password.length,
      hashLength: storedHash.length,
      saltLength: storedSalt.length
    });
    
    const generatedHash = hashPassword(password, storedSalt);
    const matches = generatedHash === storedHash;
    
    return NextResponse.json({
      success: true,
      message: 'Verificación de contraseña completada',
      matches: matches,
      generatedHashStart: generatedHash.substring(0, 20) + '...',
      storedHashStart: storedHash.substring(0, 20) + '...'
    });

  } catch (error) {
    console.error('💥 [VERIFY] Error:', error);
    return NextResponse.json({ 
      error: 'Error en verificación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
