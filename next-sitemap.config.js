/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://streameraura.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin'],
      },
    ],
  },
}