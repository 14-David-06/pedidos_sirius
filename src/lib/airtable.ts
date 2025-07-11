import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Airtable API key and Base ID must be configured');
}

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Table names
export const TABLES = {
  USERS: 'Users',
  ORDERS: 'Orders',
  ORDER_ITEMS: 'OrderItems',
  PRODUCTS: 'Products',
} as const;

export default base;
