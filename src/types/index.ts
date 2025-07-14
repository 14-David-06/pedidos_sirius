export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'client';
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

export interface Order {
  id: string;
  patientName: string;
  testType: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedCompletion: string;
  assignedTechnician?: string;
}
