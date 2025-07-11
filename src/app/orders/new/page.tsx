'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  quantity: number;
}

export default function NewOrderPage() {
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { products } = useProducts();
  const router = useRouter();

  const [formData, setFormData] = useState({
    reason: '',
    estimatedDate: '',
    priority: 'media' as 'alta' | 'media' | 'baja',
    observations: '',
  });

  const [items, setItems] = useState<OrderItem[]>([
    { productId: '', quantity: 1 }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones
    if (!formData.reason || !formData.estimatedDate) {
      setError('Razón y fecha estimada son requeridos');
      setIsLoading(false);
      return;
    }

    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Debe agregar al menos un producto');
      setIsLoading(false);
      return;
    }

    const orderData = {
      ...formData,
      items: validItems,
    };

    const result = await createOrder(orderData);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Error al crear la solicitud');
    }

    setIsLoading(false);
  };

  const reasonOptions = [
    { value: '', label: 'Seleccione una razón' },
    { value: 'Investigación', label: 'Investigación' },
    { value: 'Pruebas de calidad', label: 'Pruebas de calidad' },
    { value: 'Desarrollo de producto', label: 'Desarrollo de producto' },
    { value: 'Análisis microbiológico', label: 'Análisis microbiológico' },
    { value: 'Control de procesos', label: 'Control de procesos' },
    { value: 'Capacitación', label: 'Capacitación' },
    { value: 'Mantenimiento de cultivos', label: 'Mantenimiento de cultivos' },
    { value: 'Otro', label: 'Otro' },
  ];

  const priorityOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
  ];

  // Establecer fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Solicitud</h1>
          <p className="text-gray-600">Crear una nueva solicitud de pedido</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información general */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Input
              label="Solicitante"
              value={user?.name || ''}
              disabled
              className="bg-gray-50"
            />

            <Select
              label="Razón de la petición"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              options={reasonOptions}
              required
            />

            <Input
              label="Fecha estimada de uso"
              name="estimatedDate"
              type="date"
              value={formData.estimatedDate}
              onChange={handleInputChange}
              min={today}
              required
            />

            <Select
              label="Prioridad del pedido"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              options={priorityOptions}
              required
            />

            <Textarea
              label="Observaciones adicionales"
              name="observations"
              value={formData.observations}
              onChange={handleInputChange}
              placeholder="Información adicional o comentarios especiales..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Productos solicitados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Productos Solicitados</CardTitle>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar ítem
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-end space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <Select
                    label="Producto"
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    options={[
                      { value: '', label: 'Seleccione un producto' },
                      ...products.map(product => ({
                        value: product.id,
                        label: `${product.name} (${product.type})`
                      }))
                    ]}
                    required
                  />
                </div>
                
                <div className="w-32">
                  <Input
                    label="Cantidad"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="mb-1"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay productos agregados</p>
                <Button type="button" onClick={addItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer producto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            {isLoading ? 'Creando solicitud...' : 'Crear Solicitud'}
          </Button>
        </div>
      </form>
    </div>
  );
}
