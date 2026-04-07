const fs = require('fs');
const path = require('path');

class SitemapService {
    constructor() {
        this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        this.sitemapPath = path.join(__dirname, '../../frontend/public/sitemap.xml');
    }

    generateSitemap(products, categories) {
        const pages = [
            { url: '/', priority: 1.0, changefreq: 'daily' },
            { url: '/products', priority: 0.9, changefreq: 'daily' },
            { url: '/cart', priority: 0.5, changefreq: 'weekly' },
            { url: '/login', priority: 0.4, changefreq: 'weekly' },
            { url: '/register', priority: 0.4, changefreq: 'weekly' },
        ];

        // Add category pages
        categories.forEach(category => {
            pages.push({
                url: `/products?category=${category}`,
                priority: 0.8,
                changefreq: 'daily'
            });
        });

        // Add product pages
        products.forEach(product => {
            pages.push({
                url: `/products/${product._id}`,
                priority: 0.7,
                changefreq: 'weekly',
                lastmod: product.updatedAt || product.createdAt
            });
        });

        // Generate XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        pages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${this.baseUrl}${page.url}</loc>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            if (page.lastmod) {
                xml += `    <lastmod>${new Date(page.lastmod).toISOString()}</lastmod>\n`;
            }
            xml += '  </url>\n';
        });
        
        xml += '</urlset>';
        
        fs.writeFileSync(this.sitemapPath, xml);
        console.log('✅ Sitemap generated successfully');
        return xml;
    }
}

module.exports = new SitemapService();