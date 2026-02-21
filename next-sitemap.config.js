/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://psycheverse.org',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/auth/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/auth', '/api'],
      },
    ],
    additionalSitemaps: [
      'https://psycheverse.org/sitemap.xml',
    ],
  },
  additionalPaths: async () => [
    { loc: '/directory', changefreq: 'hourly', priority: 0.9 },
    { loc: '/blog', changefreq: 'daily', priority: 0.8 },
    { loc: '/submit', changefreq: 'monthly', priority: 0.6 },
    { loc: '/advertise', changefreq: 'monthly', priority: 0.5 },
  ],
}