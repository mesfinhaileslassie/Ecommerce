import React from 'react';
import { Helmet } from 'react-helmet-async';

const HelmetSEO = ({ 
    title, 
    description, 
    keywords, 
    image, 
    url, 
    type = 'website',
    author = 'E-Shop',
    publishedTime,
    modifiedTime,
    tags = [],
    price,
    currency = 'USD',
    availability
}) => {
    const siteTitle = title ? `${title} | Habesha Market` : 'Habesha Market - Ethiopian Online Store';
    const siteDescription = description || 'Discover amazing products at unbeatable prices. Shop electronics, clothing, books, home goods, and more with fast delivery and secure payment.';
    const siteUrl = url || `https://yourdomain.com${window.location.pathname}`;
    const siteImage = image || 'https://yourdomain.com/og-image.jpg';
    const siteKeywords = keywords || 'e-commerce, online shopping, electronics, clothing, books, home goods, Ethiopia';

    // Generate JSON-LD structured data
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': type === 'product' ? 'Product' : 'WebSite',
        name: title || 'E-Shop',
        description: siteDescription,
        url: siteUrl,
    };

    // Add product-specific structured data
    if (type === 'product' && price) {
        structuredData.offers = {
            '@type': 'Offer',
            price: price,
            priceCurrency: currency,
            availability: availability === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: siteUrl,
        };
        
        if (image) {
            structuredData.image = image;
        }
        
        if (tags && tags.length > 0) {
            structuredData.keywords = tags.join(', ');
        }
    }

    // Add breadcrumb structured data
    const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://yourdomain.com'
            }
        ]
    };

    // Add current page to breadcrumb based on pathname
    const path = window.location.pathname;
    if (path.includes('/products')) {
        breadcrumbData.itemListElement.push({
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: `https://yourdomain.com/products`
        });
        
        if (path.includes('/products/')) {
            breadcrumbData.itemListElement.push({
                '@type': 'ListItem',
                position: 3,
                name: title || 'Product Details',
                item: siteUrl
            });
        }
    } else if (path.includes('/cart')) {
        breadcrumbData.itemListElement.push({
            '@type': 'ListItem',
            position: 2,
            name: 'Shopping Cart',
            item: siteUrl
        });
    } else if (path.includes('/checkout')) {
        breadcrumbData.itemListElement.push({
            '@type': 'ListItem',
            position: 2,
            name: 'Checkout',
            item: siteUrl
        });
    }

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={siteDescription} />
            <meta name="keywords" content={siteKeywords} />
            <meta name="author" content={author} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            
            {/* Canonical URL */}
            <link rel="canonical" href={siteUrl} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={siteImage} />
            <meta property="og:site_name" content="E-Shop" />
            <meta property="og:locale" content="en_US" />
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={siteUrl} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={siteDescription} />
            <meta name="twitter:image" content={siteImage} />
            
            {/* Additional SEO Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <link rel="alternate" href={siteUrl} hrefLang="en" />
            
            {/* Article specific tags */}
            {type === 'article' && publishedTime && (
                <>
                    <meta property="article:published_time" content={publishedTime} />
                    <meta property="article:modified_time" content={modifiedTime || publishedTime} />
                    <meta property="article:author" content={author} />
                </>
            )}
            
            {/* Product specific tags */}
            {type === 'product' && price && (
                <>
                    <meta property="product:price:amount" content={price} />
                    <meta property="product:price:currency" content={currency} />
                    <meta property="product:availability" content={availability} />
                </>
            )}
            
            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbData)}
            </script>
            
            {/* Preconnect for performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </Helmet>
    );
};

export default HelmetSEO;