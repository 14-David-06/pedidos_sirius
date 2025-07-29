const fs = require('fs');
const path = require('path');

// Crear archivos PDF de prueba
function createTestPDF(filename) {
  // PDF mínimo válido
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
279
%%EOF`;
  
  fs.writeFileSync(filename, pdfContent);
}

async function testRegistroCompleto() {
  console.log('🧪 Iniciando test automatizado de registro...');
  
  // Crear archivos PDF de prueba
  const rutFile = path.join(__dirname, 'test-rut.pdf');
  const camaraFile = path.join(__dirname, 'test-camara.pdf');
  
  createTestPDF(rutFile);
  createTestPDF(camaraFile);
  
  console.log('📄 Archivos PDF de prueba creados');
  
  // Usar fetch nativo con FormData del navegador simulado
  const { FormData, File } = await import('formdata-node');
  const { fileFromPath } = await import('formdata-node/file-from-path');
  
  const formData = new FormData();
  
  // Datos básicos
  formData.append('nombreRazonSocial', 'Test Empresa Automatizada SAS');
  formData.append('tipoDocumento', 'NIT');
  formData.append('documento', `90012345${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10)}`);
  formData.append('usuario', `testuser${Date.now()}`);
  formData.append('password', '123456');
  formData.append('confirmPassword', '123456');
  
  // Ubicación
  formData.append('ciudad', 'Bogotá');
  formData.append('departamento', 'Cundinamarca');
  formData.append('direccion', 'Calle Test #123-45');
  
  // Información empresarial
  formData.append('contribuyente', 'Gran Contribuyente');
  formData.append('tipoCultivo', 'Cítricos');
  
  // Contactos
  formData.append('nombreContable', 'Ana García Test');
  formData.append('telefonoContable', '3101234567');
  formData.append('emailContable', `contabilidad${Date.now()}@testempresa.com`);
  
  formData.append('nombreTesoreria', 'Carlos López Test');
  formData.append('telefonoTesoreria', '3107654321');
  formData.append('emailTesoreria', `tesoreria${Date.now()}@testempresa.com`);
  
  formData.append('nombreCompras', 'María Rodríguez Test');
  formData.append('telefonoCompras', '3109876543');
  formData.append('emailCompras', `compras${Date.now()}@testempresa.com`);
  
  // Archivos usando fileFromPath
  const rutFileNode = await fileFromPath(rutFile, 'test-rut-document.pdf', { type: 'application/pdf' });
  const camaraFileNode = await fileFromPath(camaraFile, 'test-camara-comercio.pdf', { type: 'application/pdf' });
  
  formData.append('rutFile', rutFileNode);
  formData.append('camaraComercioFile', camaraFileNode);
  
  console.log('📦 FormData preparado con todos los campos y archivos');
  
  try {
    console.log('🚀 Enviando petición al API...');
    
    const response = await fetch('http://localhost:3001/api/registro', {
      method: 'POST',
      body: formData
    });
    
    const responseText = await response.text();
    
    console.log('\n📊 RESULTADO DEL TEST:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('\n✅ TEST EXITOSO: Usuario creado correctamente');
      const result = JSON.parse(responseText);
      console.log('👤 Usuario ID:', result.usuario?.id);
      console.log('📋 Contactos creados:', result.contactos?.length || 0);
    } else {
      console.log('\n❌ TEST FALLIDO: Error en la creación');
    }
    
  } catch (error) {
    console.error('\n💥 ERROR EN EL TEST:', error.message);
  } finally {
    // Limpiar archivos de prueba
    try {
      fs.unlinkSync(rutFile);
      fs.unlinkSync(camaraFile);
      console.log('\n🧹 Archivos de prueba eliminados');
    } catch (e) {
      console.log('⚠️ No se pudieron eliminar archivos de prueba');
    }
  }
}

// Verificar que el servidor esté corriendo
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3001/api/registro', {
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
  
  console.log('✅ Servidor disponible, iniciando test...\n');
  await testRegistroCompleto();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { testRegistroCompleto };
