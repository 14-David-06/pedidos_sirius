import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/hooks/useAuth';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sirius Lab - Gestión de Pedidos",
  description: "Sistema de gestión de solicitudes de pedidos para laboratorio Sirius Regenerative Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
