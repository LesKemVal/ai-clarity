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
        src: '/logo900.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/logo900.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/bxnew20.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
