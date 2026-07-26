(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=Object.entries(Object.assign({"../../graphify/index.html":`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="description"
      content="Paste a spreadsheet or drop a CSV and turn it into a chart instantly."
    />

    <link rel="canonical" href="https://tools.tarenx.com/graphify/" />
    <link rel="icon" type="image/svg+xml" href="shared/graphify/favicon.svg" />

    <meta property="og:title" content="Graphify" />
    <meta
      property="og:description"
      content="Paste a spreadsheet or drop a CSV and turn it into a chart instantly."
    />
    <meta property="og:image" content="shared/graphify/og.svg" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Graphify</title>

    <!-- Apply saved dark theme before first paint to avoid a flash. Default: light. -->
    <script>
      if (localStorage.getItem("graphify-theme") === "dark")
        document.documentElement.classList.add("dark");
    <\/script>
  </head>

  <body>
    <div class="app-viewport">
      <header>
        <div class="header-brand">
          <img
            class="header-logo"
            src="shared/graphify/logo.svg"
            alt="Graphify Logo"
          />
          <span class="header-title">Graphify</span>
        </div>
        <div class="header-actions">
          <button id="open-btn" class="btn btn-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Open CSV
          </button>
          <div class="segmented" role="group" aria-label="Chart type">
            <button id="mode-time-btn" class="seg-btn" aria-pressed="true">
              Line · Time
            </button>
            <button id="mode-category-btn" class="seg-btn" aria-pressed="false">
              Bars · Category
            </button>
          </div>
          <button
            id="index-btn"
            class="btn btn-secondary"
            aria-pressed="false"
            title="Rebase every series so its first value = 100"
          >
            Base 100
          </button>
          <button
            id="export-btn"
            class="btn btn-secondary"
            title="Download chart as PNG"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            PNG
          </button>
          <button
            id="theme-toggle-btn"
            class="btn btn-secondary"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            <!-- Sun Icon (shown in dark mode) -->
            <svg
              class="sun-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.72" x2="5.64" y2="18.3"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <!-- Moon Icon (shown in light mode) -->
            <svg
              class="moon-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </header>

      <main>
        <section id="empty-state">
          <div id="dropzone" class="dropzone" role="button" tabindex="0">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3v18h18"></path>
              <path d="m7 15 4-5 3 3 5-7"></path>
            </svg>
            <h1>Drop a CSV file here</h1>
            <p>
              …or click to browse, or paste cells straight from Excel / Google
              Sheets (Ctrl+V).
            </p>
          </div>
        </section>

        <section id="workspace" class="hidden">
          <div class="panel data-panel">
            <div id="source-tabs" class="source-tabs"></div>
            <div id="report-bar" class="report-bar"></div>
            <div id="table-wrap" class="table-wrap"></div>
          </div>
          <div
            id="split-handle"
            class="split-handle"
            title="Drag to resize"
            aria-hidden="true"
          ></div>
          <div class="panel chart-panel">
            <div class="chart-toolbar">
              <input
                id="y-unit-input"
                type="text"
                placeholder="Value unit, e.g. 명 / %"
                title="Unit of the plotted values — shown as the Y-axis title"
              />
            </div>
            <div class="chart-area">
              <canvas id="chart"></canvas>
              <p id="chart-empty" class="chart-empty hidden">
                Select at least one series row to plot.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>

    <div id="drop-overlay" class="drop-overlay hidden">Drop to add file</div>
    <input
      id="file-input"
      type="file"
      accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
      multiple
      hidden
    />

    <article class="page-content">
      <section>
        <h2>About this tool</h2>
        <p>
          Graphify turns CSV or TSV data into an interactive chart in seconds.
          Paste data or drop a file, pick the rows you want to plot, and get a
          clean visualization you can read at a glance.
          <strong>Your data never leaves your browser</strong> — parsing and
          charting run entirely on your machine, so it's safe to plot sales
          numbers, analytics exports, and other private datasets.
        </p>
      </section>

      <section>
        <h2>How to use</h2>
        <ul>
          <li>
            Paste CSV/TSV text, or drop a <code>.csv</code> /
            <code>.tsv</code> file anywhere on the page.
          </li>
          <li>
            The parser detects the delimiter, header row, and date columns
            automatically.
          </li>
          <li>Select the series rows you want on the chart.</li>
          <li>Switch chart types to find the clearest view of your data.</li>
        </ul>
      </section>

      <section>
        <h2>FAQ</h2>
        <p>
          <strong>Is my data uploaded to a server?</strong> No. Files are read
          and charted locally in your browser; nothing is transmitted.
        </p>
        <p>
          <strong>What formats are supported?</strong> Comma-separated (CSV) and
          tab-separated (TSV) text, whether pasted directly or dropped as a
          file. Exports from Excel, Google Sheets, and most databases work out
          of the box.
        </p>
        <p>
          <strong>My spreadsheet is in Excel — how do I chart it?</strong>
          Either copy the cells and paste them here (spreadsheets copy as TSV),
          or save the sheet as CSV and drop the file onto the page.
        </p>
      </section>
    </article>

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is my data uploaded to a server?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Files are read and charted locally in your browser; nothing is transmitted."
            }
          },
          {
            "@type": "Question",
            "name": "What formats are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Comma-separated (CSV) and tab-separated (TSV) text, whether pasted directly or dropped as a file. Exports from Excel, Google Sheets, and most databases work out of the box."
            }
          },
          {
            "@type": "Question",
            "name": "My spreadsheet is in Excel - how do I chart it?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Either copy the cells and paste them here (spreadsheets copy as TSV), or save the sheet as CSV and drop the file onto the page."
            }
          }
        ]
      }
    <\/script>

    <footer></footer>
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`,"../index.html":`<!doctype html>
<html lang="en">
  <head>
    <!-- Google Tag Manager -->
    <script>
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "GTM-NLCK842B");
    <\/script>
    <!-- End Google Tag Manager -->

    <meta charset="UTF-8" />

    <meta
      name="description"
      content="A collection of handy web utilities. Copy Unicode symbols, and more."
    />

    <link rel="canonical" href="https://tools.tarenx.com/" />
    <link rel="icon" type="image/svg+xml" href="shared/hub/favicon.svg" />

    <meta property="og:title" content="Tarenx tools" />
    <meta
      property="og:description"
      content="A collection of handy web utilities."
    />
    <meta property="og:image" content="shared/hub/og.svg" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tarenx Tools</title>
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript
      ><iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-NLCK842B"
        height="0"
        width="0"
        style="display: none; visibility: hidden"
      ></iframe
    ></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <header><h1>Tarenx Tools</h1></header>
    <main></main>
    <footer></footer>
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`,"../../jsonformatter/index.html":`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="description"
      content="A beautiful and dynamic JSON formatter and converter."
    />

    <link rel="canonical" href="https://tools.tarenx.com/jsonformatter/" />
    <link
      rel="icon"
      type="image/svg+xml"
      href="shared/jsonformatter/favicon.svg"
    />

    <meta property="og:title" content="JSON Formatter" />
    <meta
      property="og:description"
      content="A beautiful and dynamic JSON formatter and converter."
    />
    <meta property="og:image" content="shared/jsonformatter/og.svg" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JSON Formatter</title>
  </head>

  <body>
    <div class="app-viewport">
      <header>
        <div class="header-brand">
          <img
            class="header-logo"
            src="shared/jsonformatter/logo.svg"
            alt="JSON Formatter Logo"
          />
          <span class="header-title">JSON Formatter</span>
        </div>
        <div class="header-actions">
          <button id="format-btn" class="btn btn-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
            Format
          </button>
          <button id="minify-btn" class="btn btn-secondary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="4 7 4 4 20 4 20 7"></polyline>
              <line x1="9" y1="20" x2="15" y2="20"></line>
              <line x1="12" y1="4" x2="12" y2="20"></line>
            </svg>
            Minify
          </button>
          <button id="yaml-btn" class="btn btn-secondary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              ></path>
            </svg>
            To YAML
          </button>
          <button id="validate-btn" class="btn btn-secondary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Validate
          </button>
          <button
            id="theme-toggle-btn"
            class="btn btn-secondary"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            <!-- Sun Icon (shown in dark mode) -->
            <svg
              class="sun-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.72" x2="5.64" y2="18.3"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <!-- Moon Icon (shown in light mode) -->
            <svg
              class="moon-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </header>
      <main>
        <aside class="ad"></aside>
        <section>
          <div class="panel main-panel">
            <div id="editor"></div>
            <div id="status-bar" class="status-bar hidden">
              <span id="status-message"></span>
            </div>
          </div>
        </section>
        <aside class="ad"></aside>
      </main>
    </div>

    <!-- YAML Output Modal -->
    <div id="yaml-modal" class="modal hidden">
      <div class="modal-content">
        <div class="modal-header">
          <h2>YAML Output</h2>
          <button id="close-modal-btn" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <pre id="yaml-output-text"></pre>
        </div>
        <div class="modal-footer">
          <button id="copy-yaml-btn" class="btn btn-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              ></path>
            </svg>
            Copy YAML
          </button>
        </div>
      </div>
    </div>

    <article class="page-content">
      <section>
        <h2>About this tool</h2>
        <p>
          This free online JSON formatter beautifies, validates, minifies, and
          converts JSON — all inside your browser.
          <strong
            >Your data is never uploaded: every operation runs locally on your
            machine</strong
          >, which makes it safe to paste API responses, config files, and other
          data you wouldn't want to send to a random server.
        </p>
      </section>

      <section>
        <h2>How to use</h2>
        <ul>
          <li>
            <strong>Format</strong> — paste JSON and get properly indented,
            readable output with syntax highlighting.
          </li>
          <li>
            <strong>Validate</strong> — check whether the input is valid JSON;
            errors are reported with the exact position so you can fix them
            fast.
          </li>
          <li>
            <strong>Minify</strong> — strip all whitespace to get the smallest
            possible payload for production or transport.
          </li>
          <li>
            <strong>To YAML</strong> — convert JSON to clean YAML, handy for
            Kubernetes manifests, CI configs, and OpenAPI specs.
          </li>
        </ul>
      </section>

      <section>
        <h2>Common reasons your JSON is invalid</h2>
        <ul>
          <li>
            <strong>Trailing commas</strong> — <code>{"a": 1,}</code> is legal
            in JavaScript but not in JSON.
          </li>
          <li>
            <strong>Single quotes</strong> — JSON requires double quotes around
            both keys and string values.
          </li>
          <li>
            <strong>Unquoted keys</strong> — <code>{a: 1}</code> must be written
            as <code>{"a": 1}</code>.
          </li>
          <li>
            <strong>Comments</strong> — standard JSON does not allow
            <code>//</code> or <code>/* */</code> comments.
          </li>
          <li>
            <strong>Special values</strong> — <code>NaN</code>,
            <code>Infinity</code>, and <code>undefined</code> are not valid
            JSON; use <code>null</code> or strings instead.
          </li>
        </ul>
      </section>

      <section>
        <h2>FAQ</h2>
        <p>
          <strong>Is my JSON uploaded to a server?</strong> No. Formatting,
          validation, minification, and YAML conversion all happen in your
          browser using JavaScript. Nothing leaves your machine.
        </p>
        <p>
          <strong>What's the difference between JSON and YAML?</strong> They
          represent the same data structures. JSON is stricter and ideal for
          machine-to-machine exchange; YAML is easier for humans to read and
          edit, which is why configuration files often use it.
        </p>
        <p>
          <strong>How large a file can I format?</strong> There is no fixed
          limit — it depends on your device's memory. Multi-megabyte documents
          format fine in modern browsers.
        </p>
      </section>
    </article>

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is my JSON uploaded to a server?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Formatting, validation, minification, and YAML conversion all happen in your browser using JavaScript. Nothing leaves your machine."
            }
          },
          {
            "@type": "Question",
            "name": "What is the difference between JSON and YAML?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "They represent the same data structures. JSON is stricter and ideal for machine-to-machine exchange; YAML is easier for humans to read and edit, which is why configuration files often use it."
            }
          },
          {
            "@type": "Question",
            "name": "How large a file can I format?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "There is no fixed limit — it depends on your device's memory. Multi-megabyte documents format fine in modern browsers."
            }
          }
        ]
      }
    <\/script>

    <footer></footer>
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`,"../../mdtopdf/index.html":`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="description"
      content="Write or drop Markdown and download it as a PDF — right in your browser, no upload."
    />

    <link rel="canonical" href="https://tools.tarenx.com/mdtopdf/" />
    <link rel="icon" type="image/svg+xml" href="shared/mdtopdf/favicon.svg" />

    <meta property="og:title" content="MD to PDF" />
    <meta
      property="og:description"
      content="Write or drop Markdown and download it as a PDF — right in your browser, no upload."
    />
    <meta property="og:image" content="shared/mdtopdf/og.svg" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MD to PDF</title>
  </head>

  <body>
    <div class="app-viewport">
      <header>
        <div class="header-brand">
          <img
            class="header-logo"
            src="shared/mdtopdf/logo.svg"
            alt="MD to PDF Logo"
          />
          <span class="header-title">MD to PDF</span>
        </div>
        <div class="header-actions">
          <button id="open-btn" class="btn btn-secondary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Open .md
          </button>
          <button id="download-btn" class="btn btn-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download PDF
          </button>
        </div>
      </header>

      <main>
        <div class="panel editor-panel">
          <div class="panel-label">Markdown</div>
          <textarea
            id="editor"
            spellcheck="false"
            placeholder="Type or paste Markdown here, or drop a .md file anywhere on the page…"
          ></textarea>
        </div>
        <div class="panel preview-panel">
          <div class="panel-label">Preview</div>
          <div class="preview-scroll">
            <div id="preview" class="markdown-body"></div>
          </div>
        </div>
      </main>
    </div>

    <div id="drop-overlay" class="drop-overlay hidden">
      Drop your Markdown file
    </div>
    <input
      id="file-input"
      type="file"
      accept=".md,.markdown,.txt,text/markdown,text/plain"
      hidden
    />

    <article class="page-content">
      <section>
        <h2>About this tool</h2>
        <p>
          MD to PDF converts Markdown into a downloadable PDF right in your
          browser. Type or paste Markdown on the left, watch the formatted
          preview update live on the right, and click
          <strong>Download PDF</strong> when it looks right.
          <strong>Your document is never uploaded</strong> — rendering and PDF
          generation both happen locally, so it's safe to convert private notes,
          contracts, and internal docs.
        </p>
      </section>

      <section>
        <h2>How to use</h2>
        <ul>
          <li>Type or paste Markdown into the editor panel.</li>
          <li>
            Or drop a <code>.md</code> file anywhere on the page — the content
            loads instantly.
          </li>
          <li>
            Check the live preview; it shows exactly what the PDF will contain.
          </li>
          <li>Click <strong>Download PDF</strong> to save the result.</li>
        </ul>
      </section>

      <section>
        <h2>Supported Markdown</h2>
        <p>
          Standard Markdown renders as you'd expect: headings, bold and italics,
          ordered and unordered lists, blockquotes, links, inline code and
          fenced code blocks, tables, and horizontal rules. Headings are kept
          together with the content that follows them when the PDF is paginated,
          so page breaks land in sensible places.
        </p>
      </section>

      <section>
        <h2>FAQ</h2>
        <p>
          <strong>Is my document uploaded to a server?</strong> No. The Markdown
          preview and the PDF file are generated entirely in your browser.
        </p>
        <p>
          <strong>Why convert Markdown to PDF?</strong> Markdown is great for
          writing, but PDF is the format people expect for sharing — it looks
          identical everywhere, prints cleanly, and doesn't require the reader
          to know what Markdown is.
        </p>
        <p>
          <strong>Can I control page breaks?</strong> The converter
          automatically avoids breaking right after a heading. For long
          documents, structuring content under clear headings produces the most
          natural pagination.
        </p>
      </section>
    </article>

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is my document uploaded to a server?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. The Markdown preview and the PDF file are generated entirely in your browser."
            }
          },
          {
            "@type": "Question",
            "name": "Why convert Markdown to PDF?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Markdown is great for writing, but PDF is the format people expect for sharing — it looks identical everywhere, prints cleanly, and doesn't require the reader to know what Markdown is."
            }
          },
          {
            "@type": "Question",
            "name": "Can I control page breaks?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The converter automatically avoids breaking right after a heading. For long documents, structuring content under clear headings produces the most natural pagination."
            }
          }
        ]
      }
    <\/script>

    <footer></footer>
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`,"../../svgplayground/index.html":`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="description"
      content="A beautiful and dynamic SVG playground."
    />

    <link rel="canonical" href="https://tools.tarenx.com/svgplayground/" />
    <link
      rel="icon"
      type="image/svg+xml"
      href="shared/svgplayground/favicon.svg"
    />

    <meta property="og:title" content="SVG Playground" />
    <meta
      property="og:description"
      content="A beautiful and dynamic SVG playground."
    />
    <meta property="og:image" content="shared/svgplayground/og.svg" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SVG Playground</title>
  </head>

  <body>
    <div class="app-viewport">
      <header>
        <div class="header-spacer"></div>
        <h1>SVG Playground</h1>
        <div class="header-actions">
          <button id="download-btn" class="primary-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download SVG
          </button>
        </div>
      </header>
      <main>
        <aside class="ad"></aside>
        <section>
          <div id="editor" class="panel"></div>
          <div id="canvas" class="panel"></div>
        </section>
        <aside class="ad"></aside>
      </main>
    </div>

    <article class="page-content">
      <section>
        <h2>About this tool</h2>
        <p>
          SVG Playground is a free online SVG editor with a live preview. Type
          or paste SVG markup on the left and see it rendered instantly on the
          right — then download the result as a clean <code>.svg</code> file.
          Everything runs in your browser, so your artwork never leaves your
          machine.
        </p>
      </section>

      <section>
        <h2>How to use</h2>
        <ul>
          <li>Write or paste SVG markup into the editor panel.</li>
          <li>The canvas re-renders on every keystroke — no refresh needed.</li>
          <li>
            Click <strong>Download SVG</strong> to save the current markup as a
            file you can drop into any project.
          </li>
        </ul>
      </section>

      <section>
        <h2>What is SVG?</h2>
        <p>
          SVG (Scalable Vector Graphics) is an XML-based image format that
          describes shapes with code instead of pixels. Because it's vector
          based, an SVG stays perfectly sharp at any size — the same file works
          as a 16px favicon and a billboard. It's the standard format for icons,
          logos, charts, and illustrations on the web, and since it's plain text
          it compresses extremely well and can be styled or animated with CSS.
        </p>
      </section>

      <section>
        <h2>FAQ</h2>
        <p>
          <strong>SVG vs PNG — when should I use which?</strong> Use SVG for
          anything drawn with shapes: icons, logos, diagrams, UI illustrations.
          Use PNG (or WebP/AVIF) for photographs and complex raster imagery. SVG
          scales losslessly and is usually far smaller for simple graphics.
        </p>
        <p>
          <strong>Is my SVG uploaded anywhere?</strong> No. The editor and
          preview run entirely in your browser. The downloaded file is generated
          locally from your markup.
        </p>
        <p>
          <strong>Why doesn't my SVG render?</strong> The most common causes are
          a missing <code>xmlns="http://www.w3.org/2000/svg"</code>
          attribute on the root element, an unclosed tag, or a missing
          <code>viewBox</code> that leaves the drawing outside the visible area.
        </p>
      </section>
    </article>

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "SVG vs PNG - when should I use which?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Use SVG for anything drawn with shapes: icons, logos, diagrams, UI illustrations. Use PNG for photographs and complex raster imagery. SVG scales losslessly and is usually far smaller for simple graphics."
            }
          },
          {
            "@type": "Question",
            "name": "Is my SVG uploaded anywhere?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. The editor and preview run entirely in your browser. The downloaded file is generated locally from your markup."
            }
          },
          {
            "@type": "Question",
            "name": "Why doesn't my SVG render?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The most common causes are a missing xmlns attribute on the root element, an unclosed tag, or a missing viewBox that leaves the drawing outside the visible area."
            }
          }
        ]
      }
    <\/script>

    <footer></footer>
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`,"../../symbolpicker/index.html":`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="description"
      content="Browse and copy Unicode symbols, arrows, math, emoji, and more. Click any symbol to copy it to your clipboard."
    />

    <link rel="canonical" href="https://tools.tarenx.com/symbolpicker/" />
    <link
      rel="icon"
      type="image/svg+xml"
      href="shared/symbolpicker/favicon.svg"
    />

    <meta property="og:title" content="Symbol Picker" />
    <meta
      property="og:description"
      content="Browse and copy Unicode symbols, arrows, math, emoji, and more."
    />
    <meta property="og:image" content="shared/symbolpicker/og.svg" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Symbol Picker</title>
  </head>

  <body>
    <header>
      <h1>Symbol Picker</h1>
    </header>
    <main>
      <aside class="ad"></aside>
      <section>
        <nav id="nav-container"></nav>
        <div id="unicode-container"></div>
      </section>
      <aside class="ad"></aside>
    </main>

    <article class="page-content">
      <section>
        <h2>About this tool</h2>
        <p>
          Symbol Picker is a free library of Unicode symbols and special
          characters you can copy with a single click — arrows, math signs,
          stars, check marks, currency signs, Greek letters, box-drawing
          characters, and many more. No keyboard shortcuts to memorize, no
          character map to dig through.
        </p>
      </section>

      <section>
        <h2>How to use</h2>
        <ul>
          <li>Browse the categories in the sidebar or scroll the grid.</li>
          <li>Click any symbol to copy it to your clipboard instantly.</li>
          <li>
            Paste it anywhere — documents, chats, social media, code comments,
            spreadsheets, or design tools.
          </li>
        </ul>
      </section>

      <section>
        <h2>Popular symbol categories</h2>
        <ul>
          <li>
            <strong>Arrows</strong> — → ← ↑ ↓ ⇒ ⇄ ↻ for navigation hints,
            diagrams, and shortcuts
          </li>
          <li>
            <strong>Check marks &amp; crosses</strong> — ✓ ✔ ✗ ✘ for task lists
            and comparison tables
          </li>
          <li><strong>Stars</strong> — ★ ☆ ✦ ✨ for ratings and decoration</li>
          <li>
            <strong>Math</strong> — ± × ÷ ≈ ≠ ≤ ∞ ∑ √ for equations and
            technical writing
          </li>
          <li>
            <strong>Currency</strong> — € £ ¥ ₩ ₹ ¢ for prices in any locale
          </li>
          <li>
            <strong>Punctuation &amp; typography</strong> — — – … « » ‹ › for
            clean, professional text
          </li>
        </ul>
      </section>

      <section>
        <h2>FAQ</h2>
        <p>
          <strong>Why do some symbols show as an empty box (□)?</strong> The
          symbol is valid Unicode, but the font on your device doesn't include a
          glyph for it. The person you send it to may still see it correctly if
          their device has better font coverage.
        </p>
        <p>
          <strong>Will a copied symbol work everywhere?</strong> Yes — these are
          standard Unicode characters, not images. Any app that handles text
          (email, chat, documents, code) can display them, subject to font
          support.
        </p>
        <p>
          <strong>What's the difference between a symbol and an emoji?</strong>
          Both are Unicode characters. Emoji are typically rendered as colorful
          pictures by the operating system, while symbols render as regular text
          glyphs that inherit your font size and color.
        </p>
      </section>
    </article>

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Why do some symbols show as an empty box?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The symbol is valid Unicode, but the font on your device doesn't include a glyph for it. The person you send it to may still see it correctly if their device has better font coverage."
            }
          },
          {
            "@type": "Question",
            "name": "Will a copied symbol work everywhere?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes — these are standard Unicode characters, not images. Any app that handles text can display them, subject to font support."
            }
          },
          {
            "@type": "Question",
            "name": "What is the difference between a symbol and an emoji?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Both are Unicode characters. Emoji are typically rendered as colorful pictures by the operating system, while symbols render as regular text glyphs that inherit your font size and color."
            }
          }
        ]
      }
    <\/script>

    <footer></footer>
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`})).map(([e,t])=>{let n=e.split(`/`),r=n[n.length-2],i=r===`..`?`hub`:r,a=t.match(/<title>(.*?)<\/title>/);return{name:a?a[1]:i,icon:`shared/${i}/logo.svg`,href:`/${i}/`}}).filter(e=>{let t=e.href.replace(/\//g,``);return t!==`hub`&&t!==`shared`});function t(){let t=document.querySelector(`main`);t.innerHTML=e.map(e=>`
        <a href="${e.href}">
          <img src="${e.icon}" alt="${e.name}" />
          <span>${e.name}</span>
        </a>
      `).join(``)}document.addEventListener(`DOMContentLoaded`,t);