export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) return res.redirect(302, '/404.html');

    try {
        const response = await fetch(`https://api.calt.gr/events/${id}`);

        if (!response.ok) return res.redirect(302, '/404.html');

        const event = await response.json();

        const title         = event.title || 'Event on CALT';
        const description   = event.englishDescription || event.greekDescription || '';
        const image         = event.imageUrl || event.initialImageUrl || '';
        const location      = event.location || '';
        const startDate     = event.startDate || '';
        const endDate       = event.endDate   || '';
        const time          = event.time      || '';
        const categories    = Array.isArray(event.categories) ? event.categories : [];
        const startingPrice = event.startingPrice || '';
        const tickets       = event.tickets       || '';
        const closestMetro  = event.closestMetro  || '';
        const metroWalkTime = event.metroWalkTime || '';
        const galleryImages = Array.isArray(event.galleryImagesUrls)
            ? event.galleryImagesUrls.slice(0, 4) : [];

        function esc(s) {
            return String(s ?? '')
                .replace(/&/g, '&amp;').replace(/</g, '&lt;')
                .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        const d        = startDate ? new Date(startDate) : null;
        const calDay   = d ? d.getDate() : '';
        const calMonth = d ? d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
        const fullDate = d ? d.toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long'
        }) : '';
        const endSuffix = (() => {
            if (!endDate || !d || endDate === startDate) return '';
            try {
                const e = new Date(endDate);
                return e.toDateString() === d.toDateString()
                    ? '' : ' \u2013 ' + e.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
            } catch { return ''; }
        })();

        function mapsUrl(loc) {
            return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc);
        }
        function priceText(p) {
            if (!p) return '';
            const l = p.toLowerCase().trim();
            if (l === 'free' || l === '0') return 'Free entry';
            return p.startsWith('\u20ac') ? p : '\u20ac' + p;
        }

        const safeName     = esc(title);
        const safeDesc     = esc(description);
        const safeMetaDesc = esc(description.slice(0, 160));
        const safeImg      = esc(image);
        const safeLoc      = esc(location);
        const safeId       = esc(id);
        const priceLabel   = priceText(startingPrice);
        const dateRange    = esc(fullDate + endSuffix);
        const safeTime     = esc(time);

        const pills = categories.slice(0, 5)
            .map(c => `<span class="pill">${esc(c)}</span>`).join('');

        const dateRow = d ? `
            <div class="row">
              <div class="cal-box">
                <span class="cal-mon">${calMonth}</span>
                <span class="cal-day">${calDay}</span>
              </div>
              <div class="row-body">
                <span class="row-main">${dateRange}</span>
                ${safeTime ? `<span class="row-sub">${safeTime}</span>` : ''}
              </div>
            </div>` : '';

        const locationRow = location ? `
            <div class="row">
              <div class="pin-box">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
                </svg>
              </div>
              <div class="row-body">
                <a class="row-main row-link" href="${mapsUrl(location)}" target="_blank" rel="noopener noreferrer">${safeLoc}</a>
              </div>
            </div>` : '';

        const metroRow = closestMetro ? `
            <div class="row">
              <div class="metro-box">M</div>
              <div class="row-body">
                <span class="row-main">${esc(closestMetro)}</span>
                ${metroWalkTime ? `<span class="row-sub">${esc(metroWalkTime)} min walk</span>` : ''}
              </div>
            </div>` : '';

        const galleryHtml = galleryImages.length > 0 ? `
            <div class="gallery">
              ${galleryImages.map(u => `<img src="${esc(u)}" alt="" class="gimg" loading="lazy">`).join('')}
            </div>` : '';

        const locationSection = location ? `
            <div class="sep"></div>
            <p class="sec-label">Location</p>
            <a class="loc-block" href="${mapsUrl(location)}" target="_blank" rel="noopener noreferrer">
              <span class="loc-name">${safeLoc}</span>
              <span class="loc-hint">View on Google Maps \u2192</span>
            </a>` : '';

        const htmlOut = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeName} \u00b7 CALT</title>
  <meta name="description" content="${safeMetaDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://calt.gr/events/${safeId}">
  <meta property="og:title" content="${safeName}">
  <meta property="og:description" content="${safeMetaDesc}">
  <meta property="og:image" content="${safeImg}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="CALT">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeName}">
  <meta name="twitter:description" content="${safeMetaDesc}">
  <meta name="twitter:image" content="${safeImg}">
  <meta property="al:ios:url" content="calt://event/${safeId}">
  <meta property="al:ios:app_store_id" content="6743764271">
  <meta property="al:android:url" content="calt://event/${safeId}">
  <meta property="al:android:package" content="com.calt.calt_mobile_app">
  <link rel="icon" type="image/png" href="/assets/img/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --acc:    #72B9E6;
      --on-acc: #000;
      --bg:     #EEF3F9;
      --surf:   rgba(0,0,0,0.05);
      --surf-h: rgba(0,0,0,0.09);
      --sep:    rgba(0,0,0,0.08);
      --t1:     #0F1923;
      --t2:     rgba(15,25,35,0.55);
      --t3:     rgba(15,25,35,0.38);
      --ui:     'Poppins', system-ui, sans-serif;
      --body:   'Inter', system-ui, sans-serif;
    }
    html { -webkit-font-smoothing: antialiased; font-size: 16px; }
    body {
      background: var(--bg);
      color: var(--t1);
      font-family: var(--body);
      line-height: 1.6;
      min-height: 100dvh;
    }
    a { color: inherit; text-decoration: none; }
    img { display: block; max-width: 100%; }

    .page {
      background:
        radial-gradient(ellipse 80% 50% at 25% -10%, rgba(114,185,230,0.10), transparent 55%),
        var(--bg);
    }

    .layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 52px;
      align-items: start;
      max-width: 1020px;
      margin: 0 auto;
      padding: 52px 32px 100px;
    }

    /* left */
    .col-left { position: sticky; top: 40px; }

    .cover-wrap {
      width: 100%;
      aspect-ratio: 4 / 5;
      border-radius: 18px;
      overflow: hidden;
      background: rgba(255,255,255,0.04);
    }
    .cover-img  { width: 100%; height: 100%; object-fit: cover; display: block; }
    .cover-empty {
      width: 100%; height: 100%;
      background: radial-gradient(ellipse at 50% 40%, rgba(114,185,230,0.18), transparent 65%);
    }
    .calt-credit {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      color: var(--t3);
      font-family: var(--ui);
      font-size: 12px;
      font-weight: 500;
    }
    .calt-credit img { height: 18px; width: auto; opacity: 0.55; }

    /* right */
    .col-right { min-width: 0; }

    .pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .pill {
      display: inline-flex;
      align-items: center;
      padding: 3px 11px;
      border-radius: 9999px;
      background: rgba(114,185,230,0.15);
      color: var(--acc);
      font-family: var(--ui);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .event-title {
      font-family: var(--ui);
      font-size: clamp(24px, 3.5vw, 38px);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.5px;
      color: var(--t1);
      margin-bottom: 24px;
    }

    .rows { display: flex; flex-direction: column; margin-bottom: 26px; }
    .row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 13px 0;
      border-bottom: 1px solid var(--sep);
    }
    .row:first-child { border-top: 1px solid var(--sep); }

    .cal-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 46px;
      background: var(--surf);
      border-radius: 9px;
      flex-shrink: 0;
    }
    .cal-mon {
      font-family: var(--ui);
      font-size: 9px; font-weight: 700;
      letter-spacing: 0.07em;
      color: var(--acc);
      line-height: 1;
    }
    .cal-day {
      font-family: var(--ui);
      font-size: 20px; font-weight: 800;
      color: var(--t1);
      line-height: 1.1;
    }
    .pin-box {
      width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      color: var(--t2);
    }
    .metro-box {
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      background: var(--surf);
      border-radius: 50%;
      font-family: var(--ui);
      font-size: 12px; font-weight: 800;
      color: var(--acc);
      margin: 7px 7px;
    }
    .row-body { display: flex; flex-direction: column; gap: 2px; padding-top: 2px; }
    .row-main { font-family: var(--ui); font-size: 14px; font-weight: 600; color: var(--t1); line-height: 1.3; }
    .row-sub  { font-family: var(--body); font-size: 13px; color: var(--t2); }
    .row-link { color: var(--acc); transition: opacity 150ms ease; }
    .row-link:hover { opacity: 0.8; }

    .price-line { font-family: var(--ui); font-size: 14px; font-weight: 600; color: var(--t2); margin-bottom: 18px; }
    .price-line b { color: var(--t1); }

    .btn-cta {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px 24px;
      background: var(--acc); color: var(--on-acc);
      font-family: var(--ui); font-size: 15px; font-weight: 700;
      border-radius: 13px;
      cursor: pointer; text-decoration: none;
      transition: opacity 150ms ease;
      margin-bottom: 10px;
    }
    .btn-cta:hover  { opacity: 0.88; }
    .btn-cta:active { opacity: 0.75; }

    .store-row { display: flex; gap: 10px; margin-bottom: 32px; }
    .store-btn {
      flex: 1;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 150ms ease;
    }
    .store-btn:hover { opacity: 0.82; }
    .store-btn img { height: 42px; width: auto; display: block; }

    .sep { height: 1px; background: var(--sep); margin: 28px 0; }
    .sec-label {
      font-family: var(--ui); font-size: 12px; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: var(--t3); margin-bottom: 12px;
    }

    .desc {
      font-family: var(--body); font-size: 15px; line-height: 1.75;
      color: var(--t2);
      white-space: pre-line; word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .desc.expanded { display: block; overflow: visible; }
    .toggle-btn {
      background: none; border: none; cursor: pointer;
      font-family: var(--ui); font-size: 14px; font-weight: 600;
      color: var(--acc); padding: 8px 0 0;
      transition: opacity 150ms ease;
    }
    .toggle-btn:hover { opacity: 0.75; }

    .gallery { display: grid; grid-template-columns: repeat(2,1fr); gap: 6px; margin-top: 20px; border-radius: 14px; overflow: hidden; }
    .gimg { width: 100%; aspect-ratio: 1; object-fit: cover; }

    .loc-block { display: flex; flex-direction: column; gap: 3px; padding: 14px 0; }
    .loc-name { font-family: var(--ui); font-size: 15px; font-weight: 600; color: var(--t1); }
    .loc-hint { font-family: var(--body); font-size: 13px; color: var(--acc); }
    .loc-block:hover .loc-hint { opacity: 0.8; }

    @media (max-width: 740px) {
      .layout { grid-template-columns: 1fr; gap: 24px; padding: 24px 20px 80px; }
      .col-left { position: static; }
      .store-row { flex-direction: column; }
    }
    :focus-visible { outline: 2px solid var(--acc); outline-offset: 3px; border-radius: 6px; }
  </style>
</head>
<body>
<div class="page">
  <div class="layout">

    <div class="col-left">
      <div class="cover-wrap">
        ${safeImg
            ? `<img src="${safeImg}" alt="${safeName}" class="cover-img">`
            : `<div class="cover-empty"></div>`
        }
      </div>
      <div class="calt-credit">
        <img src="/assets/img/logo.png" alt="CALT">
        <span>calt.gr &middot; Cultural events in Athens</span>
      </div>
    </div>

    <div class="col-right">
      ${pills ? `<div class="pills">${pills}</div>` : ''}
      <h1 class="event-title">${safeName}</h1>

      <div class="rows">
        ${dateRow}
        ${locationRow}
        ${metroRow}
      </div>

      ${priceLabel ? `<p class="price-line"><b>${esc(priceLabel)}</b></p>` : ''}

      <a href="calt://event/${safeId}" class="btn-cta" id="open-btn">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
        </svg>
        Open in CALT App
      </a>

      <div class="store-row">
        <a href="https://apps.apple.com/app/id6743764271" target="_blank" rel="noopener noreferrer" class="store-btn">
          <img src="/assets/img/app-store-badge.png" alt="Download on the App Store">
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.calt.calt_mobile_app" target="_blank" rel="noopener noreferrer" class="store-btn">
          <img src="/assets/img/google-play-badge.png" alt="Get it on Google Play">
        </a>
      </div>

      ${safeDesc ? `
      <div class="sep"></div>
      <p class="sec-label">About Event</p>
      <p class="desc" id="desc-el">${safeDesc}</p>
      <button class="toggle-btn" id="toggle-btn" aria-expanded="false" style="display:none">Show more</button>` : ''}

      ${galleryHtml}
      ${locationSection}
    </div>

  </div>
</div>
<script>
(function(){
  var ob=document.getElementById('open-btn');
  if(ob) ob.addEventListener('click',function(e){e.preventDefault();window.location.href='calt://event/${safeId}';});
  var desc=document.getElementById('desc-el'),btn=document.getElementById('toggle-btn');
  if(desc&&btn){
    window.addEventListener('load',function(){if(desc.scrollHeight>desc.clientHeight+4)btn.style.display='block';});
    btn.addEventListener('click',function(){var o=desc.classList.toggle('expanded');btn.textContent=o?'Show less':'Show more';btn.setAttribute('aria-expanded',String(o));});
  }
})();
</script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(htmlOut);

    } catch (error) {
        return res.redirect(302, '/404.html');
    }
}
