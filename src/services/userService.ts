import base, { TABLES } from '@/lib/airtable';
import { User, RegisterData } from '@/types';
import bcrypt from 'bcryptjs';

export class UserService {
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const records = await base(TABLES.USERS)
        .select({
          filterByFormula: `{email} = "${email}"`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) return null;

      const record = records[0];
      return {
        id: record.id,
        email: record.get('email') as string,
        name: record.get('name') as string,
        role: (record.get('role') as 'admin' | 'user') || 'user',
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  static async findById(id: string): Promise<User | null> {
    try {
      const record = await base(TABLES.USERS).find(id);
      return {
        id: record.id,
        email: record.get('email') as string,
        name: record.get('name') as string,
        role: (record.get('role') as 'admin' | 'user') || 'user',
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  static async create(userData: RegisterData): Promise<User | null> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const now = new Date().toISOString();

      const records = await base(TABLES.USERS).create([
        {
          fields: {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            role: 'user',
            createdAt: now,
            updatedAt: now,
          },
        },
      ]);

      const record = records[0];
      return {
        id: record.id,
        email: record.get('email') as string,
        name: record.get('name') as string,
        role: (record.get('role') as 'admin' | 'user') || 'user',
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async verifyPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const records = await base(TABLES.USERS)
        .select({
          filterByFormula: `{email} = "${email}"`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) return null;

      const record = records[0];
      const hashedPassword = record.get('password') as string;

      const isValid = await bcrypt.compare(password, hashedPassword);
      if (!isValid) return null;

      return {
        id: record.id,
        email: record.get('email') as string,
        name: record.get('name') as string,
        role: (record.get('role') as 'admin' | 'user') || 'user',
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      console.error('Error verifying password:', error);
      return null;
    }
  }

  static async updateProfile(
    userId: string,
    data: { name: string; email: string }
  ): Promise<User | null> {
    try {
      const now = new Date().toISOString();
      const records = await base(TABLES.USERS).update([
        {
          id: userId,
          fields: {
            name: data.name,
            email: data.email,
            updatedAt: now,
          },
        },
      ]);

      const record = records[0];
      return {
        id: record.id,
        email: record.get('email') as string,
        name: record.get('name') as string,
        role: (record.get('role') as 'admin' | 'user') || 'user',
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  static async updatePassword(
    userId: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const now = new Date().toISOString();

      await base(TABLES.USERS).update([
        {
          id: userId,
          fields: {
            password: hashedPassword,
            updatedAt: now,
          },
        },
      ]);

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }
}
