'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Calendar,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ListChecks
} from 'lucide-react';

interface Aplicacion {
  id: string;
  fecha: string;
  producto: string;
  area: string;
  dosis: string;
  observaciones: string;
}

export default function CalendarioAplicacionesPage() {
  const { user } = useAuth();
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fecha: '',
    producto: '',
    area: '',
    dosis: '',
    observaciones: ''
  });

  const [mesActual, setMesActual] = useState(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editandoId) {
      // Editar aplicación existente
      setAplicaciones(aplicaciones.map(app => 
        app.id === editandoId 
          ? { ...formData, id: editandoId }
          : app
      ));
      setEditandoId(null);
    } else {
      // Agregar nueva aplicación
      const nuevaAplicacion: Aplicacion = {
        id: Date.now().toString(),
        ...formData
      };
      setAplicaciones([...aplicaciones, nuevaAplicacion]);
    }

    // Resetear formulario
    setFormData({
      fecha: '',
      producto: '',
      area: '',
      dosis: '',
      observaciones: ''
    });
    setMostrarFormulario(false);
  };

  const handleEdit = (aplicacion: Aplicacion) => {
    setFormData({
      fecha: aplicacion.fecha,
      producto: aplicacion.producto,
      area: aplicacion.area,
      dosis: aplicacion.dosis,
      observaciones: aplicacion.observaciones
    });
    setEditandoId(aplicacion.id);
    setMostrarFormulario(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta aplicación?')) {
      setAplicaciones(aplicaciones.filter(app => app.id !== id));
    }
  };

  const handleCancelar = () => {
    setFormData({
      fecha: '',
      producto: '',
      area: '',
      dosis: '',
      observaciones: ''
    });
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const cambiarMes = (direccion: number) => {
    const nuevaFecha = new Date(mesActual);
    nuevaFecha.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevaFecha);
  };

  const obtenerNombreMes = () => {
    return mesActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const aplicacionesDelMes = aplicaciones.filter(app => {
    const fechaApp = new Date(app.fecha);
    return fechaApp.getMonth() === mesActual.getMonth() && 
           fechaApp.getFullYear() === mesActual.getFullYear();
  });

  // Generar días del calendario
  const generarDiasCalendario = () => {
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    const dias = [];
    
    // Ajustar para que Lunes sea el primer día (0 = Lunes)
    const ajustePrimerDia = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    
    // Días del mes anterior (grises)
    for (let i = ajustePrimerDia - 1; i >= 0; i--) {
      const diaAnterior = new Date(mesActual.getFullYear(), mesActual.getMonth(), -i);
      dias.push({ dia: diaAnterior.getDate(), esOtroMes: true, fecha: diaAnterior });
    }
    
    // Días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), i);
      dias.push({ dia: i, esOtroMes: false, fecha });
    }
    
    // Días del mes siguiente para completar la semana
    const diasRestantes = 42 - dias.length; // 6 semanas x 7 días
    for (let i = 1; i <= diasRestantes; i++) {
      const diaSiguiente = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, i);
      dias.push({ dia: i, esOtroMes: true, fecha: diaSiguiente });
    }
    
    return dias;
  };

  const obtenerAplicacionesPorDia = (fecha: Date) => {
    return aplicaciones.filter(app => {
      const fechaApp = new Date(app.fecha);
      return fechaApp.getDate() === fecha.getDate() &&
             fechaApp.getMonth() === fecha.getMonth() &&
             fechaApp.getFullYear() === fecha.getFullYear();
    });
  };

  const esHoy = (fecha: Date) => {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  };

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen py-12 relative"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Espaciado superior para el navbar */}
          <div className="pt-20 mb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl rounded-xl border border-white border-opacity-20 p-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
                    <Calendar className="text-purple-300" size={32} />
                  </div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    Calendario de Aplicaciones
                  </h1>
                </div>
                <p className="text-xl text-white mb-2 drop-shadow-md">
                  Planifica y organiza tus aplicaciones de productos
                </p>
                <p className="text-white text-opacity-90 drop-shadow-md">
                  Usuario: <span className="font-semibold text-purple-300">{user?.nombre}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel izquierdo - Formulario */}
            <div className="lg:col-span-1">
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Plus size={20} />
                    <span>{editandoId ? 'Editar Aplicación' : 'Nueva Aplicación'}</span>
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    {editandoId ? 'Modifica los datos de la aplicación' : 'Programa una nueva aplicación'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {!mostrarFormulario && !editandoId ? (
                    <Button 
                      onClick={() => setMostrarFormulario(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="mr-2" size={16} />
                      Agregar Aplicación
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Fecha de Aplicación *
                        </label>
                        <Input
                          type="date"
                          value={formData.fecha}
                          onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                          required
                          className="bg-white bg-opacity-10 border-white border-opacity-30 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Producto *
                        </label>
                        <Input
                          type="text"
                          value={formData.producto}
                          onChange={(e) => setFormData({...formData, producto: e.target.value})}
                          placeholder="Ej: Biochar, Microorganismos..."
                          required
                          className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Área/Lote *
                        </label>
                        <Input
                          type="text"
                          value={formData.area}
                          onChange={(e) => setFormData({...formData, area: e.target.value})}
                          placeholder="Ej: Lote A, Sector 1..."
                          required
                          className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Dosis *
                        </label>
                        <Input
                          type="text"
                          value={formData.dosis}
                          onChange={(e) => setFormData({...formData, dosis: e.target.value})}
                          placeholder="Ej: 2 ton/ha, 500 ml/ha..."
                          required
                          className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Observaciones
                        </label>
                        <textarea
                          value={formData.observaciones}
                          onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                          placeholder="Notas adicionales..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          type="submit"
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {editandoId ? 'Actualizar' : 'Guardar'}
                        </Button>
                        <Button 
                          type="button"
                          onClick={handleCancelar}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Panel derecho - Vista del calendario */}
            <div className="lg:col-span-2">
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => cambiarMes(-1)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2"
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    <CardTitle className="text-white text-2xl capitalize">
                      {obtenerNombreMes()}
                    </CardTitle>
                    <Button
                      onClick={() => cambiarMes(1)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2"
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                  <CardDescription className="text-purple-100 text-center">
                    {aplicacionesDelMes.length} aplicación(es) programada(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Grid del calendario */}
                  <div className="mb-6">
                    {/* Nombres de los días */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                        <div key={dia} className="text-center text-white font-bold text-sm py-2">
                          {dia}
                        </div>
                      ))}
                    </div>
                    
                    {/* Días del calendario */}
                    <div className="grid grid-cols-7 gap-2">
                      {generarDiasCalendario().map((diaInfo, index) => {
                        const aplicacionesDia = obtenerAplicacionesPorDia(diaInfo.fecha);
                        const tieneAplicaciones = aplicacionesDia.length > 0;
                        const esHoyDia = esHoy(diaInfo.fecha);
                        
                        return (
                          <div
                            key={index}
                            className={`
                              relative min-h-[80px] p-2 rounded-lg border transition-all
                              ${diaInfo.esOtroMes 
                                ? 'bg-white bg-opacity-5 border-white border-opacity-10 text-white text-opacity-30' 
                                : 'bg-white bg-opacity-10 border-white border-opacity-20 text-white hover:bg-opacity-20'
                              }
                              ${esHoyDia && !diaInfo.esOtroMes
                                ? 'ring-2 ring-yellow-400 bg-yellow-500 bg-opacity-20'
                                : ''
                              }
                              ${tieneAplicaciones && !diaInfo.esOtroMes
                                ? 'border-purple-400 border-opacity-50'
                                : ''
                              }
                            `}
                          >
                            <div className="flex items-start justify-between">
                              <span className={`text-sm font-bold ${esHoyDia ? 'text-yellow-300' : ''}`}>
                                {diaInfo.dia}
                              </span>
                              {tieneAplicaciones && !diaInfo.esOtroMes && (
                                <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                  {aplicacionesDia.length}
                                </span>
                              )}
                            </div>
                            
                            {/* Mostrar aplicaciones del día */}
                            {tieneAplicaciones && !diaInfo.esOtroMes && (
                              <div className="mt-1 space-y-1">
                                {aplicacionesDia.slice(0, 2).map((app) => (
                                  <div
                                    key={app.id}
                                    className="bg-purple-600 bg-opacity-60 text-white text-xs px-1 py-0.5 rounded truncate"
                                    title={`${app.producto} - ${app.area}`}
                                  >
                                    {app.producto}
                                  </div>
                                ))}
                                {aplicacionesDia.length > 2 && (
                                  <div className="text-xs text-purple-300 font-semibold">
                                    +{aplicacionesDia.length - 2} más
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lista detallada de aplicaciones del mes */}
                  {aplicacionesDelMes.length > 0 && (
                    <div className="border-t border-white border-opacity-20 pt-6 mt-6">
                      <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                        <ListChecks className="mr-2" size={20} />
                        Detalle de Aplicaciones del Mes
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {aplicacionesDelMes
                          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                          .map((aplicacion) => (
                            <div 
                              key={aplicacion.id}
                              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                      {new Date(aplicacion.fecha).toLocaleDateString('es-ES', { 
                                        day: 'numeric', 
                                        month: 'short',
                                        weekday: 'short'
                                      })}
                                    </div>
                                    <h3 className="text-white font-bold text-lg">
                                      {aplicacion.producto}
                                    </h3>
                                  </div>
                                  <div className="space-y-1 text-white text-opacity-90 text-sm">
                                    <p><span className="font-semibold">Área:</span> {aplicacion.area}</p>
                                    <p><span className="font-semibold">Dosis:</span> {aplicacion.dosis}</p>
                                    {aplicacion.observaciones && (
                                      <p className="text-white text-opacity-70 italic mt-2">
                                        {aplicacion.observaciones}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    onClick={() => handleEdit(aplicacion)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    onClick={() => handleDelete(aplicacion.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white p-2"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen de todas las aplicaciones */}
              {aplicaciones.length > 0 && (
                <div className="mt-8">
                  <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600">
                      <CardTitle className="text-white">Resumen General</CardTitle>
                      <CardDescription className="text-purple-100">
                        Total: {aplicaciones.length} aplicación(es) registrada(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Estadísticas */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center border border-white border-opacity-20">
                          <div className="text-3xl font-bold text-purple-300 mb-1">
                            {aplicaciones.length}
                          </div>
                          <div className="text-white text-opacity-70 text-sm">
                            Total Aplicaciones
                          </div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center border border-white border-opacity-20">
                          <div className="text-3xl font-bold text-green-300 mb-1">
                            {aplicacionesDelMes.length}
                          </div>
                          <div className="text-white text-opacity-70 text-sm">
                            Este Mes
                          </div>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center border border-white border-opacity-20">
                          <div className="text-3xl font-bold text-blue-300 mb-1">
                            {new Set(aplicaciones.map(a => a.producto)).size}
                          </div>
                          <div className="text-white text-opacity-70 text-sm">
                            Productos Diferentes
                          </div>
                        </div>
                      </div>

                      {/* Leyenda del calendario */}
                      <div className="bg-white bg-opacity-5 rounded-lg p-4 mb-6 border border-white border-opacity-20">
                        <h4 className="text-white font-semibold mb-3 text-sm">Leyenda del Calendario:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-yellow-500 bg-opacity-20 border-2 border-yellow-400 rounded"></div>
                            <span className="text-white text-opacity-90">Día actual</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-600 bg-opacity-60 rounded"></div>
                            <span className="text-white text-opacity-90">Día con aplicaciones</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-white bg-opacity-5 rounded"></div>
                            <span className="text-white text-opacity-90">Otro mes</span>
                          </div>
                        </div>
                      </div>

                      {/* Lista compacta de todas las aplicaciones */}
                      <div>
                        <h4 className="text-white font-semibold mb-3">Historial Completo:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                          {aplicaciones
                            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                            .map((aplicacion) => (
                              <div 
                                key={aplicacion.id}
                                className="bg-white bg-opacity-10 rounded-lg p-3 border border-white border-opacity-20 hover:bg-opacity-20 transition-all"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-purple-300 text-xs font-bold">
                                    {new Date(aplicacion.fecha).toLocaleDateString('es-ES')}
                                  </span>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleEdit(aplicacion)}
                                      className="text-blue-400 hover:text-blue-300 p-1"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(aplicacion.id)}
                                      className="text-red-400 hover:text-red-300 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-white font-semibold text-sm">{aplicacion.producto}</p>
                                <p className="text-white text-opacity-70 text-xs">{aplicacion.area} • {aplicacion.dosis}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
