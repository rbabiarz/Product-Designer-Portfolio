#!/usr/bin/env python3
"""build-deep-dive.py — compiles every design/product document in this repo
(markdown docs, design-system references, token JSONs) into one self-contained
HTML deep dive: deep-dive.html.

Run from the repo root after editing any doc:  python3 build-deep-dive.py
No dependencies beyond the Python standard library. CLAUDE.local.md is
excluded on purpose — it is gitignored personal context.
"""
import html
import json
import os
import re

OUT = 'deep-dive.html'

# ── corpus: (group, [files]) — order is the reading order ──
GROUPS = [
    ('Overview', [
        'README.md', 'CLAUDE.md', 'DESIGN.md', 'PRODUCT.md',
    ]),
    ('Product docs', [
        'docs/brief.md', 'docs/product-requirements.md', 'docs/personas.md',
        'docs/information-architecture.md', 'docs/success-metrics.md',
        'docs/constraints.md', 'docs/design-decisions.md',
        'docs/open-questions.md', 'docs/changelog.md',
    ]),
    ('Features', [
        'docs/features/aegis-gims.md', 'docs/features/parlay-gaming.md',
        'docs/features/light-architect.md', 'docs/features/design-system.md',
    ]),
    ('Design system', [
        'design-system/foundations.md', 'design-system/components.md',
        'design-system/patterns.md', 'design-system/usage-guidelines.md',
    ]),
    ('Design tokens', [
        'design-tokens.json', 'tokens/primitives.json', 'tokens/semantic.json',
        'tokens/themes/dark.json', 'tokens/themes/light.json',
    ]),
    ('Rules & governance', [
        '.claude/rules/design-system.md', '.claude/rules/accessibility.md',
        '.claude/rules/code-style.md', '.claude/rules/content-voice.md',
    ]),
    ('Audits', [
        'WCAG-2.2-AODA-AUDIT.md', 'PERFORMANCE-AUDIT.md', 'SEO.md',
    ]),
    ('Reference & research', [
        'reference/brand/guidelines.md', 'reference/research/synthesis.md',
        'reference/flows/parlay-gaming/flow.md',
        'reference/flows/light-architect/flow.md',
    ]),
    ('Runtime components', [
        'src/components/README.md',
    ]),
    ('Tooling', [
        '.claude/agents/researcher.md', '.claude/agents/design-critic.md',
        '.claude/agents/implementer.md', '.claude/commands/new-case-study.md',
        '.claude/commands/audit-tokens.md',
    ]),
]

HEX_RE = re.compile(r'^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$')


# ── tiny markdown → html (headings, fences, tables, lists, inline marks) ──
def md_inline(t):
    t = re.sub(r'`([^`]+)`', lambda m: '<code>' + m.group(1) + '</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\w*])\*([^*\n]+)\*(?![\w*])', r'<em>\1</em>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', r'<a href="\2">\1</a>', t)
    return t


def md_to_html(src):
    lines = src.split('\n')
    out, i = [], 0
    in_code, in_ul, in_ol, in_bq, para = False, False, False, False, []

    def flush_para():
        if para:
            out.append('<p>' + md_inline(html.escape(' '.join(para)))
                       .replace('&lt;br&gt;', '<br>') + '</p>')
            para.clear()

    def close_lists():
        nonlocal in_ul, in_ol, in_bq
        if in_ul: out.append('</ul>'); in_ul = False
        if in_ol: out.append('</ol>'); in_ol = False
        if in_bq: out.append('</blockquote>'); in_bq = False

    while i < len(lines):
        ln = lines[i]
        if ln.strip().startswith('```'):
            flush_para(); close_lists()
            if not in_code:
                out.append('<pre><code>'); in_code = True
            else:
                out.append('</code></pre>'); in_code = False
            i += 1; continue
        if in_code:
            out.append(html.escape(ln)); i += 1; continue

        # table: header row + separator row
        if ln.strip().startswith('|') and i + 1 < len(lines) and re.match(r'^\s*\|[\s:|-]+\|\s*$', lines[i + 1]):
            flush_para(); close_lists()
            cells = [c.strip() for c in ln.strip().strip('|').split('|')]
            out.append('<div class="tbl"><table><thead><tr>' +
                       ''.join('<th>' + md_inline(html.escape(c)) + '</th>' for c in cells) +
                       '</tr></thead><tbody>')
            i += 2
            while i < len(lines) and lines[i].strip().startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                out.append('<tr>' + ''.join('<td>' + md_inline(html.escape(c)) + '</td>' for c in cells) + '</tr>')
                i += 1
            out.append('</tbody></table></div>')
            continue

        m = re.match(r'^(#{1,6})\s+(.*)$', ln)
        if m:
            flush_para(); close_lists()
            lvl = min(len(m.group(1)) + 1, 5)   # doc h1 -> page h2, etc.
            out.append('<h%d>%s</h%d>' % (lvl, md_inline(html.escape(m.group(2).strip())), lvl))
            i += 1; continue
        if re.match(r'^\s*(---+|\*\*\*+)\s*$', ln):
            flush_para(); close_lists(); out.append('<hr>'); i += 1; continue
        m = re.match(r'^\s*[-*+]\s+(.*)$', ln)
        if m:
            flush_para()
            if in_ol: out.append('</ol>'); in_ol = False
            if not in_ul: out.append('<ul>'); in_ul = True
            out.append('<li>' + md_inline(html.escape(m.group(1))) + '</li>')
            i += 1; continue
        m = re.match(r'^\s*\d+[.)]\s+(.*)$', ln)
        if m:
            flush_para()
            if in_ul: out.append('</ul>'); in_ul = False
            if not in_ol: out.append('<ol>'); in_ol = True
            out.append('<li>' + md_inline(html.escape(m.group(1))) + '</li>')
            i += 1; continue
        m = re.match(r'^\s*>\s?(.*)$', ln)
        if m:
            flush_para()
            if not in_bq: close_lists(); out.append('<blockquote>'); in_bq = True
            out.append('<p>' + md_inline(html.escape(m.group(1))) + '</p>')
            i += 1; continue
        if not ln.strip():
            flush_para(); close_lists(); i += 1; continue
        para.append(ln.strip()); i += 1

    flush_para(); close_lists()
    if in_code: out.append('</code></pre>')
    return '\n'.join(out)


# ── token JSON → swatch-aware definition tables ──
def token_rows(obj, path=''):
    rows = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.startswith('_'): continue
            rows += token_rows(v, path + ('.' if path else '') + str(k))
    elif isinstance(obj, list):
        for n, v in enumerate(obj):
            rows += token_rows(v, '%s[%d]' % (path, n))
    else:
        rows.append((path, str(obj)))
    return rows


def json_to_html(src):
    data = json.loads(src)
    note = ''
    if isinstance(data, dict) and '_comment' in data:
        note = '<p class="note">' + html.escape(str(data['_comment'])) + '</p>'
    rows = token_rows(data)
    body = []
    for path, val in rows:
        sw = ('<span class="sw" style="background:%s"></span>' % html.escape(val)) if HEX_RE.match(val.strip()) else ''
        body.append('<tr><td class="tk">%s</td><td>%s<code>%s</code></td></tr>'
                    % (html.escape(path), sw, html.escape(val)))
    return (note + '<div class="tbl"><table><thead><tr><th>Token</th><th>Value</th></tr></thead><tbody>'
            + '\n'.join(body) + '</tbody></table></div>')


def slug(p):
    return re.sub(r'[^a-z0-9]+', '-', p.lower()).strip('-')


# ── build ──
sections, toc = [], []
total_words = 0
for group, files in GROUPS:
    gid = slug(group)
    toc.append('<div class="toc-g">%s</div>' % html.escape(group))
    for f in files:
        if not os.path.exists(f):
            print('!! missing, skipped:', f)
            continue
        src = open(f, encoding='utf-8').read()
        words = len(src.split())
        total_words += words
        sid = slug(f)
        body = json_to_html(src) if f.endswith('.json') else md_to_html(src)
        title = os.path.basename(f)
        sections.append(
            '<section class="doc" id="%s" data-group="%s">'
            '<div class="doc-head"><h2>%s</h2>'
            '<span class="doc-meta">%s · %s words</span></div>%s</section>'
            % (sid, html.escape(group), html.escape(title), html.escape(f), format(words, ','), body))
        toc.append('<a href="#%s">%s</a>' % (sid, html.escape(title)))

doc_count = len(sections)

page = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Deep Dive — every design & product document · Robert Babiarz</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#070b12;--bg2:#0c121e;--bg3:#121a28;--fg:#e9eef7;--fg2:#8593a8;--line:rgba(255,255,255,0.08);--line2:rgba(255,255,255,0.15);--ac:#4ca88f;--ac2:#7dd3c0;}
.light{--bg:#fffcf5;--bg2:#f7f2e6;--bg3:#ebe6d6;--fg:#0a0a0a;--fg2:#595959;--line:rgba(0,0,0,0.09);--line2:rgba(0,0,0,0.16);--ac:#0d5350;--ac2:#4ca88f;}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{background:var(--bg);color:var(--fg);font-family:'Inter',sans-serif;font-size:15px;line-height:1.65;}
.mono{font-family:'JetBrains Mono',monospace;}
header.top{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:14px;padding:14px 22px;background:color-mix(in srgb,var(--bg) 94%,transparent);border-bottom:1px solid var(--line);flex-wrap:wrap;}
header.top h1{font-size:15px;font-weight:600;letter-spacing:-0.01em;}
header.top .k{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--ac2);}
#filter{margin-left:auto;background:var(--bg2);border:1px solid var(--line2);border-radius:999px;color:var(--fg);font:inherit;font-size:13px;padding:9px 16px;min-width:min(280px,50vw);}
#filter:focus-visible{outline:2px solid var(--ac2);outline-offset:2px;}
#theme{background:transparent;border:1px solid var(--line2);border-radius:999px;color:var(--fg2);font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:0.06em;padding:9px 14px;cursor:pointer;min-height:40px;}
#theme:hover{color:var(--fg);border-color:var(--ac2);}
.layout{display:flex;max-width:1400px;margin:0 auto;align-items:flex-start;}
nav.toc{position:sticky;top:64px;flex:0 0 280px;max-height:calc(100vh - 64px);overflow-y:auto;padding:22px 10px 60px 22px;scrollbar-width:thin;}
nav.toc .toc-g{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--ac);margin:18px 0 6px;}
nav.toc a{display:block;font-size:12.5px;color:var(--fg2);text-decoration:none;padding:4px 8px;border-radius:6px;border-left:2px solid transparent;}
nav.toc a:hover{color:var(--fg);background:var(--bg2);}
nav.toc a.on{color:var(--ac2);border-left-color:var(--ac2);}
main{flex:1;min-width:0;padding:26px 34px 120px;border-left:1px solid var(--line);}
section.doc{margin-bottom:34px;border:1px solid var(--line);border-radius:14px;background:var(--bg2);padding:26px 30px;scroll-margin-top:80px;}
.doc-head{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:16px;}
.doc-head h2{font-size:20px;font-weight:600;letter-spacing:-0.02em;}
.doc-meta{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.06em;color:var(--fg2);}
.doc h2,.doc h3,.doc h4,.doc h5{margin:20px 0 8px;line-height:1.25;letter-spacing:-0.015em;}
.doc h3{font-size:16.5px}.doc h4{font-size:14.5px}.doc h5{font-size:13px;color:var(--fg2)}
.doc p{margin:8px 0;color:var(--fg);max-width:76ch;}
.doc p .note{color:var(--fg2)}
.doc ul,.doc ol{margin:8px 0 8px 22px;max-width:74ch;}
.doc li{margin:4px 0;}
.doc code{font-family:'JetBrains Mono',monospace;font-size:0.85em;background:var(--bg3);border:1px solid var(--line);border-radius:5px;padding:1px 5px;}
.doc pre{background:var(--bg3);border:1px solid var(--line);border-radius:10px;padding:14px 16px;overflow-x:auto;margin:12px 0;}
.doc pre code{background:none;border:none;padding:0;font-size:12px;line-height:1.6;display:block;white-space:pre;}
.doc blockquote{border-left:3px solid var(--ac);padding:2px 0 2px 14px;margin:10px 0;color:var(--fg2);}
.doc hr{border:none;border-top:1px solid var(--line);margin:18px 0;}
.doc a{color:var(--ac2);text-underline-offset:3px;}
.tbl{overflow-x:auto;margin:12px 0;}
.doc table{border-collapse:collapse;font-size:13px;min-width:340px;}
.doc th,.doc td{border:1px solid var(--line);padding:7px 11px;text-align:left;vertical-align:top;}
.doc th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg2);background:var(--bg3);}
.doc td.tk{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--ac2);white-space:nowrap;}
.sw{display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid var(--line2);vertical-align:-2px;margin-right:8px;}
.note{color:var(--fg2);font-size:13px;font-style:italic;}
#none{display:none;padding:40px;text-align:center;color:var(--fg2);}
@media (max-width:900px){
  nav.toc{display:none;}
  main{border-left:none;padding:18px 16px 90px;}
  section.doc{padding:18px 16px;}
}
</style>
</head>
<body>
<header class="top">
  <span class="k">// Deep dive</span>
  <h1>Every design &amp; product document, one page</h1>
  <span class="doc-meta mono">__COUNT__ documents · __WORDS__ words · generated by build-deep-dive.py</span>
  <input id="filter" type="search" placeholder="Filter documents… (title, path, or content)" aria-label="Filter documents">
  <button id="theme" type="button" aria-pressed="false">LIGHT MODE</button>
</header>
<div class="layout">
  <nav class="toc" aria-label="Documents">__TOC__</nav>
  <main>
    <div id="none">No documents match that filter.</div>
    __SECTIONS__
  </main>
</div>
<script>
(function () {
  'use strict';
  /* theme (shared key with the rest of the site's standalone pages) */
  var btn = document.getElementById('theme');
  function setLight(on) {
    document.body.classList.toggle('light', on);
    btn.textContent = on ? 'DARK MODE' : 'LIGHT MODE';
    btn.setAttribute('aria-pressed', String(on));
    try { localStorage.setItem('rb-deepdive-light', on ? '1' : '0'); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('rb-deepdive-light'); } catch (e) {}
  setLight(saved === '1');
  btn.addEventListener('click', function () { setLight(!document.body.classList.contains('light')); });

  /* filter: matches title, path, group, or body text */
  var input = document.getElementById('filter');
  var docs = [].slice.call(document.querySelectorAll('section.doc'));
  var links = [].slice.call(document.querySelectorAll('nav.toc a'));
  var groups = [].slice.call(document.querySelectorAll('nav.toc .toc-g'));
  var none = document.getElementById('none');
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var any = false;
    docs.forEach(function (d, i) {
      var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1 || d.getAttribute('data-group').toLowerCase().indexOf(q) !== -1;
      d.style.display = hit ? '' : 'none';
      if (links[i]) links[i].style.display = hit ? '' : 'none';
      if (hit) any = true;
    });
    groups.forEach(function (g) {
      var el = g.nextElementSibling, vis = false;
      while (el && !el.classList.contains('toc-g')) { if (el.style.display !== 'none') vis = true; el = el.nextElementSibling; }
      g.style.display = vis ? '' : 'none';
    });
    none.style.display = any ? 'none' : 'block';
  });

  /* scroll spy */
  if ('IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var cur = null;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (cur) cur.classList.remove('on');
          cur = byId[e.target.id];
          if (cur) { cur.classList.add('on'); }
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    docs.forEach(function (d) { io.observe(d); });
  }
})();
</script>
<script src="colophon.js" defer></script>
</body>
</html>
'''

page = (page
        .replace('__COUNT__', str(doc_count))
        .replace('__WORDS__', format(total_words, ','))
        .replace('__TOC__', '\n'.join(toc))
        .replace('__SECTIONS__', '\n'.join(sections)))
open(OUT, 'w', encoding='utf-8').write(page)
print('wrote %s — %d documents, %s words, %dKB'
      % (OUT, doc_count, format(total_words, ','), len(page) // 1024))
