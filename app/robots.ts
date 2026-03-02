export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'}/sitemap.xml`,
  }
}
