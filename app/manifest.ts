import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GEORGE by BRANESx',
    short_name: 'GEORGE',
    description: 'Operational guidance and LIVE runtime support from GEORGE.',
    start_url: '/george',
    display: 'standalone',
    background_color: '#05060A',
    theme_color: '#0B0D12',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  }
}
