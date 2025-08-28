"use client";
import { useState } from "react";

// Configuración simplificada - Ahora todo se hace server-side
console.log('🔧 CONFIGURACIÓN INICIAL CARGADA');
console.log('🌐 Variables de entorno del servidor (sin NEXT_PUBLIC_):', {
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...` : 'FALTANTE',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? `${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 8)}...` : 'FALTANTE',
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? `${process.env.AIRTABLE_API_KEY.substring(0, 8)}...` : 'FALTANTE',
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  COTIZACIONES_PAGINA_TABLE_ID: process.env.COTIZACIONES_PAGINA_TABLE_ID
});

export default function CotizacionPage() {
  type ProductoSeleccionado = {
    id: string;
    categoria: keyof typeof productos | '';
    productoId: string;
    cantidad: number;
  };

  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [mostrarCotizacion, setMostrarCotizacion] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarResumenPrecios, setMostrarResumenPrecios] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Función para descargar el PDF
  const descargarPDF = async () => {
    if (!pdfUrl) return;

    try {
      // Usar el endpoint proxy para evitar problemas de CORS
      const proxyUrl = `/api/download-pdf?url=${encodeURIComponent(pdfUrl)}`;
      window.open(proxyUrl, '_blank');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      alert('Error al descargar el archivo. Inténtalo de nuevo.');
    }
  };
  const [datosContacto, setDatosContacto] = useState({
    nombre: '',
    telefono: '',
    empresa: '',
    correo: '',
    aceptaPolitica: false
  });

  const productos = {
    microorganismos: [
      { id: 'TR', nombre: 'Trichoderma harzianum', tipo: 'Hongo', codigo: 'TR', unidad: 'litros', precio: 38000 },
      { id: 'MT', nombre: 'Metarhizium anisopliae', tipo: 'Hongo', codigo: 'MT', unidad: 'litros', precio: 38000 },
      { id: 'PL', nombre: 'Purpureocillium lilacinum', tipo: 'Hongo', codigo: 'PL', unidad: 'litros', precio: 38000 },
      { id: 'BV', nombre: 'Beauveria bassiana', tipo: 'Hongo', codigo: 'BV', unidad: 'litros', precio: 38000 },
      { id: 'BT', nombre: 'Bacillus thuringiensis', tipo: 'Bacteria', codigo: 'BT', unidad: 'litros', precio: 38000 },
      { id: 'SB', nombre: 'Siriusbacter', tipo: 'Bacteria', codigo: 'SB', unidad: 'litros', precio: 38000 }
    ],
    biochar: [
      { id: 'BB', nombre: 'Biochar Blend', tipo: 'Biochar', codigo: 'BB', unidad: 'kg', precio: 1190 },
      { id: 'BC', nombre: 'Biochar', tipo: 'Biochar', codigo: 'BC', unidad: 'kg', precio: 2000 }
    ]
  };

  // Función para calcular el subtotal de un producto
  const calcularSubtotal = (producto: any, cantidad: number) => {
    return producto.precio * cantidad;
  };

  // Función para calcular el total general
  const calcularTotal = () => {
    return productosSeleccionados.reduce((total, item) => {
      const producto = getProductoInfo(item.categoria, item.productoId);
      if (producto) {
        return total + calcularSubtotal(producto, item.cantidad);
      }
      return total;
    }, 0);
  };

  // Función para formatear precios
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const agregarProducto = () => {
    const nuevoId = Date.now().toString();
    setProductosSeleccionados([...productosSeleccionados, {
      id: nuevoId,
      categoria: '',
      productoId: '',
      cantidad: 1
    }]);
  };

  const eliminarProducto = (id: string) => {
    setProductosSeleccionados(productosSeleccionados.filter(p => p.id !== id));
  };

  const actualizarProducto = (id: string, campo: string, valor: any) => {
    setProductosSeleccionados(productosSeleccionados.map(p => {
      if (p.id === id) {
        const updated = { ...p, [campo]: valor };
        if (campo === 'categoria') {
          updated.productoId = '';
        }
        return updated;
      }
      return p;
    }));
  };

  const getProductoInfo = (categoria: keyof typeof productos | '', productoId: string) => {
    if (!categoria || !productoId) return null;
    return productos[categoria as keyof typeof productos]?.find((p: any) => p.id === productoId);
  };

  const validarSeleccion = () => {
    return productosSeleccionados.every(p => 
      p.categoria && p.productoId && p.cantidad > 0
    ) && productosSeleccionados.length > 0;
  };

  const handleSolicitarCotizacion = () => {
    if (!validarSeleccion()) {
      alert('Por favor completa todos los campos de los productos seleccionados');
      return;
    }
    setMostrarFormulario(true);
  };

  const handleEnviarCotizacion = async () => {
    console.log('🚀 INICIANDO PROCESO DE COTIZACIÓN');
    console.log('📋 Datos de contacto actuales:', datosContacto);

    if (!datosContacto.nombre || !datosContacto.telefono || !datosContacto.empresa ||
        !datosContacto.correo || !datosContacto.aceptaPolitica) {
      console.log('❌ VALIDACIÓN FALLIDA: Faltan campos obligatorios');
      alert('Por favor completa todos los campos y acepta la política de privacidad');
      return;
    }

    console.log('✅ VALIDACIÓN PASADA: Todos los campos completos');
    setIsLoading(true);
    setError(null);

    try {
      console.log('� ENVIANDO DATOS AL SERVIDOR...');

      const response = await fetch(`${process.env.BASE_URL || ''}/api/cotizacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productosSeleccionados,
          datosContacto
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error en el servidor');
      }

      console.log('🎉 PROCESO COMPLETADO EXITOSAMENTE');
      console.log('📄 PDF URL:', result.pdfUrl);

      // Guardar la URL del PDF para el botón de descarga
      setPdfUrl(result.pdfUrl);

      setMostrarFormulario(false);
      setMostrarResumenPrecios(true);
    } catch (err) {
      console.error('💥 ERROR EN PROCESO DE COTIZACIÓN:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar la cotización');
    } finally {
      console.log('🔄 FINALIZANDO PROCESO - Set loading to false');
      setIsLoading(false);
    }
  };

  if (mostrarCotizacion) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
          <img src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg" alt="Fondo Sirius" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="max-w-3xl mx-auto w-full px-4">
          {/* Header minimalista */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-light text-white mb-3">Cotización Enviada</h1>
            <p className="text-lg text-gray-200 font-light">
              Te contactaremos pronto con tu propuesta personalizada
            </p>
          </div>

          {/* Card principal */}
          <div className="bg-white bg-opacity-75 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Resumen de productos */}
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-light text-gray-900 mb-6">Productos Seleccionados</h2>
              <div className="space-y-4">
                {productosSeleccionados.map((item, index) => {
                  const producto = getProductoInfo(item.categoria, item.productoId);
                  return (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{producto?.nombre}</h3>
                          <p className="text-sm text-gray-500">{producto?.codigo} • {producto?.tipo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.cantidad} {producto?.unidad}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Acciones */}
            <div className="p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setMostrarCotizacion(false)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Modificar Selección
                </button>
                <button className="flex-1 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-medium hover:bg-emerald-600 transition-all duration-200">
                  Confirmar Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de resumen de precios
  if (mostrarResumenPrecios) {
    return (
      <div className="min-h-screen relative" style={{
        backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full px-4">
            {/* Header */}
            <div className="text-center py-16">
              <h1 className="text-5xl font-light text-white mb-4">Resumen de Cotización</h1>
              <p className="text-xl text-gray-200 font-light max-w-2xl mx-auto">
                Revisa los precios y detalles de tu selección
              </p>
            </div>

            {/* Contenido principal */}
            <div className="bg-white bg-opacity-75 backdrop-blur-lg rounded-3xl shadow-xl p-8">
              {/* Tabla de productos con precios */}
              <div className="mb-12">
                <h2 className="text-3xl font-light text-gray-900 mb-8">Productos Seleccionados</h2>
                <div className="space-y-6">
                  {productosSeleccionados.map((item, index) => {
                    const producto = getProductoInfo(item.categoria, item.productoId);
                    if (!producto) return null;

                    const subtotal = calcularSubtotal(producto, item.cantidad);
                    return (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-light text-gray-900">{producto.nombre}</h3>
                              <p className="text-sm text-gray-500">{producto.codigo} • {producto.tipo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">{formatearPrecio(subtotal)}</p>
                            <p className="text-sm text-gray-500">{item.cantidad} {producto.unidad} x {formatearPrecio(producto.precio)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen de precios */}
              <div className="bg-gray-50 rounded-3xl p-8 mb-8">
                <h3 className="text-2xl font-light text-gray-900 mb-6">Resumen de Precios</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 text-2xl font-bold text-emerald-600 bg-emerald-50 px-6 py-4 rounded-2xl">
                    <span>TOTAL:</span>
                    <span>{formatearPrecio(calcularTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Información de precios */}
              <div className="bg-blue-50 rounded-3xl p-8 mb-8">
                <h3 className="text-xl font-light text-blue-900 mb-4">Información de Precios</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <h4 className="font-medium text-blue-900 mb-2">Microorganismos</h4>
                    <p className="text-sm text-blue-700">$38,000 por litro</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🪨</span>
                    </div>
                    <h4 className="font-medium text-blue-900 mb-2">Biochar Blend</h4>
                    <p className="text-sm text-blue-700">$1,190 por kg</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <h4 className="font-medium text-blue-900 mb-2">Biochar Puro</h4>
                    <p className="text-sm text-blue-700">$2,000 por kg</p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  onClick={() => {
                    setMostrarResumenPrecios(false);
                    setMostrarFormulario(true);
                  }}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Volver atrás</span>
                </button>
                
                {pdfUrl && (
                  <button
                    onClick={descargarPDF}
                    className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Descargar Cotización</span>
                  </button>
                )}
                
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Volverme cliente</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {mostrarFormulario ? (
          <div className="max-w-2xl mx-auto w-full px-4">
            {/* Header del formulario */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-light text-white mb-3">Datos de Contacto</h1>
              <p className="text-lg text-gray-200 font-light">
                Complete sus datos para finalizar la solicitud de cotización
              </p>
            </div>
            
            {/* Formulario de contacto */}
            <div className="bg-white bg-opacity-75 backdrop-blur-lg rounded-3xl shadow-xl p-8">
              <div className="space-y-6">
                {/* Nombre personal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Nombre personal *</label>
                  <input
                    type="text"
                    value={datosContacto.nombre}
                    onChange={(e) => setDatosContacto({...datosContacto, nombre: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ingrese su nombre completo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Número telefónico *</label>
                    <input
                      type="tel"
                      value={datosContacto.telefono}
                      onChange={(e) => setDatosContacto({...datosContacto, telefono: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Nombre de la empresa *</label>
                    <input
                      type="text"
                      value={datosContacto.empresa}
                      onChange={(e) => setDatosContacto({...datosContacto, empresa: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nombre de su empresa"
                    />
                  </div>
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Correo electrónico *</label>
                  <input
                    type="email"
                    value={datosContacto.correo}
                    onChange={(e) => setDatosContacto({...datosContacto, correo: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                {/* Checkbox política de privacidad */}
                <div className="flex items-start space-x-3 pt-4">
                  <input
                    type="checkbox"
                    id="politica"
                    checked={datosContacto.aceptaPolitica}
                    onChange={(e) => setDatosContacto({...datosContacto, aceptaPolitica: e.target.checked})}
                    className="mt-1 w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="politica" className="text-sm text-gray-700">
                    Acepto el manejo de mis datos personales de acuerdo con la{' '}
                    <a 
                      href="https://www.siriusregenerative.co/privacypolicy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 underline font-medium"
                    >
                      Política de Privacidad
                    </a>
                  </label>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setMostrarFormulario(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-all duration-200"
                    disabled={isLoading}
                  >
                    Regresar
                  </button>
                  <button
                    onClick={handleEnviarCotizacion}
                    className="flex-1 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-medium hover:bg-emerald-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={!datosContacto.nombre || !datosContacto.telefono || !datosContacto.empresa || !datosContacto.correo || !datosContacto.aceptaPolitica || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      'Generar Cotización'
                    )}
                  </button>
                </div>

                {/* Mostrar error si existe */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-700 font-medium">Error:</span>
                    </div>
                    <p className="text-red-600 mt-1">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : mostrarCotizacion ? (
          <div className="max-w-3xl mx-auto w-full px-4">
            {/* Header minimalista */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-light text-white mb-3">Cotización Enviada</h1>
              <p className="text-lg text-gray-200 font-light">
                Te contactaremos pronto con tu propuesta personalizada
              </p>
            </div>
            {/* Card principal */}
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Resumen de productos */}
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-light text-gray-900 mb-6">Productos Seleccionados</h2>
                <div className="space-y-4">
                  {productosSeleccionados.map((item, index) => {
                    const producto = getProductoInfo(item.categoria, item.productoId);
                    return (
                      <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{producto?.nombre}</h3>
                            <p className="text-sm text-gray-500">{producto?.codigo} • {producto?.tipo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{item.cantidad} {producto?.unidad}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Acciones */}
              <div className="p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setMostrarCotizacion(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Modificar Selección
                  </button>
                  <button className="flex-1 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-medium hover:bg-emerald-600 transition-all duration-200">
                    Confirmar Solicitud
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full px-4">
            {/* Header */}
            <div className="text-center py-16">
              <h1 className="text-5xl font-light text-white mb-4">Solicitar Cotización</h1>
              <p className="text-xl text-gray-200 font-light max-w-2xl mx-auto">
                Selecciona los productos y cantidades que necesitas para tu proyecto
              </p>
            </div>
            {/* Contenido principal */}
            <div className="bg-white bg-opacity-75 backdrop-blur-lg rounded-3xl shadow-xl p-8">
              {/* Productos seleccionados */}
              {productosSeleccionados.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-light text-gray-900 mb-8">Productos Seleccionados</h2>
                  <div className="space-y-6">
                    {productosSeleccionados.map((item, index) => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <h3 className="text-xl font-light text-gray-900">Producto {index + 1}</h3>
                          </div>
                          <button
                            onClick={() => eliminarProducto(item.id)}
                            className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors duration-200"
                          >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Categoría */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Categoría</label>
                            <select
                              value={item.categoria}
                              onChange={(e) => actualizarProducto(item.id, 'categoria', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="">Seleccionar</option>
                              <option value="microorganismos">Microorganismos</option>
                              <option value="biochar">Biochar</option>
                            </select>
                          </div>
                          {/* Producto */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Producto</label>
                            <select
                              value={item.productoId}
                              onChange={(e) => actualizarProducto(item.id, 'productoId', e.target.value)}
                              disabled={!item.categoria}
                              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-400"
                            >
                              <option value="">Seleccionar</option>
                              {item.categoria && productos[item.categoria]?.map(producto => (
                                <option key={producto.id} value={producto.id}>
                                  {producto.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* Cantidad */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Cantidad
                              {(() => {
                                const info = item.productoId ? getProductoInfo(item.categoria, item.productoId) : null;
                                return info?.unidad ? (
                                  <span className="text-gray-500 font-normal"> ({info.unidad})</span>
                                ) : null;
                              })()}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => actualizarProducto(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Estado vacío */}
              {productosSeleccionados.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-light text-gray-900 mb-2">Sin productos seleccionados</h3>
                  <p className="text-lg text-gray-500 mb-8">Comienza agregando productos a tu cotización</p>
                </div>
              )}
              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  onClick={agregarProducto}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Agregar Producto</span>
                </button>
                {productosSeleccionados.length > 0 && (
                  <button
                    onClick={handleSolicitarCotizacion}
                    disabled={!validarSeleccion()}
                    className={`px-12 py-4 rounded-2xl font-medium transition-all duration-200 ${
                      validarSeleccion()
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Solicitar Cotización
                    {productosSeleccionados.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded-lg text-sm">
                        {productosSeleccionados.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}