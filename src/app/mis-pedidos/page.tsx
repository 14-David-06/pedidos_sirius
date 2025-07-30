'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  Truck,
  FileText
} from 'lucide-react';

export default function MisPedidosPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPedidos([]);
      setIsLoading(false);
    }, 1000);
  }, []);

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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center pt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="mt-4 text-white">Cargando tus pedidos...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20">
            <div className="mb-8">
              <Link 
                href="/dashboard"
                className="inline-flex items-center text-white hover:text-green-400 mb-6 transition-colors duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver al Dashboard
              </Link>
              
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                      <Package className="text-white" size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">Mis Pedidos</h1>
                      <p className="text-white text-opacity-90">Consulta el estado de todos tus pedidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg mb-8 border border-white border-opacity-20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Información del Cliente</h3>
                    <p className="text-white text-opacity-90">{user?.nombre}</p>
                    <p className="text-sm text-white text-opacity-70">Documento: {user?.documento}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">{pedidos.length}</p>
                    <p className="text-sm text-white text-opacity-70">Total de pedidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg border border-white border-opacity-20">
              <CardContent className="p-12 text-center">
                <Package className="text-white text-opacity-60 mb-4 mx-auto" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">No tienes pedidos</h3>
                <p className="text-white text-opacity-80 mb-6">
                  Aún no has realizado ningún pedido. ¡Comienza ahora!
                </p>
                <Link href="/dashboard">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Hacer un Pedido
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="mt-12 text-center">
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    ¿Necesitas hacer otro pedido?
                  </h3>
                  <div className="space-x-4">
                    <Link href="/pedido?tipo=biologicos">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Pedido de Biológicos
                      </Button>
                    </Link>
                    <Link href="/pedido?tipo=biochar">
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                        Pedido de Biochar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
