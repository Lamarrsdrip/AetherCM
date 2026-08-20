import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aether Capital Markets',
    short_name: 'AetherCM',
    description: 'Modern investing and private client workspace.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f7faf7',
    theme_color: '#1f5a46',
    icons: []
  }
}
