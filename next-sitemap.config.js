/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://psycheverse.org',
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