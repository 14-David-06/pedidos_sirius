"use client";
import { useState } from "react";
import logger from '@/lib/logger';

// Configuración simplificada - Ahora todo se hace server-side
logger.log('🔧 CONFIGURACIÓN INICIAL CARGADA');

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
  
  // Estado para manejar cantidades en las tarjetas del marketplace
  const [cantidadesMarketplace, setCantidadesMarketplace] = useState<{[key: string]: number}>({});
  
  // Estado para el modal de imagen
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoModalSeleccionado, setProductoModalSeleccionado] = useState<any>(null);
  const [cantidadModal, setCantidadModal] = useState(1);

  // Función para descargar el PDF
  const descargarPDF = async () => {
    if (!pdfUrl) return;

    try {
      // Usar el endpoint proxy para evitar problemas de CORS
      const proxyUrl = `/api/download-pdf?url=${encodeURIComponent(pdfUrl)}`;
      window.open(proxyUrl, '_blank');
    } catch (error) {
      logger.errorSafe('Error al descargar el PDF', error);
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
    biofertilizantes: [
      { 
        id: 'SD', 
        nombre: 'Star Dust', 
        tipo: 'Biochar', 
        codigo: 'SD', 
        unidad: 'kg', 
        precio: 38000,
        descripcion: 'Carbón vegetal activado con tecnología de pirolisis avanzada, enriquecido con consorcios microbianos específicos. Incrementa la capacidad de intercambio catiónico del suelo, mejora la retención hídrica y establece una base sólida para el ecosistema radicular. Su estructura porosa actúa como refugio para microorganismos beneficiosos, optimizando los ciclos biogeoquímicos y la disponibilidad de nutrientes.',
        categoria: 'Biofertilizante',
        icono: '🦠',
        imagen: '/Star Dust.jpg'
      },
      { 
        id: 'TC', 
        nombre: 'Tricochar', 
        tipo: 'Biochar', 
        codigo: 'TC', 
        unidad: 'kg', 
        precio: 2500,
        descripcion: 'Matriz de carbón bioactivado inoculado con cepas seleccionadas de Trichoderma harzianum. Esta sinergia biotecnológica proporciona control biológico preventivo contra patógenos radiculares, mientras que el biochar mejora las propiedades físico-químicas del sustrato. Estimula la formación de micorrizas y incrementa la eficiencia en la absorción de fósforo y micronutrientes.',
        categoria: 'Biofertilizante',
        icono: '🌿',
        imagen: '/Biochar.webp'
      },
      { 
        id: 'BB', 
        nombre: 'Biochar Blend', 
        tipo: 'Biochar', 
        codigo: 'BB', 
        unidad: 'kg', 
        precio: 1190,
        descripcion: 'Formulación integral que combina carbón vegetal activado, materia orgánica compostada y consorcios microbiológicos multifuncionales. Aporta macro y micronutrientes de liberación controlada, mejora la estructura del suelo aumentando la porosidad y estabilidad de agregados. Facilita la colonización de rizobacterias promotoras del crecimiento vegetal (PGPR) y optimiza los procesos de mineralización.',
        categoria: 'Biofertilizante',
        icono: '🌱',
        imagen: '/Biochar Blend.jpg'
      }
    ],
    biocontroladores: [
      { 
        id: 'TR', 
        nombre: 'Trichoderma Harzianum', 
        tipo: 'Hongo', 
        codigo: 'TR', 
        unidad: 'litros', 
        precio: 38000,
        descripcion: 'Cepa élite de hongo filamentoso con actividad micoparasítica demostrada contra Fusarium, Rhizoctonia, Sclerotinia y Pythium. Produce metabolitos antifúngicos específicos, enzimas quitinolíticas y establece competencia por espacio y nutrientes. Su colonización radicular induce resistencia sistémica adquirida (SAR), mejorando las defensas naturales de la planta y optimizando la absorción de nutrientes.',
        categoria: 'Biocontrolador',
        icono: '🍄',
        imagen: '/Trichoderma Harzianum.jpg'
      },
      { 
        id: 'MT', 
        nombre: 'Metarhizium Anisopliae', 
        tipo: 'Hongo', 
        codigo: 'MT', 
        unidad: 'litros', 
        precio: 38000,
        descripcion: 'Hongo entomopatógeno especializado en el control biológico de coleópteros, hemípteros, lepidópteros y dípteros. Su mecanismo de acción incluye adhesión al tegumento del insecto, penetración cuticular mediante enzimas proteolíticas y colonización hemocélica. Presenta alta especificidad hacia plagas sin afectar insectos benéficos, manteniendo el equilibrio del agroecosistema.',
        categoria: 'Biocontrolador',
        icono: '🕷️',
        imagen: '/Metarhizium.jpg'
      },
      { 
        id: 'PL', 
        nombre: 'Purpureocillium lilacinum', 
        tipo: 'Hongo', 
        codigo: 'PL', 
        unidad: 'litros', 
        precio: 38000,
        descripcion: 'Agente de biocontrol altamente eficaz contra nematodos fitopatógenos incluyendo Meloidogyne, Heterodera, Globodera y Pratylenchus. Su modo de acción involucra la parasitación de huevos mediante enzimas quitinasas y proteasas, destruyendo las masas ovígeras y reduciendo significativamente las poblaciones. Mejora la salud radicular y promueve el desarrollo de sistemas radicales robustos.',
        categoria: 'Biocontrolador',
        icono: '🪱',
        imagen: '/Purpureocillum.jpg'
      },
      { 
        id: 'BV', 
        nombre: 'Beauveria Bassiana', 
        tipo: 'Hongo', 
        codigo: 'BV', 
        unidad: 'litros', 
        precio: 38000,
        descripcion: 'Hongo entomopatógeno de amplio espectro especializado en el control de hemípteros, tisanópteros, afídidos y ácaros fitófagos. Su infección procede por contacto directo, germinación de conidias sobre la cutícula y penetración mediante apresorio. Produce toxinas específicas como bassianolidas que causan disfunción fisiológica en el hospedero, resultando en mortalidad efectiva y sostenida.',
        categoria: 'Biocontrolador',
        icono: '🦗',
        imagen: '/Beaveria.png'
      },
      { 
        id: 'BT', 
        nombre: 'Bacillus thuringiensis', 
        tipo: 'Bacteria', 
        codigo: 'BT', 
        unidad: 'litros', 
        precio: 38000,
        descripcion: 'Bacteria Gram-positiva productora de cristales proteicos (δ-endotoxinas) con actividad insecticida específica contra larvas de lepidópteros. Sus proteínas Cry se activan en el pH alcalino del intestino medio larvario, causando lisis celular y parálisis del sistema digestivo. Altamente selectivo, no afecta organismos no objetivo y es completamente biodegradable en el ambiente.',
        categoria: 'Biocontrolador',
        icono: '🐛',
        imagen: '/Bacillus Thurigensis.png'
      },
      { 
        id: 'SB', 
        nombre: 'SiriusBacter', 
        tipo: 'Bacteria', 
        codigo: 'SB', 
        unidad: 'litros', 
        precio: 38000,
        descripcion: 'Consorcio de rizobacterias promotoras del crecimiento vegetal (PGPR) que incluye cepas de Bacillus, Pseudomonas y Azotobacter. Facilita la solubilización de fosfatos, fijación biológica de nitrógeno y producción de fitohormonas (auxinas, giberelinas, citoquininas). Induce resistencia sistémica inducida (ISR) mediante la activación de rutas de señalización de defensa, optimizando la respuesta ante estrés biótico y abiótico.',
        categoria: 'Biofertilizante',
        icono: '🦠',
        imagen: '/SiriusBacter.png'
      }
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

  // Función para agregar producto al carrito desde el marketplace
  const agregarAlCarrito = (categoria: keyof typeof productos, productoId: string) => {
    const cantidad = cantidadesMarketplace[`${categoria}-${productoId}`] || 1;
    const nuevoId = Date.now().toString();
    setProductosSeleccionados([...productosSeleccionados, {
      id: nuevoId,
      categoria,
      productoId,
      cantidad
    }]);
    
    // Resetear la cantidad después de agregar
    setCantidadesMarketplace(prev => ({
      ...prev,
      [`${categoria}-${productoId}`]: 1
    }));
  };

  // Función para abrir modal con información del producto
  const abrirModal = (producto: any) => {
    setProductoModalSeleccionado(producto);
    setCantidadModal(1); // Resetear cantidad al abrir modal
    setMostrarModal(true);
  };

  // Función para cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);
    setProductoModalSeleccionado(null);
    setCantidadModal(1); // Resetear cantidad al cerrar modal
  };

  // Función para actualizar cantidad en marketplace
  const actualizarCantidadMarketplace = (categoria: keyof typeof productos, productoId: string, cantidad: number) => {
    setCantidadesMarketplace(prev => ({
      ...prev,
      [`${categoria}-${productoId}`]: Math.max(1, cantidad)
    }));
  };

  // Función para obtener cantidad actual del marketplace
  const obtenerCantidadMarketplace = (categoria: keyof typeof productos, productoId: string) => {
    return cantidadesMarketplace[`${categoria}-${productoId}`] || 1;
  };

  // Función para agregar al carrito desde el modal
  const agregarAlCarritoDesdeModal = () => {
    if (productoModalSeleccionado) {
      const nuevoId = Date.now().toString();
      setProductosSeleccionados([...productosSeleccionados, {
        id: nuevoId,
        categoria: productoModalSeleccionado.categoria === 'Biofertilizante' ? 'biofertilizantes' : 'biocontroladores',
        productoId: productoModalSeleccionado.id,
        cantidad: cantidadModal
      }]);
      cerrarModal();
      // El producto se agrega al carrito, pero NO se abre automáticamente la cotización
    }
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
    logger.log('🚀 INICIANDO PROCESO DE COTIZACIÓN');
    logger.logSafe('📋 Datos de contacto', { 
      hasNombre: !!datosContacto.nombre,
      hasEmail: !!datosContacto.correo,
      hasEmpresa: !!datosContacto.empresa
    });

    if (!datosContacto.nombre || !datosContacto.telefono || !datosContacto.empresa ||
        !datosContacto.correo || !datosContacto.aceptaPolitica) {
      logger.log('❌ VALIDACIÓN FALLIDA: Faltan campos obligatorios');
      alert('Por favor completa todos los campos y acepta la política de privacidad');
      return;
    }

    logger.log('✅ VALIDACIÓN PASADA: Todos los campos completos');
    setIsLoading(true);
    setError(null);

    try {
      logger.log('📤 ENVIANDO DATOS AL SERVIDOR...');

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

      logger.log('🎉 PROCESO COMPLETADO EXITOSAMENTE');
      logger.log('📄 PDF generado exitosamente');

      // Guardar la URL del PDF para el botón de descarga
      setPdfUrl(result.pdfUrl);

      setMostrarFormulario(false);
      setMostrarResumenPrecios(true);
    } catch (err) {
      logger.errorSafe('💥 ERROR EN PROCESO DE COTIZACIÓN', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar la cotización');
    } finally {
      logger.log('🔄 FINALIZANDO PROCESO - Set loading to false');
      setIsLoading(false);
    }
  };

  if (mostrarCotizacion) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
          <img src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg" alt="Fondo Sirius" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-xl border border-white border-opacity-30 overflow-hidden">
            {/* Resumen de productos */}
            <div className="p-8 border-b border-white border-opacity-30">
              <h2 className="text-2xl font-light text-white mb-6">Productos Seleccionados</h2>
              <div className="space-y-4">
                {productosSeleccionados.map((item, index) => {
                  const producto = getProductoInfo(item.categoria, item.productoId);
                  return (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-white border-opacity-20 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-2xl flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{producto?.nombre}</h3>
                          <p className="text-sm text-gray-200">{producto?.codigo} • {producto?.tipo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{item.cantidad} {producto?.unidad}</p>
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
                  className="flex-1 px-8 py-4 bg-white bg-opacity-30 text-white rounded-2xl font-medium hover:bg-opacity-40 transition-all duration-200"
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
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-xl border border-white border-opacity-20 p-8">
              {/* Tabla de productos con precios */}
              <div className="mb-12">
                <h2 className="text-3xl font-light text-white mb-8 drop-shadow-md">Productos Seleccionados</h2>
                <div className="space-y-6">
                  {productosSeleccionados.map((item, index) => {
                    const producto = getProductoInfo(item.categoria, item.productoId);
                    if (!producto) return null;

                    const subtotal = calcularSubtotal(producto, item.cantidad);
                    return (
                      <div key={item.id} className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-3xl p-8 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white border-opacity-30">
                              <span className="text-sm font-medium text-white drop-shadow-sm">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-light text-white drop-shadow-md">{producto.nombre}</h3>
                              <p className="text-sm text-white text-opacity-80 drop-shadow-sm">{producto.codigo} • {producto.tipo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-white drop-shadow-md">{formatearPrecio(subtotal)}</p>
                            <p className="text-sm text-white text-opacity-70 drop-shadow-sm">{item.cantidad} {producto.unidad} x {formatearPrecio(producto.precio)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen de precios */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white border-opacity-20">
                <h3 className="text-2xl font-light text-white mb-6 drop-shadow-md">Resumen de Precios</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 text-2xl font-bold text-emerald-400 bg-emerald-500 bg-opacity-20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-emerald-300 border-opacity-30 drop-shadow-md">
                    <span>TOTAL:</span>
                    <span>{formatearPrecio(calcularTotal())}</span>
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
                  className="px-8 py-4 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 border border-white border-opacity-30 drop-shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Volver atrás</span>
                </button>
                
                {pdfUrl && (
                  <button
                    onClick={descargarPDF}
                    className="px-8 py-4 bg-blue-500 bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 border border-blue-400 border-opacity-50 drop-shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Descargar Cotización</span>
                  </button>
                )}
                
                <button
                  onClick={() => window.location.href = '/registro'}
                  className="px-8 py-4 bg-emerald-500 bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm text-white rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 border border-emerald-400 border-opacity-50 drop-shadow-md"
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
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-xl border border-white border-opacity-20 p-8">
              <div className="space-y-6">
                {/* Nombre personal */}
                <div>
                  <label className="block text-sm font-medium text-white text-opacity-90 mb-3 drop-shadow-sm">Nombre personal *</label>
                  <input
                    type="text"
                    value={datosContacto.nombre}
                    onChange={(e) => setDatosContacto({...datosContacto, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 focus:border-opacity-70 transition-all duration-200 text-white placeholder-gray-300"
                    placeholder="Ingrese su nombre completo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-white text-opacity-90 mb-3 drop-shadow-sm">Número telefónico *</label>
                    <input
                      type="tel"
                      value={datosContacto.telefono}
                      onChange={(e) => setDatosContacto({...datosContacto, telefono: e.target.value})}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 focus:border-opacity-70 transition-all duration-200 text-white placeholder-gray-300"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block text-sm font-medium text-white text-opacity-90 mb-3 drop-shadow-sm">Nombre de la empresa *</label>
                    <input
                      type="text"
                      value={datosContacto.empresa}
                      onChange={(e) => setDatosContacto({...datosContacto, empresa: e.target.value})}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 focus:border-opacity-70 transition-all duration-200 text-white placeholder-gray-300"
                      placeholder="Nombre de su empresa"
                    />
                  </div>
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-sm font-medium text-white text-opacity-90 mb-3 drop-shadow-sm">Correo electrónico *</label>
                  <input
                    type="email"
                    value={datosContacto.correo}
                    onChange={(e) => setDatosContacto({...datosContacto, correo: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 focus:border-opacity-70 transition-all duration-200 text-white placeholder-gray-300"
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
                    className="mt-1 w-5 h-5 text-emerald-400 bg-white bg-opacity-20 border-white border-opacity-30 rounded focus:ring-emerald-400 focus:ring-opacity-50 backdrop-blur-sm"
                  />
                  <label htmlFor="politica" className="text-sm text-white text-opacity-90 drop-shadow-sm">
                    Acepto el manejo de mis datos personales de acuerdo con la{' '}
                    <a 
                      href="https://www.siriusregenerative.co/privacypolicy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:text-emerald-200 underline font-medium drop-shadow-md"
                    >
                      Política de Privacidad
                    </a>
                  </label>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setMostrarFormulario(false)}
                    className="flex-1 px-8 py-4 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white rounded-2xl font-medium transition-all duration-200 border border-white border-opacity-30 drop-shadow-sm"
                    disabled={isLoading}
                  >
                    Regresar
                  </button>
                  <button
                    onClick={handleEnviarCotizacion}
                    className="flex-1 px-8 py-4 bg-emerald-500 bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm text-white rounded-2xl font-medium transition-all duration-200 disabled:bg-gray-400 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-emerald-400 border-opacity-50 drop-shadow-md"
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
                  <div className="mt-4 p-4 bg-red-100 bg-opacity-80 backdrop-blur-sm border border-red-200 border-opacity-50 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-800 font-medium drop-shadow-sm">Error:</span>
                    </div>
                    <p className="text-red-700 mt-1 drop-shadow-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : mostrarCotizacion ? (
          <div className="max-w-4xl mx-auto w-full px-4">
            {/* Header del carrito */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h1 className="text-4xl font-light text-white mb-3">Resumen de Selección</h1>
              <p className="text-lg text-white text-opacity-90 font-light">
                Revisa y ajusta tus productos antes de solicitar la cotización
              </p>
            </div>
            
            {/* Card principal del carrito */}
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Resumen de productos */}
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos Seleccionados</h2>
                <div className="space-y-6">
                  {productosSeleccionados.map((item, index) => {
                    const producto = getProductoInfo(item.categoria, item.productoId);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border border-gray-200">
                            {(producto as any)?.imagen ? (
                              <img 
                                src={(producto as any).imagen} 
                                alt={producto?.nombre}
                                className="w-14 h-14 object-cover rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const emojiSpan = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (emojiSpan) {
                                    emojiSpan.style.display = 'block';
                                  }
                                }}
                              />
                            ) : null}
                            <span className={`text-2xl ${(producto as any)?.imagen ? 'hidden' : 'block'}`}>
                              {(producto as any)?.icono}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{producto?.nombre}</h3>
                            <p className="text-sm text-gray-600">{producto?.codigo} • {(producto as any)?.categoria}</p>
                            <p className="text-lg font-bold text-emerald-600">{formatearPrecio(producto?.precio || 0)}/{producto?.unidad}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => actualizarProducto(item.id, 'cantidad', Math.max(1, item.cantidad - 1))}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                              <span className="text-gray-600 font-bold">−</span>
                            </button>
                            <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-center">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => actualizarProducto(item.id, 'cantidad', item.cantidad + 1)}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                              <span className="text-gray-600 font-bold">+</span>
                            </button>
                            <button
                              onClick={() => eliminarProducto(item.id)}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all duration-200 ml-4"
                            >
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{item.cantidad} {producto?.unidad}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Total */}
                <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-emerald-900">Total Estimado:</span>
                    <span className="text-3xl font-bold text-emerald-600">
                      {formatearPrecio(calcularTotal())}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Acciones */}
              <div className="p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setMostrarCotizacion(false)}
                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-200"
                  >
                    ← Seguir Comprando
                  </button>
                  <button 
                    onClick={handleSolicitarCotizacion}
                    className="flex-1 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all duration-200"
                  >
                    Solicitar Cotización →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto w-full px-4">
            {/* Header */}
            <div className="text-center py-16">
              <br /><br />
              <h1 className="text-5xl font-light text-white mb-4">Catálogo de Productos</h1>
              <p className="text-xl text-gray-200 font-light max-w-3xl mx-auto">
                Soluciones biotecnológicas avanzadas para agricultura regenerativa y sostenible
              </p>
            </div>

            {/* Sección Biofertilizantes */}
            <div className="mb-16">
              <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20 p-8 mb-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-light text-white mb-4">Biofertilizantes</h2>
                  <div className="w-24 h-1 bg-emerald-400 mx-auto mb-6 rounded-full"></div>
                  <p className="text-lg text-white text-opacity-90 max-w-2xl mx-auto font-light">
                    Formulaciones biotecnológicas avanzadas para optimizar la fertilidad del suelo y potenciar el desarrollo vegetal
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                  {productos.biofertilizantes.map((producto) => (
                    <div key={producto.id} className="group">
                      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-lg border border-white border-opacity-30 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:border-emerald-200 hover:border-opacity-50 hover:-translate-y-1 h-full flex flex-col">
                        {/* Círculo del producto - Tamaño fijo */}
                        <div className="relative mb-6 flex-shrink-0">
                          <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-emerald-300" onClick={() => abrirModal(producto)}>
                            {producto.imagen ? (
                              <img 
                                src={producto.imagen} 
                                alt={producto.nombre}
                                className="w-28 h-28 object-cover rounded-full hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const emojiSpan = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (emojiSpan) {
                                    emojiSpan.style.display = 'block';
                                  }
                                }}
                              />
                            ) : null}
                            <span className={`text-4xl ${producto.imagen ? 'hidden' : 'block'}`}>
                              {producto.icono}
                            </span>
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1 shadow-lg border border-gray-200">
                            <span className="text-xs font-bold text-emerald-600">{producto.codigo}</span>
                          </div>
                        </div>
                        
                        {/* Información del producto - Altura fija */}
                        <div className="text-center mb-6 flex-grow">
                          <h3 className="text-xl font-semibold text-white mb-3 h-14 flex items-center justify-center leading-tight drop-shadow-md">{producto.nombre}</h3>
                          <p className="text-sm text-white text-opacity-90 mb-4 leading-relaxed h-20 overflow-hidden drop-shadow-sm">{producto.descripcion}</p>
                          
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white border-opacity-30">
                            <div className="flex justify-center items-baseline space-x-1">
                              <span className="text-2xl font-bold text-white drop-shadow-md">
                                {formatearPrecio(producto.precio)}
                              </span>
                              <span className="text-sm text-white text-opacity-80 font-medium drop-shadow-sm">por {producto.unidad}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 bg-opacity-90 text-emerald-800 border border-emerald-300 border-opacity-50 backdrop-blur-sm">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                              {producto.tipo}
                            </span>
                          </div>
                        </div>
                        
                        {/* Selector de cantidad - Posición fija */}
                        <div className="mb-6 flex-shrink-0">
                          <label className="block text-sm font-medium text-white text-opacity-90 mb-3 text-center drop-shadow-sm">
                            Cantidad ({producto.unidad})
                          </label>
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => actualizarCantidadMarketplace('biofertilizantes', producto.id, obtenerCantidadMarketplace('biofertilizantes', producto.id) - 1)}
                              className="w-10 h-10 bg-gray-100 hover:bg-emerald-100 hover:border-emerald-300 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-200 transform hover:scale-110 active:scale-95"
                            >
                              <span className="text-gray-600 hover:text-emerald-600 font-semibold text-lg transition-colors duration-200">−</span>
                            </button>
                            <div className="bg-white border-2 border-gray-200 hover:border-emerald-300 rounded-lg px-4 py-2 w-20 transition-all duration-300 hover:shadow-md">
                              <input
                                type="number"
                                min="1"
                                value={obtenerCantidadMarketplace('biofertilizantes', producto.id)}
                                onChange={(e) => actualizarCantidadMarketplace('biofertilizantes', producto.id, parseInt(e.target.value) || 1)}
                                className="w-full text-center text-lg font-semibold text-gray-900 bg-transparent border-none outline-none"
                              />
                            </div>
                            <button
                              onClick={() => actualizarCantidadMarketplace('biofertilizantes', producto.id, obtenerCantidadMarketplace('biofertilizantes', producto.id) + 1)}
                              className="w-10 h-10 bg-gray-100 hover:bg-emerald-100 hover:border-emerald-300 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-200 transform hover:scale-110 active:scale-95"
                            >
                              <span className="text-gray-600 hover:text-emerald-600 font-semibold text-lg transition-colors duration-200">+</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Botón agregar - Altura fija */}
                        <button
                          onClick={() => agregarAlCarrito('biofertilizantes', producto.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-emerald-200 active:scale-95 flex-shrink-0"
                        >
                          Agregar {obtenerCantidadMarketplace('biofertilizantes', producto.id)} {producto.unidad}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sección Biocontroladores */}
            <div className="mb-16">
              <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20 p-8 mb-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-light text-white mb-4">Biocontroladores</h2>
                  <div className="w-24 h-1 bg-orange-400 mx-auto mb-6 rounded-full"></div>
                  <p className="text-lg text-white text-opacity-90 max-w-2xl mx-auto font-light">
                    Agentes de control biológico especializados para el manejo integrado de plagas y enfermedades
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                  {productos.biocontroladores.map((producto) => (
                    <div key={producto.id} className="group">
                      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-lg border border-white border-opacity-30 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:border-orange-200 hover:border-opacity-50 hover:-translate-y-1 h-full flex flex-col">
                        {/* Círculo del producto - Tamaño fijo */}
                        <div className="relative mb-6 flex-shrink-0">
                          <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer hover:ring-2 hover:ring-orange-300" onClick={() => abrirModal(producto)}>
                            {producto.imagen ? (
                              <img 
                                src={producto.imagen} 
                                alt={producto.nombre}
                                className="w-28 h-28 object-cover rounded-full hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const emojiSpan = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (emojiSpan) {
                                    emojiSpan.style.display = 'block';
                                  }
                                }}
                              />
                            ) : null}
                            <span className={`text-4xl ${producto.imagen ? 'hidden' : 'block'}`}>
                              {producto.icono}
                            </span>
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1 shadow-lg border border-gray-200">
                            <span className="text-xs font-bold text-orange-600">{producto.codigo}</span>
                          </div>
                        </div>
                        
                        {/* Información del producto - Altura fija */}
                        <div className="text-center mb-6 flex-grow">
                          <h3 className="text-xl font-semibold text-white mb-3 h-14 flex items-center justify-center leading-tight drop-shadow-md">{producto.nombre}</h3>
                          <p className="text-sm text-white text-opacity-90 mb-4 leading-relaxed h-20 overflow-hidden drop-shadow-sm">{producto.descripcion}</p>
                          
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white border-opacity-30">
                            <div className="flex justify-center items-baseline space-x-1">
                              <span className="text-2xl font-bold text-white drop-shadow-md">
                                {formatearPrecio(producto.precio)}
                              </span>
                              <span className="text-sm text-white text-opacity-80 font-medium drop-shadow-sm">por {producto.unidad}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 bg-opacity-90 text-orange-800 border border-orange-300 border-opacity-50 backdrop-blur-sm">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              {producto.tipo}
                            </span>
                          </div>
                        </div>
                        
                        {/* Selector de cantidad - Posición fija */}
                        <div className="mb-6 flex-shrink-0">
                          <label className="block text-sm font-medium text-white text-opacity-90 mb-3 text-center drop-shadow-sm">
                            Cantidad ({producto.unidad})
                          </label>
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => actualizarCantidadMarketplace('biocontroladores', producto.id, obtenerCantidadMarketplace('biocontroladores', producto.id) - 1)}
                              className="w-10 h-10 bg-gray-100 hover:bg-orange-100 hover:border-orange-300 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-200 transform hover:scale-110 active:scale-95"
                            >
                              <span className="text-gray-600 hover:text-orange-600 font-semibold text-lg transition-colors duration-200">−</span>
                            </button>
                            <div className="bg-white border-2 border-gray-200 hover:border-orange-300 rounded-lg px-4 py-2 w-20 transition-all duration-300 hover:shadow-md">
                              <input
                                type="number"
                                min="1"
                                value={obtenerCantidadMarketplace('biocontroladores', producto.id)}
                                onChange={(e) => actualizarCantidadMarketplace('biocontroladores', producto.id, parseInt(e.target.value) || 1)}
                                className="w-full text-center text-lg font-semibold text-gray-900 bg-transparent border-none outline-none"
                              />
                            </div>
                            <button
                              onClick={() => actualizarCantidadMarketplace('biocontroladores', producto.id, obtenerCantidadMarketplace('biocontroladores', producto.id) + 1)}
                              className="w-10 h-10 bg-gray-100 hover:bg-orange-100 hover:border-orange-300 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-200 transform hover:scale-110 active:scale-95"
                            >
                              <span className="text-gray-600 hover:text-orange-600 font-semibold text-lg transition-colors duration-200">+</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Botón agregar - Altura fija */}
                        <button
                          onClick={() => agregarAlCarrito('biocontroladores', producto.id)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-orange-200 active:scale-95 flex-shrink-0"
                        >
                          Agregar {obtenerCantidadMarketplace('biocontroladores', producto.id)} {producto.unidad}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>



            {/* Sección del Carrito */}
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl shadow-2xl border border-white border-opacity-20 p-8 mb-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-light text-white mb-4">Carrito de Cotización</h2>
                <div className="w-24 h-1 bg-blue-400 mx-auto mb-6 rounded-full"></div>
                <p className="text-lg text-white text-opacity-90 max-w-2xl mx-auto font-light">
                  Revisa y ajusta tu selección de productos biotecnológicos
                </p>
              </div>

              {/* Productos seleccionados */}
              {productosSeleccionados.length > 0 && (
                <div className="grid gap-6 mb-12">
                  {productosSeleccionados.map((item, index) => {
                    const producto = getProductoInfo(item.categoria, item.productoId);
                    return (
                      <div key={item.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-lg border border-white border-opacity-30 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] hover:-translate-y-1 hover:border-blue-200 hover:border-opacity-50">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-6">
                            {/* Imagen del producto */}
                            <div className="relative flex-shrink-0">
                              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border border-gray-200">
                                {producto?.imagen ? (
                                  <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre}
                                    className="w-18 h-18 object-cover rounded-full"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const emojiSpan = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (emojiSpan) {
                                        emojiSpan.style.display = 'block';
                                      }
                                    }}
                                  />
                                ) : null}
                                <span className={`text-2xl ${producto?.imagen ? 'hidden' : 'block'}`}>
                                  {producto?.icono || '📦'}
                                </span>
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                                {index + 1}
                              </div>
                            </div>
                            
                            <div className="flex-grow">
                              <h3 className="text-xl font-semibold text-white mb-1 drop-shadow-md">
                                {producto ? producto.nombre : `Producto ${index + 1}`}
                              </h3>
                              <p className="text-sm text-white text-opacity-80 drop-shadow-sm">
                                {producto ? `${producto.codigo} • ${producto.tipo}` : 'Configurar producto'}
                              </p>
                              {producto && (
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-lg font-bold text-white drop-shadow-md">
                                    {formatearPrecio(producto.precio * item.cantidad)}
                                  </span>
                                  <span className="text-sm text-white text-opacity-70 drop-shadow-sm">
                                    {item.cantidad} {producto.unidad} × {formatearPrecio(producto.precio)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => eliminarProducto(item.id)}
                            className="w-10 h-10 bg-red-100 bg-opacity-80 hover:bg-opacity-100 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 border border-red-200 border-opacity-50"
                          >
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Categoría */}
                          <div>
                            <label className="block text-sm font-medium text-white text-opacity-90 mb-3 drop-shadow-sm">Categoría</label>
                            <select
                              value={item.categoria}
                              onChange={(e) => actualizarProducto(item.id, 'categoria', e.target.value)}
                              className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-opacity-70 transition-all duration-200 text-white placeholder-gray-300 [&>option]:text-gray-900 [&>option]:bg-white"
                            >
                              <option value="">Seleccionar categoría</option>
                              <option value="biofertilizantes">Biofertilizantes</option>
                              <option value="biocontroladores">Biocontroladores</option>
                            </select>
                          </div>
                          
                          {/* Producto */}
                          <div>
                            <label className="block text-sm font-medium text-white text-opacity-90 mb-3 drop-shadow-sm">Producto</label>
                            <select
                              value={item.productoId}
                              onChange={(e) => actualizarProducto(item.id, 'productoId', e.target.value)}
                              disabled={!item.categoria}
                              className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-opacity-70 transition-all duration-200 text-white placeholder-gray-300 disabled:bg-opacity-10 disabled:text-white disabled:text-opacity-50 [&>option]:text-gray-900 [&>option]:bg-white"
                            >
                              <option value="">Seleccionar producto</option>
                              {item.categoria && productos[item.categoria]?.map(producto => (
                                <option key={producto.id} value={producto.id}>
                                  {producto.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Cantidad */}
                          <div>
                            <label className="block text-sm font-medium text-white text-opacity-90 mb-3 drop-shadow-sm">
                              Cantidad
                              {(() => {
                                const info = item.productoId ? getProductoInfo(item.categoria, item.productoId) : null;
                                return info?.unidad ? (
                                  <span className="text-white text-opacity-60 font-normal"> ({info.unidad})</span>
                                ) : null;
                              })()}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => actualizarProducto(item.id, 'cantidad', parseInt(e.target.value) || 1)}
                              className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 focus:border-opacity-70 transition-all duration-200 text-white placeholder-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total del carrito */}
              {productosSeleccionados.length > 0 && (
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white border-opacity-30 transform transition-all duration-500 hover:scale-[1.01] hover:shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-white drop-shadow-md">Total estimado</h3>
                      <p className="text-sm text-white text-opacity-80 drop-shadow-sm">
                        {productosSeleccionados.length} producto{productosSeleccionados.length > 1 ? 's' : ''} seleccionado{productosSeleccionados.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-400 drop-shadow-md">
                        {formatearPrecio(calcularTotal())}
                      </div>
                      <p className="text-sm text-white text-opacity-70 drop-shadow-sm">Precio de referencia</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estado vacío */}
              {productosSeleccionados.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-white text-opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-light text-white mb-3">Carrito vacío</h3>
                  <p className="text-lg text-white text-opacity-80 mb-8">Agrega productos desde las secciones de arriba</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  onClick={agregarProducto}
                  className="px-8 py-4 bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 border border-white border-opacity-20 transform hover:scale-105 hover:-translate-y-1 active:scale-95"
                >
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Agregar Producto Manual</span>
                </button>
                
                {productosSeleccionados.length > 0 && (
                  <button
                    onClick={handleSolicitarCotizacion}
                    disabled={!validarSeleccion()}
                    className={`px-12 py-4 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 transform ${
                      validarSeleccion()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 active:scale-95'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Solicitar Cotización</span>
                    <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded-lg text-sm">
                      {productosSeleccionados.length}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para mostrar imagen ampliada */}
        {mostrarModal && productoModalSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={cerrarModal}>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-white border-opacity-20" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                {/* Botón cerrar */}
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={cerrarModal}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white border-opacity-30"
                  >
                    <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Imagen del producto */}
                  <div className="text-center">
                    {productoModalSeleccionado.imagen ? (
                      <img 
                        src={productoModalSeleccionado.imagen} 
                        alt={productoModalSeleccionado.nombre}
                        className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
                      />
                    ) : (
                      <div className="w-full max-w-md mx-auto h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <span className="text-6xl">{productoModalSeleccionado.icono}</span>
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-blue-100 bg-opacity-90 text-blue-800 rounded-full text-sm font-medium backdrop-blur-sm border border-blue-200 border-opacity-50">
                          {productoModalSeleccionado.codigo}
                        </span>
                        <span className="px-3 py-1 bg-green-100 bg-opacity-90 text-green-800 rounded-full text-sm font-medium backdrop-blur-sm border border-green-200 border-opacity-50">
                          {productoModalSeleccionado.categoria}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
                        {productoModalSeleccionado.nombre}
                      </h2>
                      <p className="text-lg text-white text-opacity-80 mb-4 drop-shadow-sm">
                        {productoModalSeleccionado.tipo}
                      </p>
                    </div>

                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                      <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-md">Descripción del Producto</h3>
                      <p className="text-white text-opacity-90 leading-relaxed text-base drop-shadow-sm">
                        {productoModalSeleccionado.descripcion}
                      </p>
                    </div>

                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                      <div className="space-y-4">
                        {/* Precio y total */}
                        <div>
                          <p className="text-sm text-white text-opacity-70 mb-1 drop-shadow-sm">Precio por {productoModalSeleccionado.unidad}</p>
                          <p className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                            {formatearPrecio(productoModalSeleccionado.precio)}
                          </p>
                          <div className="border-t border-white border-opacity-20 pt-2">
                            <p className="text-sm text-white text-opacity-70 mb-1 drop-shadow-sm">Total: {cantidadModal} {productoModalSeleccionado.unidad}</p>
                            <p className="text-3xl font-bold text-white drop-shadow-md">
                              {formatearPrecio(productoModalSeleccionado.precio * cantidadModal)}
                            </p>
                          </div>
                        </div>

                        {/* Selector de cantidad */}
                        <div>
                          <label className="block text-sm font-medium text-white text-opacity-90 mb-3 drop-shadow-sm">
                            Cantidad ({productoModalSeleccionado.unidad})
                          </label>
                          <div className="flex items-center justify-center space-x-3 mb-4">
                            <button
                              onClick={() => setCantidadModal(Math.max(1, cantidadModal - 1))}
                              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white border-opacity-30"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={cantidadModal}
                              onChange={(e) => setCantidadModal(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 h-10 text-center bg-white bg-opacity-20 backdrop-blur-sm text-white border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-opacity-70"
                            />
                            <button
                              onClick={() => setCantidadModal(cantidadModal + 1)}
                              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white border-opacity-30"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Botón agregar al carrito */}
                        <button 
                          onClick={agregarAlCarritoDesdeModal}
                          className="w-full bg-blue-600 bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-400 border-opacity-50 hover:border-opacity-70"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Agregar al Carrito</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}