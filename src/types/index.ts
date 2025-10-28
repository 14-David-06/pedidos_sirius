export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'client' | 'field_technician';
  createdAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SoilAnalysisOrder {
  id: string;
  clientName: string;
  sampleLocation: string;
  analysisType: 'physical' | 'chemical' | 'biological' | 'complete';
  priority: 'alta' | 'media' | 'baja';
  status: 'pending' | 'sampling' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedCompletion: string;
  assignedAnalyst?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  sampleDepth?: number;
  landUse?: string;
}

// NUEVO TIPO - Interface para Microorganismo
export interface Microorganismo {
  id: string;
  nombre: string;
  abreviatura: string;
  tipo: 'Hongo' | 'Bacteria' | 'Experimento';
  bolsasLote: number;
  diasIncubacion: number;
}

// Interface para Productos Ordenes (tblWEEp5zjDIYpKfh)
export interface ProductoOrden {
  id: string;
  nombreProducto: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;
  subtotal: number;
  ordenCompraId?: string[];
}

// Interface para Ordenes Compras
export interface OrdenCompra {
  id: string;
  fechaRecogida: string;
  areaSirius: string;
  estadoOrden: 'Pendiente' | 'Confirmado' | 'En Proceso' | 'Enviado' | 'Entregado' | 'Cancelado';
  necesitaEnvio: boolean;
  ubicacionAplicacion?: string;
  observaciones?: string;
  realizaRegistro: string;
  productos?: ProductoOrden[];
  total?: number;
  usuarioId?: string[];
  entidadId?: string[];
}
