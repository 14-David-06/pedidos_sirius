'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { useAuth } from './useAuth';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchOrders = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar las solicitudes');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    if (!token) return { success: false, error: 'No autorizado' };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const newOrder = await response.json();
        setOrders((prev) => [newOrder, ...prev]);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!token) return { success: false, error: 'No autorizado' };

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Actualizar el estado local
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: status as any } : order
          )
        );
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
  };
}
