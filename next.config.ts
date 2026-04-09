import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Eliminar 'domains' (deprecated) y usar 'remotePatterns'
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bvlgijmmmbvpnnxlakks.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    // Formatos de imagen optimizados
    formats: ['image/avif', 'image/webp'],
    // Mínimo tamaño de imagen para optimizar
    minimumCacheTTL: 60,
    // Deshabilitar para producción si es necesario
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig