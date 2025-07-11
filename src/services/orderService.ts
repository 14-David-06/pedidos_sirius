import base, { TABLES } from '@/lib/airtable';
import { Order, CreateOrderData, OrderItem } from '@/types';
import { ProductService } from './productService';

export class OrderService {
  static async create(
    userId: string,
    userName: string,
    userEmail: string,
    orderData: CreateOrderData
  ): Promise<Order | null> {
    try {
      const now = new Date().toISOString();

      // Crear la orden principal
      const orderRecords = await base(TABLES.ORDERS).create([
        {
          fields: {
            userId,
            userName,
            userEmail,
            reason: orderData.reason,
            estimatedDate: orderData.estimatedDate,
            priority: orderData.priority,
            status: 'pendiente',
            observations: orderData.observations || '',
            totalItems: orderData.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
            createdAt: now,
            updatedAt: now,
          },
        },
      ]);

      const orderRecord = orderRecords[0];
      const orderId = orderRecord.id;

      // Crear los items de la orden
      const itemRecords = [];
      for (const item of orderData.items) {
        const product = await ProductService.findById(item.productId);
        if (product) {
          itemRecords.push({
            fields: {
              orderId,
              productId: item.productId,
              productName: product.name,
              quantity: item.quantity,
            },
          });
        }
      }

      const createdItems = await base(TABLES.ORDER_ITEMS).create(itemRecords);

      // Construir el objeto Order completo
      const items: OrderItem[] = createdItems.map((record) => ({
        id: record.id,
        productId: record.get('productId') as string,
        productName: record.get('productName') as string,
        quantity: record.get('quantity') as number,
      }));

      return {
        id: orderId,
        userId,
        userName,
        userEmail,
        reason: orderData.reason,
        estimatedDate: orderData.estimatedDate,
        priority: orderData.priority,
        status: 'pendiente',
        observations: orderData.observations || '',
        items,
        totalItems: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  static async getByUserId(userId: string): Promise<Order[]> {
    try {
      const orderRecords = await base(TABLES.ORDERS)
        .select({
          filterByFormula: `{userId} = "${userId}"`,
          sort: [{ field: 'createdAt', direction: 'desc' }],
        })
        .all();

      const orders: Order[] = [];

      for (const orderRecord of orderRecords) {
        const orderId = orderRecord.id;

        // Obtener los items de esta orden
        const itemRecords = await base(TABLES.ORDER_ITEMS)
          .select({
            filterByFormula: `{orderId} = "${orderId}"`,
          })
          .all();

        const items: OrderItem[] = itemRecords.map((record) => ({
          id: record.id,
          productId: record.get('productId') as string,
          productName: record.get('productName') as string,
          quantity: record.get('quantity') as number,
        }));

        orders.push({
          id: orderId,
          userId: orderRecord.get('userId') as string,
          userName: orderRecord.get('userName') as string,
          userEmail: orderRecord.get('userEmail') as string,
          reason: orderRecord.get('reason') as string,
          estimatedDate: orderRecord.get('estimatedDate') as string,
          priority: orderRecord.get('priority') as 'alta' | 'media' | 'baja',
          status: orderRecord.get('status') as
            | 'pendiente'
            | 'aprobado'
            | 'rechazado'
            | 'en_proceso'
            | 'completado',
          observations: orderRecord.get('observations') as string,
          items,
          totalItems: orderRecord.get('totalItems') as number,
          createdAt: orderRecord.get('createdAt') as string,
          updatedAt: orderRecord.get('updatedAt') as string,
          approvedBy: orderRecord.get('approvedBy') as string,
          approvedAt: orderRecord.get('approvedAt') as string,
        });
      }

      return orders;
    } catch (error) {
      console.error('Error getting orders by user:', error);
      return [];
    }
  }

  static async getAll(): Promise<Order[]> {
    try {
      const orderRecords = await base(TABLES.ORDERS)
        .select({
          sort: [{ field: 'createdAt', direction: 'desc' }],
        })
        .all();

      const orders: Order[] = [];

      for (const orderRecord of orderRecords) {
        const orderId = orderRecord.id;

        // Obtener los items de esta orden
        const itemRecords = await base(TABLES.ORDER_ITEMS)
          .select({
            filterByFormula: `{orderId} = "${orderId}"`,
          })
          .all();

        const items: OrderItem[] = itemRecords.map((record) => ({
          id: record.id,
          productId: record.get('productId') as string,
          productName: record.get('productName') as string,
          quantity: record.get('quantity') as number,
        }));

        orders.push({
          id: orderId,
          userId: orderRecord.get('userId') as string,
          userName: orderRecord.get('userName') as string,
          userEmail: orderRecord.get('userEmail') as string,
          reason: orderRecord.get('reason') as string,
          estimatedDate: orderRecord.get('estimatedDate') as string,
          priority: orderRecord.get('priority') as 'alta' | 'media' | 'baja',
          status: orderRecord.get('status') as
            | 'pendiente'
            | 'aprobado'
            | 'rechazado'
            | 'en_proceso'
            | 'completado',
          observations: orderRecord.get('observations') as string,
          items,
          totalItems: orderRecord.get('totalItems') as number,
          createdAt: orderRecord.get('createdAt') as string,
          updatedAt: orderRecord.get('updatedAt') as string,
          approvedBy: orderRecord.get('approvedBy') as string,
          approvedAt: orderRecord.get('approvedAt') as string,
        });
      }

      return orders;
    } catch (error) {
      console.error('Error getting all orders:', error);
      return [];
    }
  }

  static async updateStatus(
    orderId: string,
    status: string,
    approvedBy?: string
  ): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const updateFields: any = {
        status,
        updatedAt: now,
      };

      if (approvedBy) {
        updateFields.approvedBy = approvedBy;
        updateFields.approvedAt = now;
      }

      await base(TABLES.ORDERS).update([
        {
          id: orderId,
          fields: updateFields,
        },
      ]);

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  static async findById(orderId: string): Promise<Order | null> {
    try {
      const orderRecord = await base(TABLES.ORDERS).find(orderId);

      // Obtener los items de esta orden
      const itemRecords = await base(TABLES.ORDER_ITEMS)
        .select({
          filterByFormula: `{orderId} = "${orderId}"`,
        })
        .all();

      const items: OrderItem[] = itemRecords.map((record) => ({
        id: record.id,
        productId: record.get('productId') as string,
        productName: record.get('productName') as string,
        quantity: record.get('quantity') as number,
      }));

      return {
        id: orderId,
        userId: orderRecord.get('userId') as string,
        userName: orderRecord.get('userName') as string,
        userEmail: orderRecord.get('userEmail') as string,
        reason: orderRecord.get('reason') as string,
        estimatedDate: orderRecord.get('estimatedDate') as string,
        priority: orderRecord.get('priority') as 'alta' | 'media' | 'baja',
        status: orderRecord.get('status') as
          | 'pendiente'
          | 'aprobado'
          | 'rechazado'
          | 'en_proceso'
          | 'completado',
        observations: orderRecord.get('observations') as string,
        items,
        totalItems: orderRecord.get('totalItems') as number,
        createdAt: orderRecord.get('createdAt') as string,
        updatedAt: orderRecord.get('updatedAt') as string,
        approvedBy: orderRecord.get('approvedBy') as string,
        approvedAt: orderRecord.get('approvedAt') as string,
      };
    } catch (error) {
      console.error('Error finding order by ID:', error);
      return null;
    }
  }
}
