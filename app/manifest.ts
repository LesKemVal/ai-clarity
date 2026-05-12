import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GEORGE by BRANESx',
    short_name: 'GEORGE by BRANESx',
    description: 'Want to get something done? GEORGE is your guide.',
    start_url: '/george',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#7C8CFF',
    icons: [
      {
        src: '/earbud400.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/earbud400.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
