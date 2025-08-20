'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Users, 
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  AlertCircle,
  X,
  Lock,
  Info
} from 'lucide-react';

interface Usuario {
  id: string;
  usuario: string;
  nombre: string;
  documento: string;
  areaEmpresa?: string;
  rolUsuario?: string;
  fechaCreacion: string;
  tipoUsuario: 'raiz' | 'regular';
  estado: 'activo' | 'inactivo';
}

export default function VerUsuariosPage() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    documento: '',
    areaEmpresa: '',
    rolUsuario: ''
  });
  const [customArea, setCustomArea] = useState('');
  const [showCustomArea, setShowCustomArea] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar que el usuario sea de tipo raíz o Admin
    if (user && user.tipoUsuario !== 'raiz' && user.rol !== 'Admin') {
      window.location.href = '/dashboard';
      return;
    }
    
    fetchUsuarios();
  }, [user]);

  const fetchUsuarios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('No se pudo identificar el usuario actual');
        return;
      }
      
      // Llamar a API para obtener usuarios relacionados al usuario actual
      const response = await fetch('/api/usuarios/listar', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Root-Id': user.id, // Enviar el ID del usuario actual
          'X-User-Type': user.tipoUsuario === 'raiz' ? 'raiz' : 'admin' // Tipo de usuario
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar los usuarios de su empresa');
      }

      const data = await response.json();
      setUsuarios(data.usuarios || []);
      
      console.log('✅ Usuarios de su empresa cargados:', data.usuarios?.length || 0);
      console.log('🔒 Empresa ID:', data.empresaId);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      setError('Error al cargar los usuarios de su empresa. Por favor, intenta de nuevo.');
      setUsuarios([]); // Dejar vacío por seguridad
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => 
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.documento.includes(searchTerm)
  );

  const handleDeleteUser = (usuario: Usuario) => {
    setUserToDelete(usuario);
    setDeletePassword('');
    setDeleteConfirmation('');
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !user) return;

    // Validar contraseña
    if (!deletePassword.trim()) {
      setDeleteError('La contraseña es requerida');
      return;
    }

    // Validar confirmación
    const expectedConfirmation = `Eliminar cuenta de ${userToDelete.nombre}`;
    if (deleteConfirmation !== expectedConfirmation) {
      setDeleteError(`Debe escribir exactamente: "${expectedConfirmation}"`);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Primero validar la contraseña del usuario raíz usando el endpoint específico
      const validateResponse = await fetch('/api/usuarios/validar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: user.usuario,
          password: deletePassword,
          userRootId: user.id
        })
      });

      if (!validateResponse.ok) {
        const errorData = await validateResponse.json();
        setDeleteError(errorData.error || 'Contraseña incorrecta');
        return;
      }

      console.log('✅ Contraseña de usuario raíz validada correctamente');

      // Si la contraseña es correcta, proceder con la eliminación
      const deleteResponse = await fetch(`/api/usuarios/eliminar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Root-Id': user.id
        },
        body: JSON.stringify({
          userId: userToDelete.id
        })
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        setDeleteError(errorData.error || 'Error al eliminar el usuario');
        return;
      }

      // Cerrar modal y recargar lista
      setShowDeleteModal(false);
      setUserToDelete(null);
      setDeletePassword('');
      setDeleteConfirmation('');
      fetchUsuarios();

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setDeleteError('Error interno del servidor');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeletePassword('');
    setDeleteConfirmation('');
    setDeleteError(null);
  };

  // Funciones para el modal de edición
  const handleEditUser = (usuario: Usuario) => {
    setUserToEdit(usuario);
    
    // Lista de áreas predefinidas
    const areasPredifinidas = [
      'Administracion', 'Ventas', 'Marketing', 'Produccion', 
      'Sistemas', 'Recursos Humanos', 'Contabilidad', 'Logistica'
    ];
    
    // Verificar si el área del usuario está en las opciones predefinidas
    const areaUsuario = usuario.areaEmpresa || '';
    const isAreaPredefinida = areasPredifinidas.includes(areaUsuario);
    
    if (isAreaPredefinida) {
      // Área predefinida
      setEditFormData({
        nombre: usuario.nombre,
        documento: usuario.documento,
        areaEmpresa: areaUsuario,
        rolUsuario: usuario.rolUsuario || ''
      });
      setShowCustomArea(false);
      setCustomArea('');
    } else {
      // Área personalizada
      setEditFormData({
        nombre: usuario.nombre,
        documento: usuario.documento,
        areaEmpresa: '',
        rolUsuario: usuario.rolUsuario || ''
      });
      setShowCustomArea(true);
      setCustomArea(areaUsuario);
    }
    
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'areaEmpresa') {
      if (value === 'Otro') {
        setShowCustomArea(true);
        setEditFormData(prev => ({
          ...prev,
          [name]: ''
        }));
      } else {
        setShowCustomArea(false);
        setCustomArea('');
        setEditFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (editError) setEditError(null);
  };

  const confirmEditUser = async () => {
    if (!userToEdit || !user) return;

    // Validaciones básicas
    if (!editFormData.nombre.trim()) {
      setEditError('El nombre es requerido');
      return;
    }

    if (!editFormData.documento.trim()) {
      setEditError('El número de documento es requerido');
      return;
    }

    // Validar área de empresa (incluye campo personalizado)
    const areaFinal = showCustomArea ? customArea.trim() : editFormData.areaEmpresa.trim();
    if (!areaFinal) {
      setEditError(showCustomArea ? 'El área personalizada es requerida' : 'El área de empresa es requerida');
      return;
    }

    if (!editFormData.rolUsuario.trim()) {
      setEditError('El rol de usuario es requerido');
      return;
    }

    // Validar contraseña de confirmación
    if (!editPassword.trim()) {
      setEditError('Debe ingresar su contraseña para confirmar la acción');
      return;
    }

    setIsEditing(true);
    setEditError(null);

    try {
      const response = await fetch('/api/usuarios/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Root-Id': user.id
        },
        body: JSON.stringify({
          userId: userToEdit.id,
          nombre: editFormData.nombre.trim(),
          documento: editFormData.documento.trim(),
          areaEmpresa: areaFinal,
          rolUsuario: editFormData.rolUsuario.trim(),
          confirmPassword: editPassword.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setEditError(errorData.error || 'Error al actualizar el usuario');
        return;
      }

      // Actualizar la lista de usuarios localmente
      setUsuarios(prevUsuarios => 
        prevUsuarios.map(u => 
          u.id === userToEdit.id 
            ? { 
                ...u, 
                nombre: editFormData.nombre.trim(),
                documento: editFormData.documento.trim(),
                areaEmpresa: areaFinal,
                rolUsuario: editFormData.rolUsuario.trim()
              }
            : u
        )
      );

      // Cerrar modal
      cancelEdit();

    } catch (error) {
      console.error('Error editando usuario:', error);
      setEditError('Error interno del servidor');
    } finally {
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    setEditFormData({
      nombre: '',
      documento: '',
      areaEmpresa: '',
      rolUsuario: ''
    });
    setCustomArea('');
    setShowCustomArea(false);
    setEditPassword('');
    setEditError(null);
  };

  if (isLoading) {
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
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center pt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-4 text-white">Cargando usuarios...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Si no es usuario raíz o Admin, no mostrar nada (ya redirigió)
  if (!user || (user.tipoUsuario !== 'raiz' && user.rol !== 'Admin')) {
    return null;
  }

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
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20">
            {/* Header */}
            <div className="mb-8">
              <Link 
                href="/configuracion"
                className="inline-flex items-center text-white hover:text-blue-400 mb-6 transition-colors duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver a Configuración
              </Link>
              
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                        <Users className="text-white" size={32} />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white">Usuarios de mi Empresa</h1>
                        <p className="text-white text-opacity-90">Administrar empleados de su empresa</p>
                      </div>
                    </div>
                    <Link href="/configuracion/crear-usuario">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                        <UserPlus size={16} className="mr-2" />
                        Nuevo Empleado
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barra de búsqueda */}
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg mb-6 border border-white border-opacity-20">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar empleados por nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-blue-400 focus:bg-opacity-30"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Nota informativa sobre permisos */}
            {user?.rol === 'Admin' && (
              <Card className="bg-blue-500 bg-opacity-20 backdrop-blur-md shadow-lg mb-6 border border-blue-400 border-opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-blue-200">
                    <Info size={20} />
                    <div>
                      <p className="text-sm">
                        <strong>Permisos de Administrador:</strong> Tienes acceso completo para crear, editar y gestionar usuarios. 
                        Solo los usuarios raíz pueden eliminar empleados del sistema.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error message */}
            {error && (
              <Card className="bg-red-500 bg-opacity-20 backdrop-blur-md shadow-lg mb-6 border border-red-400 border-opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-red-200">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de usuarios */}
            <div className="space-y-4">
              {filteredUsuarios.length === 0 ? (
                <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg border border-white border-opacity-20">
                  <CardContent className="p-8 text-center">
                    <Users className="mx-auto text-white text-opacity-50 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">No se encontraron empleados</h3>
                    <p className="text-white text-opacity-70">
                      {searchTerm ? 'No hay empleados de su empresa que coincidan con la búsqueda.' : 'Aún no hay empleados registrados en su empresa.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <Card key={usuario.id} className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-20 hover:bg-opacity-40">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-full bg-blue-500 bg-opacity-30">
                            <User className="text-blue-300" size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{usuario.nombre}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-200 border border-blue-400 border-opacity-50">
                                EMPLEADO
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                usuario.estado === 'activo'
                                  ? 'bg-green-500 bg-opacity-20 text-green-200 border border-green-400 border-opacity-50'
                                  : 'bg-red-500 bg-opacity-20 text-red-200 border border-red-400 border-opacity-50'
                              }`}>
                                {usuario.estado.toUpperCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white text-opacity-80">
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} />
                                <span><strong>Documento:</strong> {usuario.documento}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} />
                                <span><strong>Creado:</strong> {new Date(usuario.fechaCreacion).toLocaleDateString('es-ES')}</span>
                              </div>
                              {usuario.areaEmpresa && (
                                <div className="flex items-center space-x-2 md:col-span-3">
                                  <Mail size={16} />
                                  <span><strong>Área:</strong> {usuario.areaEmpresa}</span>
                                </div>
                              )}
                              {usuario.rolUsuario && (
                                <div className="flex items-center space-x-2 md:col-span-3">
                                  <Shield size={16} />
                                  <span><strong>Rol:</strong> {usuario.rolUsuario}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30"
                            onClick={() => handleEditUser(usuario)}
                          >
                            <Edit size={16} className="mr-1" />
                            Editar
                          </Button>
                          {/* Solo usuarios raíz pueden eliminar */}
                          {user?.tipoUsuario === 'raiz' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-500 bg-opacity-20 backdrop-blur-sm border-red-400 border-opacity-50 text-red-200 hover:bg-opacity-30"
                              onClick={() => handleDeleteUser(usuario)}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Eliminar
                            </Button>
                          )}
                          {user?.rol === 'Admin' && (
                            <div className="text-xs text-gray-400 mt-1">
                              Solo usuarios raíz pueden eliminar
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-black bg-opacity-90 backdrop-blur-md border border-red-400 border-opacity-50 rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-red-400 flex items-center">
                    <Trash2 size={20} className="mr-2" />
                    Confirmar Eliminación
                  </h3>
                  <button
                    onClick={cancelDelete}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded-lg p-4">
                    <p className="text-red-200 text-sm">
                      ⚠️ Esta acción es irreversible. El empleado <strong>{userToDelete.nombre}</strong> será eliminado permanentemente del sistema.
                    </p>
                  </div>

                  {deleteError && (
                    <div className="bg-red-500 bg-opacity-30 border border-red-400 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-red-200">
                        <AlertCircle size={16} />
                        <span className="text-sm">{deleteError}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-white text-sm font-medium mb-2 flex items-center">
                      <Lock size={16} className="mr-2" />
                      Confirme su contraseña *
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-red-400"
                      placeholder="Ingrese su contraseña"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Para confirmar, escriba: <span className="text-red-400">Eliminar cuenta de {userToDelete.nombre}</span>
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-red-400"
                      placeholder={`Eliminar cuenta de ${userToDelete.nombre}`}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={confirmDeleteUser}
                      disabled={isDeleting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} className="mr-2" />
                          Eliminar Usuario
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={cancelDelete}
                      variant="outline"
                      className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edición */}
        {showEditModal && userToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-black bg-opacity-90 backdrop-blur-md border border-blue-400 border-opacity-50 rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-400 flex items-center">
                    <Edit size={20} className="mr-2" />
                    Editar Usuario
                  </h3>
                  <button
                    onClick={cancelEdit}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-white text-sm">
                    ⚠️ Está editando el usuario: <strong className="text-blue-400">{userToEdit.nombre}</strong>
                  </p>
                </div>

                {editError && (
                  <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded-lg">
                    <p className="text-red-200 text-sm flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      {editError}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={editFormData.nombre}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-blue-400"
                      placeholder="Ingrese el nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      name="documento"
                      value={editFormData.documento}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-blue-400"
                      placeholder="Ej: 12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Área de Empresa *
                    </label>
                    <select
                      name="areaEmpresa"
                      value={showCustomArea ? 'Otro' : editFormData.areaEmpresa}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="" className="bg-gray-800">Seleccionar área</option>
                      <option value="Administracion" className="bg-gray-800">Administración</option>
                      <option value="Ventas" className="bg-gray-800">Ventas</option>
                      <option value="Marketing" className="bg-gray-800">Marketing</option>
                      <option value="Produccion" className="bg-gray-800">Producción</option>
                      <option value="Sistemas" className="bg-gray-800">Sistemas</option>
                      <option value="Recursos Humanos" className="bg-gray-800">Recursos Humanos</option>
                      <option value="Contabilidad" className="bg-gray-800">Contabilidad</option>
                      <option value="Logistica" className="bg-gray-800">Logística</option>
                      <option value="Otro" className="bg-gray-800">Otro (personalizado)</option>
                    </select>
                    
                    {/* Campo personalizado cuando se selecciona "Otro" */}
                    {showCustomArea && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={customArea}
                          onChange={(e) => setCustomArea(e.target.value)}
                          className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-blue-400"
                          placeholder="Escriba el área personalizada"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Rol de Usuario *
                    </label>
                    <select
                      name="rolUsuario"
                      value={editFormData.rolUsuario}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="" className="bg-gray-800">Seleccionar rol</option>
                      <option value="Admin" className="bg-gray-800">Admin</option>
                      <option value="Compras" className="bg-gray-800">Compras</option>
                      <option value="Visualizacion" className="bg-gray-800">Visualización</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-white border-opacity-20">
                    <label className="block text-white text-sm font-medium mb-2">
                      <Lock size={16} className="inline mr-1" />
                      Confirme su contraseña *
                    </label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:border-blue-400"
                      placeholder="Ingrese su contraseña para confirmar"
                    />
                    <p className="text-white text-opacity-70 text-xs mt-1">
                      Por seguridad, debe confirmar su identidad para actualizar este usuario
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={confirmEditUser}
                      disabled={isEditing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      {isEditing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Edit size={16} className="mr-2" />
                          Actualizar Usuario
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={cancelEdit}
                      variant="outline"
                      className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
