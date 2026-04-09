import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CC Reparaciones Móviles | Reparación y Venta de Celulares',
  description: 'Expertos en reparación de celulares y venta de equipos nuevos y usados. Calidad, garantía y los mejores precios en CDMX.',
  keywords: 'reparación de celulares, venta de celulares, iPhone, Samsung, Xiaomi, reparación de pantallas, cambio de batería',
  authors: [{ name: 'CC Reparaciones Móviles' }],
  openGraph: {
    title: 'CC Reparaciones Móviles',
    description: 'Expertos en reparación de celulares y venta de equipos nuevos y usados',
    type: 'website',
    locale: 'es_MX',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}