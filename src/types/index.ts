// Types for the application
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  type: 'hongo' | 'bacteria';
  category: string;
  description?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  estimatedDate: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso' | 'completado';
  observations?: string;
  items: OrderItem[];
  totalItems: number;
  createdAt: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface CreateOrderData {
  reason: string;
  estimatedDate: string;
  priority: 'alta' | 'media' | 'baja';
  observations?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateProfileData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}
