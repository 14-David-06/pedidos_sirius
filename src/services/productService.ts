import base, { TABLES } from '@/lib/airtable';
import { Product } from '@/types';

export class ProductService {
  static async getAll(): Promise<Product[]> {
    try {
      const records = await base(TABLES.PRODUCTS)
        .select({
          sort: [{ field: 'name', direction: 'asc' }],
        })
        .all();

      return records.map((record) => ({
        id: record.id,
        name: record.get('name') as string,
        type: record.get('type') as 'hongo' | 'bacteria',
        category: record.get('category') as string,
        description: record.get('description') as string,
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  static async findById(id: string): Promise<Product | null> {
    try {
      const record = await base(TABLES.PRODUCTS).find(id);
      return {
        id: record.id,
        name: record.get('name') as string,
        type: record.get('type') as 'hongo' | 'bacteria',
        category: record.get('category') as string,
        description: record.get('description') as string,
      };
    } catch (error) {
      console.error('Error finding product by ID:', error);
      return null;
    }
  }

  // Método para inicializar productos predefinidos
  static async seedProducts(): Promise<void> {
    try {
      const existingProducts = await this.getAll();
      if (existingProducts.length > 0) return;

      const defaultProducts = [
        // Hongos
        {
          name: 'Aspergillus niger',
          type: 'hongo',
          category: 'Aspergillus',
          description: 'Hongo filamentoso común en laboratorios',
        },
        {
          name: 'Penicillium chrysogenum',
          type: 'hongo',
          category: 'Penicillium',
          description: 'Productor de penicilina',
        },
        {
          name: 'Saccharomyces cerevisiae',
          type: 'hongo',
          category: 'Levaduras',
          description: 'Levadura de cerveza',
        },
        {
          name: 'Candida albicans',
          type: 'hongo',
          category: 'Candida',
          description: 'Levadura patógena',
        },
        // Bacterias
        {
          name: 'Escherichia coli',
          type: 'bacteria',
          category: 'Enterobacterias',
          description: 'Bacteria gram negativa modelo',
        },
        {
          name: 'Staphylococcus aureus',
          type: 'bacteria',
          category: 'Staphylococcus',
          description: 'Bacteria gram positiva',
        },
        {
          name: 'Bacillus subtilis',
          type: 'bacteria',
          category: 'Bacillus',
          description: 'Bacteria formadora de esporas',
        },
        {
          name: 'Pseudomonas aeruginosa',
          type: 'bacteria',
          category: 'Pseudomonas',
          description: 'Bacteria gram negativa',
        },
      ];

      const records = defaultProducts.map((product) => ({
        fields: product,
      }));

      await base(TABLES.PRODUCTS).create(records);
      console.log('Default products seeded successfully');
    } catch (error) {
      console.error('Error seeding products:', error);
    }
  }
}
