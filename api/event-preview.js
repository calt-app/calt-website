export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.redirect(302, '/404.html');
    }

    try {
        // TODO: Replace with your actual API endpoint
        const response = await fetch(`https://api.calt.gr/events/${id}`);

        if (!response.ok) {
            return res.redirect(302, '/404.html');
        }

        const event = await response.json();
        const title = event.title || 'Event on CALT';
        const description = event.englishDescription || 'Discover cultural events';
        const image = event.initialImageUrl;

        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title} - CALT</title>
            
            <!-- Open Graph -->
            <meta property="og:type" content="website">
            <meta property="og:url" content="https://calt.gr/events/${id}">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${image}">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            
            <!-- Twitter -->
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
            <meta name="twitter:image" content="${image}">
            
            <!-- App Links -->
            <meta property="al:ios:url" content="calt://event/${id}">
            <meta property="al:ios:app_store_id" content="6743764271">
            <meta property="al:android:url" content="calt://event/${id}">
            <meta property="al:android:package" content="com.calt.calt_mobile_app">
            
            <link rel="icon" type="image/png" href="/assets/img/logo.png">
            <link rel="stylesheet" href="/css/styles.css">
            
            <style>
                body {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    text-align: center;
                }
                .container { max-width: 600px; }
                .event-img {
                    max-width: 400px;
                    width: 100%;
                    border-radius: 1rem;
                    margin-bottom: 2rem;
                }
                h1 {
                    font-size: clamp(1.5rem, 5vw, 2.5rem);
                    font-weight: 800;
                    margin-bottom: 1rem;
                }
                p {
                    color: var(--color-gray-medium);
                    margin-bottom: 2rem;
                }
                .btn {
                    display: inline-block;
                    background: var(--color-primary);
                    color: white;
                    padding: 0.875rem 2rem;
                    border-radius: 3rem;
                    font-weight: 700;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="${image}" alt="${title}" class="event-img">
                <h1>${title}</h1>
                <p>${description}</p>
                <a href="calt://event/${id}" class="btn">Open in CALT</a>
            </div>
            <script>
                setTimeout(() => window.location.href = 'calt://event/${id}', 2000);
            </script>
        </body>
        </html>`);

    } catch (error) {
        return res.redirect(302, '/404.html');
    }
}