const fs = require('fs');

async function testLogin() {
  console.log('🔐 Iniciando test de login...');
  
  try {
    // Datos del último usuario creado en el test anterior
    const loginData = {
      usuario: 'testuser1753805072047', // Usuario recién creado con hash y salt
      password: '123456' // Contraseña que sabemos que se usó
    };
    
    console.log('📝 Datos de login:', { usuario: loginData.usuario, password: '***' });
    
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const responseText = await response.text();
    
    console.log('\n📊 RESULTADO DEL LOGIN:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('\n✅ LOGIN EXITOSO');
      const result = JSON.parse(responseText);
      console.log('👤 Usuario logueado:', result.user?.usuario);
      console.log('🏢 Empresa:', result.user?.nombre);
      console.log('📄 Documento:', result.user?.documento);
    } else {
      console.log('\n❌ LOGIN FALLIDO');
      try {
        const error = JSON.parse(responseText);
        console.log('Error:', error.error);
      } catch (e) {
        console.log('Error response:', responseText);
      }
    }
    
  } catch (error) {
    console.error('\n💥 ERROR EN EL TEST:', error.message);
  }
}

// Función para probar login con credenciales incorrectas
async function testLoginIncorrecto() {
  console.log('\n🔐 Probando login con credenciales incorrectas...');
  
  const loginData = {
    usuario: 'testuser1753805072047',
    password: 'contraseña_incorrecta'
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const responseText = await response.text();
    
    console.log('📊 Test credenciales incorrectas:');
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    
    if (response.status === 401) {
      console.log('✅ Validación correcta: contraseña incorrecta rechazada');
    } else {
      console.log('❌ Error en validación: debería retornar 401');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Función para probar login con usuario inexistente
async function testUsuarioInexistente() {
  console.log('\n🔐 Probando login con usuario inexistente...');
  
  const loginData = {
    usuario: 'usuario_que_no_existe',
    password: '123456'
  };
  
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const responseText = await response.text();
    
    console.log('📊 Test usuario inexistente:');
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    
    if (response.status === 404) {
      console.log('✅ Validación correcta: usuario inexistente rechazado');
    } else {
      console.log('❌ Error en validación: debería retornar 404');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Verificar que el servidor esté corriendo
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'OPTIONS'
    });
    return true;
  } catch (error) {
    console.log('❌ Servidor no disponible en http://localhost:3001');
    console.log('   Asegúrate de ejecutar: npm run dev');
    return false;
  }
}

async function main() {
  console.log('🔍 Verificando servidor...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    return;
  }
  
  console.log('✅ Servidor disponible\n');
  
  // Ejecutar todos los tests
  await testLogin();
  await testLoginIncorrecto();
  await testUsuarioInexistente();
  
  console.log('\n🎯 Tests de login completados');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { testLogin };
