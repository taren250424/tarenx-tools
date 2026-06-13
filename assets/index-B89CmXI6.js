(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=Object.entries(Object.assign({"../index.html":`<!doctype html>\r
<html lang="en">\r
	<head>\r
		<!-- Google Tag Manager -->\r
		<script>\r
			(function (w, d, s, l, i) {\r
				w[l] = w[l] || [];\r
				w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });\r
				var f = d.getElementsByTagName(s)[0],\r
					j = d.createElement(s),\r
					dl = l != "dataLayer" ? "&l=" + l : "";\r
				j.async = true;\r
				j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;\r
				f.parentNode.insertBefore(j, f);\r
			})(window, document, "script", "dataLayer", "GTM-NLCK842B");\r
		<\/script>\r
		<!-- End Google Tag Manager -->\r
\r
		<meta charset="UTF-8" />\r
\r
		<meta\r
			name="description"\r
			content="A collection of handy web utilities. Copy Unicode symbols, and more."\r
		/>\r
\r
		<link rel="canonical" href="https://tools.tarenx.com/" />\r
		<link rel="icon" type="image/svg+xml" href="shared/hub/favicon.svg" />\r
\r
		<meta property="og:title" content="Tarenx tools" />\r
		<meta\r
			property="og:description"\r
			content="A collection of handy web utilities."\r
		/>\r
		<meta property="og:image" content="shared/hub/og.svg" />\r
\r
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />\r
		<title>Tarenx Tools</title>\r
	</head>\r
	<body>\r
		<!-- Google Tag Manager (noscript) -->\r
		<noscript\r
			><iframe\r
				src="https://www.googletagmanager.com/ns.html?id=GTM-NLCK842B"\r
				height="0"\r
				width="0"\r
				style="display: none; visibility: hidden"\r
			></iframe\r
		></noscript>\r
		<!-- End Google Tag Manager (noscript) -->\r
\r
		<header><h1>Tarenx Tools</h1></header>\r
		<main></main>\r
		<footer></footer>\r
		<script type="module" src="/src/main.ts"><\/script>\r
	</body>\r
</html>\r
`,"../../svgplayground/index.html":`<!doctype html>\r
<html lang="en">\r
	<head>\r
		<meta charset="UTF-8" />\r
\r
		<meta name="description" content="A beautiful and dynamic SVG playground." />\r
\r
		<link rel="canonical" href="https://tools.tarenx.com/svgplayground/" />\r
		<link rel="icon" type="image/svg+xml" href="shared/svgplayground/favicon.svg" />\r
\r
		<meta property="og:title" content="SVG Playground" />\r
		<meta property="og:description" content="A beautiful and dynamic SVG playground." />\r
		<meta property="og:image" content="shared/svgplayground/og.svg" />\r
\r
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />\r
		<title>SVG Playground</title>\r
	</head>\r
\r
	<body>\r
		<header>\r
			<div class="header-spacer"></div>\r
			<h1>SVG Playground</h1>\r
			<div class="header-actions">\r
				<button id="download-btn" class="primary-btn">\r
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\r
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>\r
						<polyline points="7 10 12 15 17 10"></polyline>\r
						<line x1="12" y1="15" x2="12" y2="3"></line>\r
					</svg>\r
					Download SVG\r
				</button>\r
			</div>\r
		</header>\r
		<main>\r
			<aside class="ad"></aside>\r
			<section>\r
				<div id="editor" class="panel"></div>\r
				<div id="canvas" class="panel"></div>\r
			</section>\r
			<aside class="ad"></aside>\r
		</main>\r
		<footer></footer>\r
		<script type="module" src="/src/main.ts"><\/script>\r
	</body>\r
</html>\r
`,"../../symbolpicker/index.html":`<!doctype html>\r
<html lang="en">\r
	<head>\r
		<meta charset="UTF-8" />\r
\r
		<meta name="description" content="Browse and copy Unicode symbols, arrows, math, emoji, and more. Click any symbol to copy it to your clipboard." />\r
\r
		<link rel="canonical" href="https://tools.tarenx.com/symbolpicker/" />\r
		<link rel="icon" type="image/svg+xml" href="shared/symbolpicker/favicon.svg" />\r
\r
		<meta property="og:title" content="Symbol Picker" />\r
  	<meta property="og:description" content="Browse and copy Unicode symbols, arrows, math, emoji, and more." />\r
		<meta property="og:image" content="shared/symbolpicker/og.svg" />\r
\r
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />\r
		<title>Symbol Picker</title>\r
	</head>\r
\r
	<body>\r
		<header>\r
			<h1>Symbol Picker</h1>\r
		</header>\r
		<main>\r
			<aside class="ad"></aside>\r
			<section>\r
				<nav id="nav-container"></nav>\r
				<div id="unicode-container"></div>\r
			</section>\r
			<aside class="ad"></aside>\r
		</main>\r
		<footer></footer>\r
		<script type="module" src="/src/main.ts"><\/script>\r
	</body>\r
</html>\r
`})).map(([e,t])=>{let n=e.split(`/`)[2],r=t.match(/<title>(.*?)<\/title>/);return{name:r?r[1]:n,icon:`shared/${n}/logo.svg`,href:`/${n}/`}}).filter(e=>{let t=e.href.replace(/\//g,``);return t!==`hub`&&t!==`shared`});function t(){let t=document.querySelector(`main`);t.innerHTML=e.map(e=>`
        <a href="${e.href}">
          <img src="${e.icon}" alt="${e.name}" />
          <span>${e.name}</span>
        </a>
      `).join(``)}document.addEventListener(`DOMContentLoaded`,t);