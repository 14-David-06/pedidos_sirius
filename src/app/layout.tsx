import './globals.css';
import '../styles/sirius-brand.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sirius Regenerative Solutions - Regeneración de Suelos',
  description: 'Empresa especializada en regeneración de suelos y soluciones ambientales sostenibles. ZOMAC Colombia.',
  keywords: ['regeneración de suelos', 'agricultura sostenible', 'análisis de suelos', 'Sirius', 'ZOMAC', 'Colombia'],
  icons: {
    icon: [
      { url: '/Logo-Sirius.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/Logo-Sirius.png',
    apple: '/Logo-Sirius.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/Logo-Sirius.png" type="image/png" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/Logo-Sirius.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
