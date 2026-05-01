export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.redirect(302, '/404.html');
    }

    try {
        const response = await fetch(`https://api.calt.gr/events/${id}`);

        if (!response.ok) {
            return res.redirect(302, '/404.html');
        }

        const event = await response.json();

        const title = event.title || 'Event on CALT';
        const description = event.englishDescription || event.greekDescription || 'Discover cultural events on CALT.';
        const image = event.imageUrl || event.initialImageUrl || '';
        const location = event.location || '';
        const startDate = event.startDate || '';
        const endDate = event.endDate || '';
        const time = event.time || '';
        const categories = Array.isArray(event.categories) ? event.categories : [];
        const startingPrice = event.startingPrice || '';
        const tickets = event.tickets || '';
        const closestMetro = event.closestMetro || '';
        const metroWalkTime = event.metroWalkTime || '';
        const galleryImages = Array.isArray(event.galleryImagesUrls) ? event.galleryImagesUrls.slice(0, 6) : [];

        // --- Helpers (runs server-side, no XSS risk — all values come from our own API) ---
        function esc(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function formatEventDate(dateStr) {
            if (!dateStr) return '';
            try {
                const d = new Date(dateStr);
                return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            } catch (e) { return dateStr; }
        }

        function formatEndDate(startStr, endStr) {
            if (!endStr || endStr === startStr) return '';
            try {
                const d = new Date(endStr);
                return ' – ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            } catch (e) { return ''; }
        }

        function mapsUrl(loc) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
        }

        function priceLabel(price) {
            if (!price) return '';
            const lower = price.toLowerCase();
            if (lower === 'free' || lower === '0' || lower === '€0') return 'Free';
            return price.startsWith('€') ? price : `From ${price}`;
        }

        const safeName = esc(title);
        const safeDesc = esc(description);
        const safeImage = esc(image);
        const safeLocation = esc(location);

        const dateDisplay = formatEventDate(startDate) + formatEndDate(startDate, endDate);
        const timeDisplay = time ? esc(time) : '';
        const priceDisplay = priceLabel(startingPrice);

        const categoryPills = categories.map(c =>
            `<span class="pill">${esc(c)}</span>`
        ).join('');

        const metroLine = (closestMetro)
            ? `<div class="info-row">
                <span class="info-icon">🚇</span>
                <div class="info-text">
                    <span class="info-label">${esc(closestMetro)}</span>
                    ${metroWalkTime ? `<span class="info-sub">${esc(metroWalkTime)} min walk</span>` : ''}
                </div>
               </div>`
            : '';

        const gallerySection = galleryImages.length > 0
            ? `<div class="gallery">
                ${galleryImages.map(u => `<img src="${esc(u)}" alt="" class="gallery-img" loading="lazy">`).join('')}
               </div>`
            : '';

        const ticketsBadge = (tickets && tickets.toLowerCase() !== 'free')
            ? `<a href="${esc(tickets)}" target="_blank" rel="noopener noreferrer" class="tickets-link">Get Tickets ↗</a>`
            : '';

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeName} · CALT</title>

    <!-- SEO -->
    <meta name="description" content="${safeDesc}">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://calt.gr/events/${esc(id)}">
    <meta property="og:title" content="${safeName}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="CALT">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeName}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${safeImage}">

    <!-- App Links -->
    <meta property="al:ios:url" content="calt://event/${esc(id)}">
    <meta property="al:ios:app_store_id" content="6743764271">
    <meta property="al:android:url" content="calt://event/${esc(id)}">
    <meta property="al:android:package" content="com.calt.calt_mobile_app">

    <link rel="icon" type="image/png" href="/assets/img/logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">

    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --color-accent:          #72B9E6;
            --color-accent-dark:     #35507B;
            --color-bg:              #000000;
            --color-surface:         #1C1C1C;
            --color-surface-muted:   rgba(255,255,255,0.07);
            --color-surface-hover:   rgba(255,255,255,0.13);
            --color-border:          rgba(255,255,255,0.10);
            --color-text-primary:    #FFFFFF;
            --color-text-secondary:  rgba(255,255,255,0.55);
            --color-text-muted:      rgba(255,255,255,0.35);
            --color-text-on-accent:  #000000;
            --font-ui:   'Poppins', system-ui, sans-serif;
            --font-body: 'Inter',   system-ui, sans-serif;
            --radius-sm:   8px;
            --radius-md:   14px;
            --radius-lg:   16px;
            --radius-xl:   20px;
            --radius-pill: 9999px;
            --shadow-card:  0 8px 28px rgba(0,0,0,0.45);
            --shadow-modal: 0 16px 48px rgba(0,0,0,0.60);
        }

        html { font-size: 16px; -webkit-font-smoothing: antialiased; }

        body {
            background: var(--color-bg);
            color: var(--color-text-primary);
            font-family: var(--font-body);
            line-height: 1.6;
            min-height: 100dvh;
        }

        a { color: inherit; text-decoration: none; }
        img { display: block; max-width: 100%; }

        /* ── Hero ── */
        .hero {
            position: relative;
            width: 100%;
            max-height: 520px;
            overflow: hidden;
        }
        .hero-img {
            width: 100%;
            height: 520px;
            object-fit: cover;
            object-position: center top;
            display: block;
        }
        .hero-fade {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 180px;
            background: linear-gradient(to bottom, transparent, var(--color-bg));
            pointer-events: none;
        }

        /* ── Layout ── */
        .page {
            max-width: 720px;
            margin: 0 auto;
            padding: 0 24px 80px;
        }

        /* ── Categories ── */
        .pills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 32px;
            margin-bottom: 16px;
        }
        .pill {
            display: inline-flex;
            align-items: center;
            padding: 4px 14px;
            border-radius: var(--radius-pill);
            background: var(--color-surface-muted);
            border: 1px solid var(--color-border);
            color: var(--color-accent);
            font-family: var(--font-ui);
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.02em;
            text-transform: uppercase;
        }

        /* ── Event title ── */
        .event-title {
            font-family: var(--font-ui);
            font-size: clamp(28px, 5vw, 42px);
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -0.5px;
            color: var(--color-text-primary);
            margin-bottom: 28px;
        }

        /* ── Info card ── */
        .info-card {
            background: var(--color-surface);
            border-radius: var(--radius-xl);
            border: 1px solid var(--color-border);
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 18px;
            margin-bottom: 32px;
            box-shadow: var(--shadow-card);
        }
        .info-row {
            display: flex;
            align-items: flex-start;
            gap: 16px;
        }
        .info-icon {
            font-size: 20px;
            flex-shrink: 0;
            width: 28px;
            text-align: center;
            margin-top: 1px;
        }
        .info-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .info-label {
            font-family: var(--font-ui);
            font-size: 15px;
            font-weight: 600;
            color: var(--color-text-primary);
            line-height: 1.3;
        }
        .info-sub {
            font-family: var(--font-body);
            font-size: 13px;
            color: var(--color-text-secondary);
        }
        .info-link {
            font-family: var(--font-ui);
            font-size: 15px;
            font-weight: 600;
            color: var(--color-accent);
            line-height: 1.3;
            transition: opacity 150ms ease;
        }
        .info-link:hover { opacity: 0.8; }

        /* ── Price & tickets row ── */
        .meta-row {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 32px;
        }
        .price-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 16px;
            border-radius: var(--radius-pill);
            background: rgba(114,185,230,0.15);
            border: 1px solid rgba(114,185,230,0.30);
            color: var(--color-accent);
            font-family: var(--font-ui);
            font-size: 14px;
            font-weight: 700;
        }
        .tickets-link {
            display: inline-flex;
            align-items: center;
            padding: 6px 18px;
            border-radius: var(--radius-pill);
            background: var(--color-surface-muted);
            border: 1px solid var(--color-border);
            color: var(--color-text-primary);
            font-family: var(--font-ui);
            font-size: 14px;
            font-weight: 600;
            transition: background 150ms ease, border-color 150ms ease;
        }
        .tickets-link:hover {
            background: var(--color-surface-hover);
            border-color: rgba(255,255,255,0.25);
        }

        /* ── Divider ── */
        .divider {
            height: 1px;
            background: var(--color-border);
            margin: 32px 0;
        }

        /* ── Description ── */
        .section-label {
            font-family: var(--font-ui);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--color-text-muted);
            margin-bottom: 12px;
        }
        .description {
            font-family: var(--font-body);
            font-size: 15px;
            line-height: 1.75;
            color: var(--color-text-secondary);
            white-space: pre-wrap;
            word-break: break-word;
        }

        /* ── Gallery ── */
        .gallery {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-top: 24px;
            border-radius: var(--radius-lg);
            overflow: hidden;
        }
        .gallery-img {
            width: 100%;
            aspect-ratio: 1;
            object-fit: cover;
        }

        /* ── CTA ── */
        .cta-section {
            margin-top: 40px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
        }
        .btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 16px 24px;
            background: var(--color-accent);
            color: var(--color-text-on-accent);
            font-family: var(--font-ui);
            font-size: 16px;
            font-weight: 700;
            border: none;
            border-radius: var(--radius-md);
            cursor: pointer;
            text-decoration: none;
            transition: opacity 150ms ease;
        }
        .btn-primary:hover { opacity: 0.88; }
        .btn-primary:active { opacity: 0.78; }
        .btn-primary svg { flex-shrink: 0; }

        .app-store-row {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .app-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 18px;
            border-radius: var(--radius-md);
            background: var(--color-surface-muted);
            border: 1px solid var(--color-border);
            color: var(--color-text-primary);
            font-family: var(--font-ui);
            font-size: 13px;
            font-weight: 600;
            transition: background 150ms ease;
            text-decoration: none;
        }
        .app-badge:hover { background: var(--color-surface-hover); }
        .app-badge-icon { font-size: 18px; }

        /* ── Footer ── */
        .footer {
            margin-top: 56px;
            padding-top: 24px;
            border-top: 1px solid var(--color-border);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: var(--color-text-muted);
            font-family: var(--font-body);
            font-size: 13px;
        }
        .footer img { height: 22px; width: auto; opacity: 0.6; }

        /* ── No image fallback ── */
        .hero-placeholder {
            width: 100%;
            height: 260px;
            background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(114,185,230,0.16), transparent 70%), var(--color-bg);
        }

        @media (max-width: 480px) {
            .gallery { grid-template-columns: repeat(2, 1fr); }
            .app-store-row { flex-direction: column; }
        }

        :focus-visible {
            outline: 2px solid var(--color-accent);
            outline-offset: 3px;
            border-radius: var(--radius-sm);
        }
    </style>
</head>
<body>

    <!-- Hero Image -->
    ${safeImage
        ? `<div class="hero">
            <img src="${safeImage}" alt="${safeName}" class="hero-img">
            <div class="hero-fade"></div>
           </div>`
        : `<div class="hero-placeholder"></div>`
    }

    <div class="page">

        <!-- Categories -->
        ${categoryPills ? `<div class="pills">${categoryPills}</div>` : '<div style="margin-top:32px"></div>'}

        <!-- Title -->
        <h1 class="event-title">${safeName}</h1>

        <!-- Info Card -->
        <div class="info-card">
            ${dateDisplay ? `
            <div class="info-row">
                <span class="info-icon">📅</span>
                <div class="info-text">
                    <span class="info-label">${esc(dateDisplay)}</span>
                    ${timeDisplay ? `<span class="info-sub">${timeDisplay}</span>` : ''}
                </div>
            </div>` : ''}

            ${safeLocation ? `
            <div class="info-row">
                <span class="info-icon">📍</span>
                <div class="info-text">
                    <a href="${mapsUrl(location)}" target="_blank" rel="noopener noreferrer" class="info-link">${safeLocation}</a>
                    <span class="info-sub">View on Google Maps</span>
                </div>
            </div>` : ''}

            ${metroLine}
        </div>

        <!-- Price & Tickets -->
        ${(priceDisplay || ticketsBadge) ? `
        <div class="meta-row">
            ${priceDisplay ? `<span class="price-badge">${esc(priceDisplay)}</span>` : ''}
            ${ticketsBadge}
        </div>` : ''}

        <div class="divider"></div>

        <!-- Description -->
        ${description ? `
        <p class="section-label">About this event</p>
        <p class="description">${safeDesc}</p>` : ''}

        <!-- Gallery -->
        ${gallerySection}

        <!-- CTA -->
        <div class="cta-section">
            <a href="calt://event/${esc(id)}" class="btn-primary" id="deeplink-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
                </svg>
                Open in CALT App
            </a>

            <div class="app-store-row">
                <a href="https://apps.apple.com/app/id6743764271" target="_blank" rel="noopener noreferrer" class="app-badge">
                    <span class="app-badge-icon">🍎</span> App Store
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.calt.calt_mobile_app" target="_blank" rel="noopener noreferrer" class="app-badge">
                    <span class="app-badge-icon">▶</span> Google Play
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <img src="/assets/img/logo.png" alt="CALT">
            <span>Cultural events in Athens</span>
        </div>

    </div>

    <script>
        // Attempt deep-link; if app is not installed, both store links are already visible
        const btn = document.getElementById('deeplink-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'calt://event/${esc(id)}';
            });
        }
    </script>

</body>
</html>`);

    } catch (error) {
        return res.redirect(302, '/404.html');
    }
}