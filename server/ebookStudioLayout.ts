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

export const STUDIO_READER_MARKER = "codigo-lucrativo-tech-shell";

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

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function resolveModule(input: StudioLayoutInput) {
  const text = normalizeText(`${input.title} ${input.sourceFile} ${input.sourcePath}`);
  if (/(copy|anuncio|anuncios|headline|escrever|artigo|newsletter|email|pagina de captura|contactos)/.test(text)) {
    return {
      category: "Copywriting & Vendas",
      module: "COPYWRITING_E_VENDAS",
      subtitle: "Leitura operacional para criar mensagens, anúncios, ofertas e argumentos com mais clareza.",
      focus: "Transformar leitura em repertório prático de comunicação comercial.",
    };
  }
  if (/(venda|vendas|oferta|conversao|produto digital|marketing de rede|fechamento)/.test(text)) {
    return {
      category: "Vendas & Oferta",
      module: "VENDAS_E_OFERTA",
      subtitle: "Leitura operacional para estruturar oferta, valor percebido e sequência de conversão.",
      focus: "Extrair princípios acionáveis para vender com mais clareza e menos improviso.",
    };
  }
  return {
    category: "Biblioteca Digital",
    module: "BIBLIOTECA_DIGITAL",
    subtitle: "Material de estudo organizado no acervo do Código Lucrativo.",
    focus: "Converter conteúdo de estudo em execução prática dentro da operação.",
  };
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
  const module = resolveModule(input);
  const moduleCategory = escapeHtml(module.category);
  const moduleName = escapeHtml(module.module);
  const moduleSubtitle = escapeHtml(module.subtitle);
  const moduleFocus = escapeHtml(module.focus);

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
    --cl-line-strong: rgba(0, 240, 255, 0.42);
    --cl-neon: #00f0ff;
    --cl-green: #00ff9d;
    --cl-warn: #f59e0b;
    --cl-danger: #fb7185;
    --cl-text: #d1d5db;
    --cl-muted: #94a3b8;
    --cl-soft: #64748b;
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; background: var(--cl-bg); }

  body.${STUDIO_READER_MARKER} {
    margin: 0;
    min-height: 100vh;
    overflow-x: hidden;
    background:
      radial-gradient(circle at top left, rgba(0, 240, 255, 0.13), transparent 28rem),
      radial-gradient(circle at 88% 18%, rgba(0, 255, 157, 0.10), transparent 26rem),
      linear-gradient(180deg, #050811 0%, #070b16 100%);
    color: var(--cl-text);
    font-family: "Space Grotesk", "Inter", "Segoe UI", Arial, sans-serif;
    line-height: 1.6;
  }

  body.${STUDIO_READER_MARKER} a { color: var(--cl-neon); }
  body.${STUDIO_READER_MARKER} img { max-width: 100%; }

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
    font: 700 .68rem/1.2 "JetBrains Mono", "DM Mono", "SFMono-Regular", Consolas, monospace;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .cl-hud span:last-child { color: var(--cl-green); }
  .cl-wrap { width: min(100%, 1120px); margin: 0 auto; padding: 0 clamp(1rem, 3vw, 1.75rem); }

  .cl-cover {
    padding: clamp(3rem, 8vw, 7rem) 0 clamp(2.5rem, 6vw, 4.5rem);
    border-bottom: 1px solid var(--cl-line);
  }

  .cl-cover-card {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--cl-line-strong);
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
    mask-image: linear-gradient(180deg, rgba(0,0,0,.70), transparent 78%);
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
    margin-bottom: 1.35rem;
    color: var(--cl-green);
    font: 700 .78rem/1.2 "JetBrains Mono", "DM Mono", Consolas, monospace;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .cl-pulse {
    width: .55rem;
    height: .55rem;
    border-radius: 999px;
    background: var(--cl-green);
    box-shadow: 0 0 18px var(--cl-green);
    animation: cl-pulse 1.05s ease-in-out infinite alternate;
  }

  .cl-title {
    position: relative;
    z-index: 2;
    max-width: 13ch;
    margin: 0 0 1rem;
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
    font-family: "JetBrains Mono", "DM Mono", Consolas, monospace;
  }

  .cl-meta-card { padding: .95rem; background: rgba(8, 13, 26, .72); border: 1px solid rgba(30, 41, 59, .92); }
  .cl-meta-card small { display: block; color: var(--cl-soft); text-transform: uppercase; letter-spacing: .12em; margin-bottom: .3rem; }
  .cl-meta-card strong { display: block; color: #fff; overflow-wrap: anywhere; }
  .cl-meta-card em { color: var(--cl-green); font-style: normal; overflow-wrap: anywhere; }

  .cl-section { padding: clamp(2.5rem, 6vw, 5rem) 0; border-bottom: 1px solid var(--cl-line); }
  .cl-section-label { color: var(--cl-neon); font: 700 .76rem/1.2 "JetBrains Mono", "DM Mono", Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; margin-bottom: .85rem; }
  .cl-section-title { margin: 0 0 1.2rem; color: #fff; font-size: clamp(1.75rem, 5vw, 3rem); line-height: 1.08; letter-spacing: -.04em; }
  .cl-copy { max-width: 820px; color: var(--cl-muted); font-size: 1rem; line-height: 1.75; }

  .cl-quote {
    margin: 2rem 0;
    padding: clamp(1.25rem, 4vw, 2rem);
    border-left: 2px solid var(--cl-green);
    background: rgba(10, 16, 34, .86);
    font-family: "JetBrains Mono", "DM Mono", Consolas, monospace;
  }

  .cl-quote p { margin: 0 0 .8rem; color: var(--cl-green); font-size: clamp(1rem, 2.4vw, 1.35rem); line-height: 1.55; }
  .cl-quote span { display: block; color: var(--cl-soft); text-align: right; font-size: .74rem; }

  .cl-index-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .9rem; }
  .cl-index-card {
    padding: 1.25rem;
    background: var(--cl-card);
    border: 1px solid rgba(30, 41, 59, .96);
    color: var(--cl-muted);
    line-height: 1.55;
    transition: border-color .18s ease, background .18s ease;
  }
  .cl-index-card:hover { border-color: rgba(0, 240, 255, .62); background: #0c1427; }
  .cl-index-card b { display: block; color: var(--cl-neon); font-family: "JetBrains Mono", "DM Mono", Consolas, monospace; font-size: .72rem; letter-spacing: .1em; margin-bottom: .35rem; }
  .cl-index-card strong { display: block; margin-bottom: .2rem; color: #fff; font-size: 1.05rem; }

  .cl-chapter-head { margin-bottom: 2rem; padding-bottom: 1.4rem; border-bottom: 1px solid rgba(30, 41, 59, .95); }
  .cl-chapter-kicker { display: block; margin-bottom: .65rem; color: var(--cl-green); font: 700 .74rem/1.2 "JetBrains Mono", "DM Mono", Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; }
  .cl-chapter-head h2 { margin: 0 0 .75rem; color: #fff; font-size: clamp(2rem, 6vw, 4.3rem); line-height: 1; letter-spacing: -.055em; }
  .cl-chapter-head p { margin: 0; color: var(--cl-neon); font: 700 .8rem/1.5 "JetBrains Mono", "DM Mono", Consolas, monospace; }

  .cl-intro-box {
    margin: 0 0 2rem;
    padding: 1.25rem;
    border-left: 2px solid var(--cl-neon);
    background: var(--cl-card-2);
    color: #cbd5e1;
    font: 700 .78rem/1.7 "JetBrains Mono", "DM Mono", Consolas, monospace;
  }

  .cl-tech-list, .cl-checklist, .cl-table-wrap {
    margin: 2rem 0;
    padding: clamp(1rem, 3vw, 1.5rem);
    border: 1px solid rgba(30, 41, 59, .96);
    background: #080d1a;
  }

  .cl-box-title { margin: 0 0 1rem; color: var(--cl-neon); font: 700 .75rem/1.2 "JetBrains Mono", "DM Mono", Consolas, monospace; letter-spacing: .14em; text-transform: uppercase; }
  .cl-tech-list ul, .cl-checklist ul { display: grid; gap: .75rem; margin: 0; padding: 0; list-style: none; }
  .cl-tech-list li, .cl-checklist li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: .7rem; color: #cbd5e1; font: 700 .78rem/1.55 "JetBrains Mono", "DM Mono", Consolas, monospace; }
  .cl-tech-list span, .cl-checklist span { color: var(--cl-green); }

  .cl-card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; margin: 2rem 0; }
  .cl-info-card { padding: 1.2rem; border: 1px solid rgba(0,240,255,.38); background: var(--cl-card); }
  .cl-info-card.warn { border-color: rgba(245, 158, 11, .48); }
  .cl-info-card.danger { border-color: rgba(251, 113, 133, .48); }
  .cl-info-card.ok { border-color: rgba(0,255,157,.48); }
  .cl-info-card small { display: block; margin-bottom: .45rem; color: var(--cl-neon); font: 700 .62rem/1.2 "JetBrains Mono", "DM Mono", Consolas, monospace; letter-spacing: .12em; text-transform: uppercase; }
  .cl-info-card.warn small { color: var(--cl-warn); }
  .cl-info-card.danger small { color: var(--cl-danger); }
  .cl-info-card.ok small { color: var(--cl-green); }
  .cl-info-card h3 { margin: 0 0 .4rem; color: #fff; font-size: 1rem; line-height: 1.3; }
  .cl-info-card p { margin: 0; color: var(--cl-muted); font-size: .84rem; line-height: 1.6; }

  .cl-steps { display: grid; gap: .85rem; margin: 2rem 0; }
  .cl-step { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 1rem; padding: 1rem; border: 1px solid rgba(30, 41, 59, .96); background: var(--cl-card); }
  .cl-step b { align-self: start; padding: .38rem .55rem; border: 1px solid rgba(0,240,255,.35); color: var(--cl-neon); font: 800 .72rem/1 "JetBrains Mono", "DM Mono", Consolas, monospace; }
  .cl-step strong { display: block; margin-bottom: .25rem; color: #fff; }
  .cl-step p { margin: 0; color: var(--cl-muted); font-size: .84rem; line-height: 1.6; }

  .cl-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .9rem; margin: 2rem 0; }
  .cl-stat { padding: 1.25rem; border: 1px solid rgba(0,240,255,.30); background: var(--cl-card); text-align: center; font-family: "JetBrains Mono", "DM Mono", Consolas, monospace; }
  .cl-stat strong { display: block; margin-bottom: .3rem; color: var(--cl-green); font-size: clamp(2rem, 5vw, 3.1rem); line-height: 1; }
  .cl-stat span { display: block; margin-bottom: .35rem; color: #fff; font-size: .76rem; text-transform: uppercase; }
  .cl-stat small { color: var(--cl-soft); line-height: 1.5; }

  .cl-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .cl-table { width: 100%; min-width: 620px; border-collapse: collapse; text-align: left; font: 700 .76rem/1.45 "JetBrains Mono", "DM Mono", Consolas, monospace; }
  .cl-table th { padding: .8rem; border-bottom: 1px solid rgba(30, 41, 59, .95); background: var(--cl-card-2); color: var(--cl-neon); text-transform: uppercase; }
  .cl-table td { padding: .8rem; border-bottom: 1px solid rgba(30, 41, 59, .75); background: var(--cl-card); color: var(--cl-muted); }
  .cl-table td:first-child { color: #fff; }
  .cl-table td:nth-child(3) { color: var(--cl-green); }

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
    font-family: "JetBrains Mono", "DM Mono", Consolas, monospace;
    color: var(--cl-neon);
    font-size: .76rem;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .cl-original-viewport {
    position: relative;
    width: 100%;
    min-height: 360px;
    overflow: hidden;
    background: #111827;
    padding: clamp(.5rem, 2vw, 1rem);
  }

  .cl-original-content {
    width: max-content;
    min-width: min(100%, 892px);
    margin: 0 auto;
    color: #000;
    transform-origin: top left;
  }

  .cl-original-content > style:first-child + * { margin-top: 0; }
  .cl-original-content [id^="page"][id$="-div"], .cl-original-content .page {
    margin: 0 auto 1.25rem !important;
    box-shadow: 0 18px 40px rgba(0,0,0,.35);
  }

  .cl-signal-visual {
    position: relative;
    min-height: 280px;
    overflow: hidden;
    border: 1px solid rgba(0,240,255,.30);
    background:
      linear-gradient(90deg, rgba(0,240,255,.08) 1px, transparent 1px),
      linear-gradient(180deg, rgba(0,255,157,.07) 1px, transparent 1px),
      radial-gradient(circle at 70% 30%, rgba(0,240,255,.22), transparent 30%),
      #080d1a;
    background-size: 36px 36px, 36px 36px, auto, auto;
  }

  .cl-signal-visual::before {
    content: "SIGNAL_MAP // COPY_AND_SALES";
    position: absolute;
    left: 1rem;
    top: 1rem;
    color: var(--cl-neon);
    font: 800 .74rem/1.2 "JetBrains Mono", "DM Mono", Consolas, monospace;
    letter-spacing: .12em;
  }

  .cl-signal-line {
    position: absolute;
    left: 8%;
    right: 8%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--cl-neon), var(--cl-green), transparent);
    box-shadow: 0 0 20px rgba(0, 240, 255, .56);
  }
  .cl-signal-line:nth-child(1) { top: 34%; }
  .cl-signal-line:nth-child(2) { top: 52%; opacity: .66; }
  .cl-signal-line:nth-child(3) { top: 70%; opacity: .44; }

  .cl-summary {
    margin-top: 2rem;
    padding: 1.25rem;
    border-left: 2px solid var(--cl-green);
    background: var(--cl-card-2);
    font: 700 .78rem/1.7 "JetBrains Mono", "DM Mono", Consolas, monospace;
  }
  .cl-summary span { display: block; margin-bottom: .35rem; color: var(--cl-green); text-transform: uppercase; }

  .cl-final-card {
    padding: clamp(1.5rem, 5vw, 2.5rem);
    border: 1px solid rgba(0,240,255,.5);
    background: var(--cl-card);
    text-align: center;
    font-family: "JetBrains Mono", "DM Mono", Consolas, monospace;
  }

  .cl-final-card h2 { margin: 0 0 .8rem; color: #fff; font-size: clamp(1.8rem, 5vw, 3rem); line-height: 1.1; }
  .cl-final-card p { max-width: 680px; margin: 0 auto 1.4rem; color: var(--cl-neon); font-size: .9rem; line-height: 1.7; }
  .cl-final-button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: .9rem 1.4rem; background: var(--cl-neon); color: #000 !important; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; text-decoration: none; }
  .cl-final-note { display: block; margin-top: 1rem; color: var(--cl-soft); font-size: .76rem; }
  .cl-footer { padding: 2rem 0 3rem; color: var(--cl-soft); text-align: center; font: 700 .72rem/1.6 "JetBrains Mono", "DM Mono", Consolas, monospace; letter-spacing: .12em; text-transform: uppercase; }

  @keyframes cl-pulse { to { opacity: .42; transform: scale(.72); } }

  @media (max-width: 760px) {
    .cl-hud { align-items: flex-start; flex-direction: column; gap: .35rem; letter-spacing: .12em; }
    .cl-meta, .cl-index-grid, .cl-card-grid, .cl-stats { grid-template-columns: 1fr; }
    .cl-title { max-width: 100%; font-size: clamp(2rem, 12vw, 3.8rem); }
    .cl-reader-head { flex-direction: column; align-items: flex-start; }
    .cl-original-viewport { padding: .5rem; }
    .cl-step { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  }
</style>
${originalStyles}
</head>
<body class="${STUDIO_READER_MARKER}">
  <header class="cl-hud">
    <span>SYS.PROTOCOL // CÓDIGO LUCRATIVO</span>
    <span>RUNTIME: LEITURA IMERSIVA</span>
    <span>VER_2026.0</span>
  </header>

  <main>
    <section id="capa" class="cl-cover">
      <div class="cl-wrap">
        <div class="cl-cover-card">
          <span class="cl-corner tl"></span><span class="cl-corner tr"></span><span class="cl-corner bl"></span><span class="cl-corner br"></span>
          <div class="cl-module"><span class="cl-pulse"></span> MODULE::${moduleName}</div>
          <h1 class="cl-title">${title}</h1>
          <p class="cl-subtitle">${moduleSubtitle}</p>
          <div class="cl-meta">
            <div class="cl-meta-card"><small>AUTHORS_NODE</small><strong>Código Lucrativo</strong><em>Curadoria de Estudo</em></div>
            <div class="cl-meta-card"><small>CATEGORY</small><strong>${moduleCategory}</strong><em>Tech Futuristic</em></div>
            <div class="cl-meta-card"><small>HASH</small><strong>${sourceId}</strong><em>1ª edição digital</em></div>
          </div>
        </div>
      </div>
    </section>

    <section id="introducao" class="cl-section">
      <div class="cl-wrap">
        <div class="cl-section-label">// 00.INIT</div>
        <h2 class="cl-section-title">Introdução operacional</h2>
        <div class="cl-quote">
          <p>"Leia procurando princípios que possam virar execução, não apenas informação acumulada."</p>
          <span>— Código Lucrativo // Biblioteca Digital</span>
        </div>
        <div class="cl-copy">
          <p>Este e-book foi carregado no layout TECH FUTURISTIC integral para dar uma experiência de leitura mais premium, escaneável e útil dentro do painel de membros.</p>
          <p>O conteúdo original foi preservado. A camada visual adiciona capa, manifesto, blocos de aplicação, checklist, quadro comparativo, conclusão e chamada final para transformar estudo em ação.</p>
        </div>
      </div>
    </section>

    <section id="sumario" class="cl-section">
      <div class="cl-wrap">
        <div class="cl-section-label">// 01.INDEX</div>
        <h2 class="cl-section-title">INDEX_MANIFEST</h2>
        <div class="cl-index-grid">
          <a class="cl-index-card" href="#capa"><b>SEC_01</b><strong>Capa</strong>Identificação do módulo, categoria e material selecionado.</a>
          <a class="cl-index-card" href="#protocolo"><b>SEC_02</b><strong>Protocolo</strong>Como transformar a leitura em repertório aplicável.</a>
          <a class="cl-index-card" href="#leitura"><b>SEC_03</b><strong>Conteúdo</strong>Leitor principal com o material original responsivo.</a>
          <a class="cl-index-card" href="#execucao"><b>SEC_04</b><strong>Execução</strong>Fases, checklist e critérios práticos de uso.</a>
          <a class="cl-index-card" href="#conclusao"><b>SEC_05</b><strong>Conclusão</strong>Resumo operacional para fechar a leitura com direção.</a>
          <a class="cl-index-card" href="#cta-final"><b>SEC_06</b><strong>CTA Final</strong>Retorno rápido ao ponto principal de ação.</a>
        </div>
      </div>
    </section>

    <section id="protocolo" class="cl-section">
      <div class="cl-wrap">
        <div class="cl-chapter-head">
          <span class="cl-chapter-kicker">CHAPTER_01 // PART_I</span>
          <h2>Protocolo de leitura</h2>
          <p>${moduleFocus}</p>
        </div>
        <div class="cl-intro-box">Antes de consumir o conteúdo, defina uma pergunta de uso: qual ideia deste material pode melhorar seu texto, sua oferta, sua campanha ou sua rotina comercial ainda hoje?</div>
        <div class="cl-tech-list">
          <h3 class="cl-box-title">Os três sinais que merecem captura:</h3>
          <ul>
            <li><span>[01]</span><strong>Frases que explicam melhor uma dor, desejo ou objeção do público.</strong></li>
            <li><span>[02]</span><strong>Estruturas que podem virar headline, anúncio, página, abordagem ou roteiro.</strong></li>
            <li><span>[03]</span><strong>Critérios de decisão que ajudam a vender com mais clareza e menos improviso.</strong></li>
          </ul>
        </div>
        <div class="cl-card-grid">
          <article class="cl-info-card">
            <small>CONCEITO CENTRAL</small>
            <h3>Repertório aplicado</h3>
            <p>O valor está em transformar uma ideia boa em uso concreto: título, argumento, promessa, prova, objeção ou sequência.</p>
          </article>
          <article class="cl-info-card danger">
            <small>ALERTA</small>
            <h3>Leitura passiva</h3>
            <p>Ler sem anotar próximos passos reduz o material a inspiração solta. Capture decisões e pontos de teste.</p>
          </article>
          <article class="cl-info-card warn">
            <small>DICA EXECUTIVA</small>
            <h3>Extração por blocos</h3>
            <p>Ao terminar cada parte, escreva uma ação pequena: melhorar um anúncio, revisar uma oferta ou ajustar uma abordagem.</p>
          </article>
          <article class="cl-info-card ok">
            <small>EXEMPLO DE USO</small>
            <h3>De conceito para ativo</h3>
            <p>Uma explicação boa pode virar headline, legenda, script de WhatsApp, argumento de página ou resposta de objeção.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="leitura" class="cl-section">
      <div class="cl-wrap">
        <div class="cl-chapter-head">
          <span class="cl-chapter-kicker">CHAPTER_02 // PART_II</span>
          <h2>Leitura principal</h2>
          <p>ORIGINAL_CONTENT // ACTIVE</p>
        </div>
        <div class="cl-reader-panel">
          <div class="cl-reader-head">
            <span>STREAM_SOURCE // ${sourceFile}</span>
            <span>${source}</span>
          </div>
          <div class="cl-original-viewport">
            <div class="cl-original-content">
${originalBody}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="execucao" class="cl-section">
      <div class="cl-wrap">
        <div class="cl-chapter-head">
          <span class="cl-chapter-kicker">CHAPTER_03 // PART_III</span>
          <h2>Plano de execução</h2>
          <p>Converter estudo em ativo prático dentro da operação.</p>
        </div>
        <div class="cl-steps">
          <div class="cl-step"><b>PHASE_01</b><div><strong>Capturar ideias fortes</strong><p>Marque frases, exemplos, argumentos e estruturas que possam ser reutilizados em materiais comerciais.</p></div></div>
          <div class="cl-step"><b>PHASE_02</b><div><strong>Traduzir para o seu contexto</strong><p>Adapte o conceito para sua oferta, público, página, anúncio ou conversa de venda.</p></div></div>
          <div class="cl-step"><b>PHASE_03</b><div><strong>Aplicar em um ponto real</strong><p>Escolha um único ativo para melhorar primeiro: headline, promessa, CTA, FAQ, campanha ou abordagem.</p></div></div>
          <div class="cl-step"><b>PHASE_04</b><div><strong>Comparar antes e depois</strong><p>Observe se a mensagem ficou mais clara, específica, convincente e fácil de entender.</p></div></div>
        </div>
        <div class="cl-checklist">
          <h3 class="cl-box-title">Checklist de aproveitamento:</h3>
          <ul>
            <li><span>&gt;</span><strong>Extraí pelo menos uma ideia que melhora a clareza da oferta.</strong></li>
            <li><span>&gt;</span><strong>Separei frases úteis para anúncios, página ou abordagem direta.</strong></li>
            <li><span>&gt;</span><strong>Identifiquei objeções ou desejos que aparecem no material.</strong></li>
            <li><span>&gt;</span><strong>Transformei uma ideia em ação prática para testar.</strong></li>
          </ul>
        </div>
        <div class="cl-stats">
          <div class="cl-stat"><strong>01</strong><span>Ideia central</span><small>Uma leitura útil deve sair com uma prioridade clara.</small></div>
          <div class="cl-stat"><strong>04</strong><span>Fases</span><small>Capturar, traduzir, aplicar e comparar.</small></div>
          <div class="cl-stat"><strong>100%</strong><span>Conteúdo preservado</span><small>O material original continua íntegro no leitor.</small></div>
        </div>
        <div class="cl-table-wrap">
          <h3 class="cl-box-title">Comparativo de uso do material</h3>
          <div class="cl-table-scroll">
            <table class="cl-table">
              <thead><tr><th>Modo de leitura</th><th>Resultado comum</th><th>Aplicação</th><th>Maturidade</th></tr></thead>
              <tbody>
                <tr><td>Passiva</td><td>Inspiração rápida</td><td>Baixa</td><td>Inicial</td></tr>
                <tr><td>Anotada</td><td>Ideias reutilizáveis</td><td>Média</td><td>Boa</td></tr>
                <tr><td>Operacional</td><td>Ativos comerciais ajustados</td><td>Alta</td><td>Avançada</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <figure class="cl-signal-visual" aria-label="Mapa visual de sinais do material">
          <i class="cl-signal-line"></i><i class="cl-signal-line"></i><i class="cl-signal-line"></i>
        </figure>
        <div class="cl-summary">
          <span>// SUMMARY_LOG</span>
          Este material deve ser usado como fonte de repertório para melhorar comunicação, oferta, campanha e execução. O layout integral deixa a leitura mais clara sem substituir o conteúdo original.
        </div>
      </div>
    </section>

    <section id="conclusao" class="cl-section">
      <div class="cl-wrap">
        <div class="cl-section-label">// 04.CLOSE</div>
        <h2 class="cl-section-title">Conclusão operacional</h2>
        <div class="cl-copy">
          <p>O objetivo não é terminar o e-book com mais informação acumulada. O objetivo é sair com um ajuste prático que torne sua comunicação, venda ou operação mais clara.</p>
          <p>Volte ao conteúdo quando precisar buscar repertório específico de copy, vendas, oferta, argumentos ou execução.</p>
        </div>
        <div class="cl-tech-list">
          <h3 class="cl-box-title">Key takeaways:</h3>
          <ul>
            <li><span>&gt;&gt;</span><strong>Procure ideias que possam virar ativos reais.</strong></li>
            <li><span>&gt;&gt;</span><strong>Não aplique tudo ao mesmo tempo; escolha um ponto de melhoria.</strong></li>
            <li><span>&gt;&gt;</span><strong>Use o material como biblioteca de consulta, não como leitura única.</strong></li>
          </ul>
        </div>
      </div>
    </section>

    <section id="cta-final" class="cl-section">
      <div class="cl-wrap">
        <div class="cl-final-card">
          <h2>Próxima ação</h2>
          <p>Volte para a leitura principal, capture um insight e transforme em melhoria concreta dentro da sua operação.</p>
          <a class="cl-final-button" href="#leitura">REABRIR CONTENT_STREAM</a>
          <span class="cl-final-note">CÓDIGO LUCRATIVO // TECH FUTURISTIC // ${moduleCategory}</span>
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
