type StudioLayoutInput = {
  sourceId: string;
  sourceFile: string;
  sourcePath: string;
  title: string;
  htmlContent: string;
};

export const GOOD_STUDIO_EBOOK_SOURCE_IDS = new Set([
  "dcd29a74b61b3dd4",
  "1d8e16d1223794d3",
  "15ce857bf4281ac6",
  "0c3d80f743f7d741",
  "15183ec814fc1c5d",
  "59bd2bc9ce090c66",
  "338c98f40987765d",
  "df81605e3e33bd06",
  "f79d6b99393dd257",
  "ca8f8fffe31879b0",
  "d1d5a93bdc43efa5",
  "f067cf4e35bef1fb",
  "dcf2c294d0106c58",
  "9feb86683db10d30",
  "a0776006258f02e6",
  "c301bd528371cde1",
  "24a8db479323bec9",
  "b5c67c69d55242b2",
  "00b17def0c107cda",
  "7f13fb78bd6a19a8",
  "2b2c4e19cecfa415",
  "e160e8fab8fc682e",
  "f789737a6772817a",
  "f47950b8ee163dc5",
  "129bf9d7343a1382",
  "0dbe0f033a14b0e8",
  "3cdf2d469e99b81e",
  "eadf8b9f21a06345",
  "5d5373a602833e83",
  "4e7d9cf6c3b2c27a",
  "756578b46086235d",
  "ec5d0d54c698e4d9",
  "8c92c6f20ceb06a4",
  "d89f64de22eed9aa",
  "73b27e9348b1c6d9",
  "2a3da4b8df2faaa4",
]);

const STUDIO_TITLE_FIXES: Record<string, string> = {
  dcd29a74b61b3dd4: "10 Maneiras De Escrever Anúncios Mais Eficientes",
  "1d8e16d1223794d3": "30 Truques Para Maximizar As Taxas De Conversão",
  "59bd2bc9ce090c66": "Despeça O Seu Chefe",
  ca8f8fffe31879b0: "7 Passos Para Ter Seu Próprio Produto Digital",
  f067cf4e35bef1fb: "A Sobrevivência No Marketing De Rede",
  a0776006258f02e6: "Os Segredos Da Criação De Vídeos",
  "24a8db479323bec9": "Estratégias De Vendas Intemporais",
  e160e8fab8fc682e: "Marketing Com Newsletters De A a Z",
  "3cdf2d469e99b81e": "Upline Imparável",
  eadf8b9f21a06345: "O Guia De Geração De Contactos Ilimitados",
  "4e7d9cf6c3b2c27a": "Marketing Por Email de A a Z",
  "8c92c6f20ceb06a4": "Noções Básicas De SEO",
  "73b27e9348b1c6d9": "eBooks Grátis Expostos",
  "2a3da4b8df2faaa4": "Trabalhe Em Rede Com Eficiência Em Qualquer Indústria",
};

export function getStudioEbookTitle(sourceId: string, fallbackTitle: string) {
  return STUDIO_TITLE_FIXES[sourceId] ?? fallbackTitle;
}

export function isGoodStudioEbook(sourceId: string) {
  return GOOD_STUDIO_EBOOK_SOURCE_IDS.has(sourceId);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripScripts(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function extractBody(html: string) {
  const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return match?.[1] ?? html;
}

function extractStyleTags(html: string) {
  return Array.from(html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi))
    .map(match => match[0])
    .join("\n");
}

function sourceLabel(input: StudioLayoutInput) {
  if (input.sourcePath && input.sourcePath !== "source.pdf") return input.sourcePath;
  return input.sourceFile;
}

export function rewriteEbookInStudioLayout(input: StudioLayoutInput) {
  if (!isGoodStudioEbook(input.sourceId)) return input.htmlContent;

  const cleanOriginalHtml = stripScripts(input.htmlContent);
  const originalStyles = extractStyleTags(cleanOriginalHtml);
  const originalBody = extractBody(cleanOriginalHtml);
  const title = escapeHtml(input.title);
  const source = escapeHtml(sourceLabel(input));
  const sourceFile = escapeHtml(input.sourceFile);
  const sourceId = escapeHtml(input.sourceId);

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<style>
  :root {
    color-scheme: dark;
    --cl-bg: #050811;
    --cl-panel: #080d1a;
    --cl-card: #090e1d;
    --cl-card-2: #0c1427;
    --cl-line: rgba(0, 240, 255, 0.24);
    --cl-neon: #00f0ff;
    --cl-green: #00ff9d;
    --cl-text: #d1d5db;
    --cl-muted: #94a3b8;
    --cl-soft: #64748b;
  }

  * { box-sizing: border-box; }

  html { scroll-behavior: smooth; background: var(--cl-bg); }

  body.codigo-lucrativo-tech-shell {
    margin: 0;
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(0, 240, 255, 0.12), transparent 28rem),
      radial-gradient(circle at bottom right, rgba(0, 255, 157, 0.10), transparent 24rem),
      linear-gradient(180deg, #050811 0%, #070b16 100%);
    color: var(--cl-text);
    font-family: "Space Grotesk", "Inter", "Segoe UI", Arial, sans-serif;
  }

  a { color: var(--cl-neon); }

  .cl-hud {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: .85rem clamp(1rem, 3vw, 2rem);
    border-bottom: 1px solid var(--cl-line);
    background: rgba(8, 13, 26, .94);
    backdrop-filter: blur(14px);
    color: var(--cl-neon);
    font: 700 .68rem/1.2 "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .cl-hud span:last-child { color: var(--cl-green); }

  .cl-wrap { width: min(100%, 1120px); margin: 0 auto; padding: 0 clamp(1rem, 3vw, 1.75rem); }

  .cl-cover { padding: clamp(3rem, 8vw, 7rem) 0 clamp(2rem, 6vw, 4rem); border-bottom: 1px solid var(--cl-line); }

  .cl-cover-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(0, 240, 255, .42);
    background: linear-gradient(145deg, rgba(9, 14, 29, .96), rgba(5, 8, 17, .98));
    padding: clamp(1.5rem, 6vw, 4rem);
    box-shadow: 0 24px 80px rgba(0, 0, 0, .42), inset 0 0 0 1px rgba(255,255,255,.03);
  }

  .cl-cover-card::before, .cl-cover-card::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(90deg, rgba(0,240,255,.06) 1px, transparent 1px),
      linear-gradient(180deg, rgba(0,240,255,.05) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: linear-gradient(180deg, rgba(0,0,0,.65), transparent 75%);
  }

  .cl-corner { position: absolute; width: 1.1rem; height: 1.1rem; border-color: var(--cl-neon); z-index: 1; }
  .cl-corner.tl { top: 0; left: 0; border-top: 2px solid; border-left: 2px solid; }
  .cl-corner.tr { top: 0; right: 0; border-top: 2px solid; border-right: 2px solid; }
  .cl-corner.bl { bottom: 0; left: 0; border-bottom: 2px solid; border-left: 2px solid; }
  .cl-corner.br { bottom: 0; right: 0; border-bottom: 2px solid; border-right: 2px solid; }

  .cl-module {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    color: var(--cl-green);
    font: 700 .78rem/1.2 "JetBrains Mono", Consolas, monospace;
    letter-spacing: .12em;
    text-transform: uppercase;
    margin-bottom: 1.35rem;
  }

  .cl-pulse { width: .55rem; height: .55rem; border-radius: 999px; background: var(--cl-green); box-shadow: 0 0 18px var(--cl-green); }

  .cl-title {
    position: relative;
    z-index: 2;
    margin: 0 0 1rem;
    max-width: 13ch;
    color: #fff;
    font-size: clamp(2.4rem, 8vw, 5.7rem);
    line-height: .98;
    letter-spacing: -.055em;
    text-wrap: balance;
  }

  .cl-subtitle {
    position: relative;
    z-index: 2;
    max-width: 780px;
    margin: 0 0 2rem;
    padding-left: 1rem;
    border-left: 2px solid var(--cl-neon);
    color: var(--cl-muted);
    font-size: clamp(1rem, 2.4vw, 1.3rem);
    line-height: 1.7;
  }

  .cl-meta {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: .85rem;
    padding-top: 1.2rem;
    border-top: 1px solid rgba(148, 163, 184, .18);
    font-family: "JetBrains Mono", Consolas, monospace;
  }

  .cl-meta-card { padding: .95rem; background: rgba(8, 13, 26, .72); border: 1px solid rgba(30, 41, 59, .92); }
  .cl-meta-card small { display: block; color: var(--cl-soft); text-transform: uppercase; letter-spacing: .12em; margin-bottom: .3rem; }
  .cl-meta-card strong { display: block; color: #fff; overflow-wrap: anywhere; }
  .cl-meta-card em { color: var(--cl-green); font-style: normal; overflow-wrap: anywhere; }

  .cl-index, .cl-reader { padding: clamp(2rem, 6vw, 4rem) 0; border-bottom: 1px solid var(--cl-line); }
  .cl-section-label { color: var(--cl-neon); font: 700 .76rem/1.2 "JetBrains Mono", Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; margin-bottom: .85rem; }
  .cl-section-title { margin: 0 0 1.2rem; color: #fff; font-size: clamp(1.75rem, 5vw, 3rem); line-height: 1.08; }

  .cl-index-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .9rem; }
  .cl-index-card { padding: 1.1rem; background: var(--cl-card); border: 1px solid rgba(30, 41, 59, .96); color: var(--cl-muted); line-height: 1.55; }
  .cl-index-card b { color: var(--cl-green); font-family: "JetBrains Mono", Consolas, monospace; font-size: .72rem; letter-spacing: .1em; }

  .cl-reader-panel {
    overflow: hidden;
    border: 1px solid rgba(0, 240, 255, .28);
    background: rgba(9, 14, 29, .82);
    box-shadow: 0 18px 70px rgba(0,0,0,.38);
  }

  .cl-reader-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 1rem clamp(1rem, 3vw, 1.5rem);
    border-bottom: 1px solid rgba(0, 240, 255, .2);
    background: rgba(8, 13, 26, .92);
    font-family: "JetBrains Mono", Consolas, monospace;
    color: var(--cl-neon);
    font-size: .76rem;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .cl-original-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    background: #111827;
    padding: clamp(.75rem, 3vw, 1.25rem);
  }

  .cl-original-content {
    width: max-content;
    min-width: min(100%, 892px);
    margin: 0 auto;
    background: #a0a0a0;
    color: #000;
  }

  .cl-original-content > style:first-child + * { margin-top: 0; }
  .cl-original-content [id^="page"][id$="-div"] { margin: 0 auto 1.25rem; box-shadow: 0 18px 40px rgba(0,0,0,.35); }

  .cl-footer { padding: 2rem 0 3rem; color: var(--cl-soft); text-align: center; font: 700 .72rem/1.6 "JetBrains Mono", Consolas, monospace; letter-spacing: .12em; text-transform: uppercase; }

  @media (max-width: 720px) {
    .cl-hud { align-items: flex-start; flex-direction: column; gap: .35rem; letter-spacing: .12em; }
    .cl-meta, .cl-index-grid { grid-template-columns: 1fr; }
    .cl-title { max-width: 100%; font-size: clamp(2rem, 12vw, 3.8rem); }
    .cl-reader-head { flex-direction: column; align-items: flex-start; }
    .cl-original-scroll { padding: .5rem; }
  }
</style>
${originalStyles}
</head>
<body class="codigo-lucrativo-tech-shell">
  <header class="cl-hud">
    <span>SYS.PROTOCOL // CÓDIGO LUCRATIVO</span>
    <span>TECH FUTURISTIC // MEMBER READER</span>
  </header>

  <main>
    <section id="capa" class="cl-cover">
      <div class="cl-wrap">
        <div class="cl-cover-card">
          <span class="cl-corner tl"></span><span class="cl-corner tr"></span><span class="cl-corner bl"></span><span class="cl-corner br"></span>
          <div class="cl-module"><span class="cl-pulse"></span> MODULE::BIBLIOTECA_DIGITAL</div>
          <h1 class="cl-title">${title}</h1>
          <p class="cl-subtitle">Material reformatado no layout Tech Futuristic para leitura no painel de membros. O conteúdo original foi preservado e recebeu uma camada visual premium, escura e responsiva.</p>
          <div class="cl-meta">
            <div class="cl-meta-card"><small>AUTHORS_NODE</small><strong>Código Lucrativo</strong><em>Curadoria de Estudo</em></div>
            <div class="cl-meta-card"><small>SOURCE_FILE</small><strong>${sourceFile}</strong></div>
            <div class="cl-meta-card"><small>HASH</small><strong>${sourceId}</strong></div>
          </div>
        </div>
      </div>
    </section>

    <section id="sumario" class="cl-index">
      <div class="cl-wrap">
        <div class="cl-section-label">// 00.INIT</div>
        <h2 class="cl-section-title">INDEX_MANIFEST</h2>
        <div class="cl-index-grid">
          <div class="cl-index-card"><b>SEC_01</b><br>Capa reescrita no padrão visual futurista.</div>
          <div class="cl-index-card"><b>SEC_02</b><br>Conteúdo original mantido dentro do leitor integrado.</div>
          <div class="cl-index-card"><b>SEC_03</b><br>Compatível com leitura mobile, tablet e fullscreen.</div>
        </div>
      </div>
    </section>

    <section id="leitura" class="cl-reader">
      <div class="cl-wrap">
        <div class="cl-section-label">// 01.CONTENT_STREAM</div>
        <h2 class="cl-section-title">Leitura Principal</h2>
        <div class="cl-reader-panel">
          <div class="cl-reader-head">
            <span>ORIGINAL_CONTENT // ACTIVE</span>
            <span>${source}</span>
          </div>
          <div class="cl-original-scroll">
            <div class="cl-original-content">
${originalBody}
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="cl-footer">
    CÓDIGO LUCRATIVO // BIBLIOTECA DIGITAL // TECH FUTURISTIC
  </footer>
</body>
</html>`;
}
