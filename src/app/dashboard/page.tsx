import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel de control del laboratorio',
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-medical-900 mb-4">
          Panel de Control
        </h1>
        <p className="text-medical-600 mb-8">
          Bienvenido al sistema de gestión de pedidos de Sirius Lab
        </p>
        
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <p className="text-primary-800">
            🎉 ¡Inicio de sesión exitoso! El dashboard completo se implementará en las siguientes fases del proyecto.
          </p>
        </div>
      </div>
    </div>
  );
}
