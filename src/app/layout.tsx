import './globals.css';
import '../styles/sirius-brand.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sirius Regenerative Solutions - Regeneración de Suelos',
  description: 'Empresa especializada en regeneración de suelos y soluciones ambientales sostenibles. ZOMAC Colombia.',
  keywords: ['regeneración de suelos', 'agricultura sostenible', 'análisis de suelos', 'Sirius', 'ZOMAC', 'Colombia'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
