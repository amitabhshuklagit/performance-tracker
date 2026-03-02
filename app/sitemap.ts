export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'

export default function sitemap() {
  const routes = ['', '/review', '/interview'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return routes
}
