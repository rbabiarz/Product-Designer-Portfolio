/* concierge.js — the Portfolio Concierge (PRD: "Agentic AI Portfolio Concierge").

   A floating assistant button (bottom-right) that opens a chat which routes
   hiring managers to the most relevant work: intent matching over a hand-built
   index of every real page on this site, deep-link cards with thumbnails and
   reading times, context-aware suggestion pills, guided tours, and the PRD's
   analytics events.

   HONESTY CONSTRAINT (see .claude/rules/content-voice.md): this build has no
   backend, so there is no LLM behind it — it is deterministic retrieval over
   an authored index, and its copy never claims otherwise. The chat surface,
   index shape, and response pipeline are deliberately LLM-ready: swap
   `respond()` for an API call and the rest stands.

   Self-contained by design (like cookie-banner.js / boot-loader.js): it must
   work on every page with no build step, so colors are bootstrap literals
   themed per page variant. Conversation persists across page navigations via
   sessionStorage, so a tour survives clicking through case studies. */
(function () {
  'use strict';
  if (window.__rbConcierge) return; window.__rbConcierge = 1;
  if (window.parent !== window) return; // not inside embeds/iframes

  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var store = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
                del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} } };
  var seenBefore = false;
  try { seenBefore = localStorage.getItem('rb-ai-seen') === '1'; } catch (e) {}

  function track(name, params) {
    try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {}
  }

  /* ================= THEME ================= */
  function themeOf() {
    if (document.querySelector('.dsr')) return 'dossier';
    var bg = '';
    try { bg = getComputedStyle(document.body).backgroundColor; } catch (e) {}
    if (bg === 'rgb(4, 8, 6)' || bg === 'rgb(4, 18, 10)') return 'retro';
    return 'default';
  }
  var THEMES = {
    'default': {
      panel: 'background:rgba(10,16,22,0.97);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-left:1px solid rgba(255,255,255,0.14);color:#e9eef7;',
      card: 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:12px;',
      fab: 'background:#0d1520;color:#7dd3c0;border:1px solid rgba(125,211,192,0.45);box-shadow:0 12px 32px -8px rgba(0,0,0,0.55);',
      user: 'background:rgba(125,211,192,0.14);border:1px solid rgba(125,211,192,0.25);color:#e9eef7;',
      ai: 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#dbe4f0;',
      pill: 'background:transparent;border:1px solid rgba(255,255,255,0.2);color:#c7d2e2;border-radius:999px;',
      accent: '#7dd3c0', dim: '#8093a3', dimText: '#8b96a8', inputBg: 'rgba(255,255,255,0.06)', radius: '14px', font: "'DM Sans','Inter',-apple-system,sans-serif", mono: "'JetBrains Mono',monospace"
    },
    dossier: {
      panel: 'background:#f8f1de;border-left:1.5px solid #0a0a0a;color:#0a0a0a;',
      card: 'background:#fffdf6;border:1.5px solid #0a0a0a;border-radius:0;',
      fab: 'background:#0a0a0a;color:#f4ead2;border:1.5px solid #0a0a0a;box-shadow:6px 6px 0 rgba(10,8,4,0.14);',
      user: 'background:#0a0a0a;color:#f4ead2;border:1.5px solid #0a0a0a;',
      ai: 'background:#fffdf6;border:1px solid rgba(10,8,4,0.35);color:#1a1610;',
      pill: 'background:transparent;border:1px solid #0a0a0a;color:#0a0a0a;border-radius:0;',
      accent: '#b23a2e', dim: '#6b5d42', dimText: '#6b5d42', inputBg: '#fffdf6', radius: '0', font: "'DM Sans','Inter',-apple-system,sans-serif", mono: "'JetBrains Mono',monospace"
    },
    retro: {
      panel: 'background:#04120a;border-left:1px solid rgba(108,240,164,0.45);color:#9af0c2;',
      card: 'background:rgba(108,240,164,0.05);border:1px solid rgba(108,240,164,0.3);border-radius:0;',
      fab: 'background:#04120a;color:#6cf0a4;border:1px solid rgba(108,240,164,0.55);box-shadow:0 0 22px rgba(108,240,164,0.2);',
      user: 'background:rgba(108,240,164,0.14);border:1px solid rgba(108,240,164,0.35);color:#cdffe2;',
      ai: 'background:rgba(108,240,164,0.05);border:1px solid rgba(108,240,164,0.2);color:#9af0c2;',
      pill: 'background:transparent;border:1px solid rgba(108,240,164,0.45);color:#9af0c2;border-radius:0;',
      accent: '#6cf0a4', dim: '#3f9e69', dimText: '#5fbf8a', inputBg: 'rgba(108,240,164,0.07)', radius: '0', font: "'JetBrains Mono',monospace", mono: "'JetBrains Mono',monospace"
    }
  };

  /* ================= PORTFOLIO INDEX =================
     Every entry points at a real page. Reading times are honest estimates
     (quick tours ≈ 3–5 min, deep dives ≈ 8–12 min). */
  var P = {
    insights: {
      title: 'CORE Insights', org: 'Cooper Lighting · Signify', thumb: 'previews/thumb-insights.png?v=2',
      blurb: 'A building-analytics platform turning occupancy and energy telemetry into decisions — live dashboards, occupancy floor maps, and heat-map reporting at portfolio scale.',
      tags: ['Enterprise SaaS', 'Data viz', 'IoT'], read: '4 min tour · 10 min deep dive',
      kw: 'enterprise saas b2b dashboard dashboards analytics data visualization heatmap occupancy floor map maps plan building iot sensors telemetry energy facility operations reporting console admin live metrics charts',
      links: [{ label: 'Quick tour', href: 'core-insights-showcase.html' }, { label: 'Deep dive', href: 'core-insights.dc.html' }]
    },
    dali: {
      title: 'DALI-2 Lighting System', org: 'Industry first · Healthcare', thumb: 'previews/thumb-dali.png?v=2',
      blurb: "Commissioning UX for North America's largest DALI-2 hospital install — an industry first, shipped into a regulated healthcare environment.",
      tags: ['Commissioning', 'Healthcare', 'Industry first'], read: '4 min tour · 9 min deep dive',
      kw: 'dali commissioning healthcare hospital regulated lighting controls protocol industry first hardware embedded field tools installer largest install',
      links: [{ label: 'Quick tour', href: 'dali-2-showcase.html' }, { label: 'Deep dive', href: 'dali-2.dc.html' }]
    },
    smart: {
      title: 'Smart Lighting App', org: 'Consumer IoT · iOS & Android', thumb: 'previews/thumb-smart.png?v=2',
      blurb: 'A consumer mobile app for connected lighting — onboarding, scenes, and control patterns designed for non-technical households.',
      tags: ['Consumer IoT', 'Mobile'], read: '3 min tour · 8 min deep dive',
      kw: 'mobile app ios android consumer iot onboarding smart home connected lighting scenes control app store',
      links: [{ label: 'Quick tour', href: 'smart-lighting-showcase.html' }, { label: 'Deep dive', href: 'smart-lighting.dc.html' }]
    },
    fintech: {
      title: 'Goals-Driven Finance', org: 'Fintech · Open Banking', thumb: 'previews/thumb-fintech.png?v=2',
      blurb: 'A goals-first fintech product for regulated open banking — from PRD to a clickable build, produced with an AI-assisted design-to-code workflow.',
      tags: ['Fintech', 'Open banking', 'AI-assisted build'], read: '4 min tour · walkthrough',
      kw: 'fintech finance bank banking open banking payments regulated money goals savings prd ai assisted claude cursor github clickable build walkthrough',
      links: [{ label: 'Quick tour', href: 'goals-driven-fintech-showcase.html' }, { label: 'Product walkthrough', href: 'fintech-walkthrough.html' }]
    },
    ctoc: {
      title: 'CTOC Dashboard System', org: 'Enterprise cyber · 13 dashboards', thumb: 'previews/thumb-ctoc.png?v=2',
      blurb: 'A cyber threat-operations center: 13 coordinated dashboards on one dark, token-driven design system — SOC workflows, threat feeds, and dense data visualization.',
      tags: ['Cyber operations', 'Design system', 'Data viz'], read: '5 min tour · 12 min deep dive',
      kw: 'cyber security soc threat operations dashboard dashboards dark theme design system tokens components enterprise data visualization monitoring incident defense defence secure tactical',
      links: [{ label: 'Quick tour', href: 'ctoc-showcase.html' }, { label: 'Deep dive', href: 'ctoc-case-study.dc.html' }]
    },
    eai: {
      title: 'Application of AI', org: 'Enterprise AI', thumb: 'previews/thumb-ai.png?v=2',
      blurb: 'Designing AI into enterprise product surfaces — where automation earns trust, where humans keep the decision, and how agentic workflows get evidence-first UX.',
      tags: ['Enterprise AI', 'Agentic UX'], read: '4 min tour · 10 min deep dive',
      kw: 'ai artificial intelligence ml agentic llm copilot automation human in the loop trust evidence defense defence enterprise machine learning',
      links: [{ label: 'Quick tour', href: 'enterprise-ai-showcase.html' }, { label: 'Deep dive', href: 'enterprise-ai.dc.html' }]
    },
    partitioning: {
      title: 'Dynamic Space Partitioning', org: 'Cooper Lighting · Signify · WaveLinx CORE', thumb: 'previews/thumb-partitioning.png?v=2',
      blurb: 'A ballroom splits into eight independently-lit rooms, and merges back, as operable walls open and close — the system modeling moving walls, sub-areas, and devices into one configuration any installer can run.',
      tags: ['Connected Lighting', 'Hospitality & Venues', 'Operable Walls'], read: '4 min tour · 10 min deep dive',
      kw: 'partition partitioning wavelinx hospitality venue ballroom hotel operable wall walls sub-area sub-areas zone zones merge split sensor irtr contact closure floor plan simulator installer commissioning connected lighting cooper',
      links: [{ label: 'Quick tour', href: 'partitioning-showcase.html' }, { label: 'Deep dive', href: 'partitioning.dc.html' }]
    },
    la: {
      title: 'Light Architect', org: 'Interactive photometric planner', thumb: null,
      blurb: 'A live photometric site planner on the homepage — drag fixtures over satellite imagery and watch footcandle grids and isolux contours recompute in real time.',
      tags: ['Geospatial', 'Interactive', 'Simulation'], read: '2 min, hands-on',
      kw: 'map maps geospatial satellite site plan photometric lighting simulation interactive footcandle isolux spatial gis location',
      links: [{ label: 'Try it on the homepage', href: 'homepage-interactive.dc.html#la-stage' }]
    },
    aegis: {
      title: 'AEGIS Decision Drills', org: 'Playable classification games', thumb: null,
      blurb: 'Four playable drills about decision-making under uncertainty — sensor tasking, classification watches, and an intercept trainer. The thesis: the model brings receipts, you keep the decision.',
      tags: ['Defense AI', 'Interactive', 'Games'], read: '3 min, hands-on',
      kw: 'defense defence aegis game drill intercept classification sensor tactical mission arctic radar decision uncertainty playable',
      links: [{ label: 'Take the watch', href: 'homepage-interactive.dc.html#ag-stage' }]
    },
    about: {
      title: 'About · Leadership & Patents', org: '3 patent applications · Signify', thumb: null,
      blurb: 'Career story from connected-lighting IoT to defense-adjacent AI, leading cross-functional delivery — plus three lighting-design patent applications with Google Patents links.',
      tags: ['Leadership', 'Patents', 'Career'], read: '3 min',
      kw: 'about leadership lead led team cross functional mentor stakeholder strategy patent patents invention career story bio experience principal senior head signify',
      links: [{ label: 'About page', href: 'about.dc.html' }]
    },
    resume: {
      title: 'Resume', org: 'PDF · one page', thumb: null,
      blurb: 'The full resume as a PDF — roles, scope, and impact in one page.',
      tags: ['Resume'], read: '1 min',
      kw: 'resume cv curriculum pdf download experience roles history',
      links: [{ label: 'Open the resume (PDF)', href: 'robert-babiarz-resume.pdf' }]
    },
    contact: {
      title: 'Contact', org: 'Available for full-time & contract', thumb: null,
      blurb: 'Reach Robert directly — the contact section has email and LinkedIn.',
      tags: ['Contact'], read: '1 min',
      kw: 'contact email hire hiring reach interview available availability freelance linkedin talk call',
      links: [{ label: 'Go to contact', href: 'homepage-interactive.dc.html#contact' }]
    }
  };

  /* ================= INTENTS ================= */
  var INTENTS = [
    { id: 'defense', kw: 'defense defence sector industry military tactical mission dominion aegis intercept secure clearance government battlespace c2 command games drills',
      reply: 'Defense-adjacent work runs through this portfolio: playable decision drills on the homepage (AEGIS / Fusion Watch), the CTOC cyber-operations dashboard system, and enterprise AI with human-in-the-loop patterns — the thesis that the model brings receipts and you keep the decision.',
      projects: ['aegis', 'ctoc', 'eai'],
      pills: ['Geospatial maps', 'Cyber operations dashboards', 'Systems thinking', 'Data visualization', 'Leadership examples'],
      tour: { name: 'Defense product designer tour', steps: [['Start at the homepage', 'homepage-interactive.dc.html'], ['Application of AI', 'enterprise-ai-showcase.html'], ['CTOC dashboard system', 'ctoc-showcase.html'], ['AEGIS decision drills', 'homepage-interactive.dc.html#ag-stage'], ['Resume (PDF)', 'robert-babiarz-resume.pdf'], ['Contact', 'homepage-interactive.dc.html#contact']] } },
    { id: 'enterprise', kw: 'enterprise saas b2b business admin console platform complex workflows internal tools',
      reply: 'The enterprise SaaS work centers on dense, operational surfaces — analytics platforms, a 13-dashboard cyber suite, and AI woven into enterprise workflows.',
      projects: ['insights', 'ctoc', 'eai'],
      pills: ['Design systems experience', 'Data visualization', 'Accessibility expertise', 'Defense industry projects'] },
    { id: 'designsystems', kw: 'design system systems tokens token component components library libraries figma documentation handoff theming multi-brand variables styleguide',
      reply: 'The strongest design-system evidence is CTOC — 13 dashboards held together by one dark, token-driven system — and this site itself runs on a three-tier token architecture (primitive → semantic → component) you are looking at right now.',
      projects: ['ctoc', 'insights'],
      pills: ['Component libraries', 'Token systems', 'Developer handoff', 'Accessibility work', 'Enterprise SaaS'] },
    { id: 'accessibility', kw: 'accessibility accessible a11y wcag aoda contrast screen reader keyboard focus inclusive',
      reply: 'Accessibility is part of done here: the whole site targets WCAG 2.2 AA / AODA — 4.5:1 text contrast, keyboard paths with visible focus, reduced-motion support, and meaning that never rides on color alone. The case studies document those decisions.',
      projects: ['insights', 'ctoc', 'smart'],
      pills: ['Design systems experience', 'Enterprise SaaS work', 'Consumer mobile work'] },
    { id: 'geo', kw: 'map maps mapping geospatial gis satellite spatial location floor plan plans site geo',
      reply: 'Three live examples: Light Architect, a photometric planner over satellite imagery you can operate right on the homepage, the occupancy floor maps at the heart of CORE Insights, and the live floor-plan simulator in Dynamic Space Partitioning.',
      projects: ['la', 'insights', 'partitioning', 'aegis'],
      pills: ['Defense industry projects', 'Data visualization', 'Interactive prototypes'] },
    { id: 'leadership', kw: 'leadership lead led leading team teams cross-functional crossfunctional mentor stakeholders strategy strategic executive principal staff head senior seniority',
      reply: "Leadership evidence lives on the About page — cross-functional delivery on North America's largest DALI-2 install, three patent applications, and the career arc from IoT to defense-adjacent AI.",
      projects: ['about', 'dali'],
      pills: ['Patents', 'Enterprise SaaS work', 'Resume'] },
    { id: 'iot', kw: 'iot connected hardware devices device sensor sensors embedded lighting luminaire smart building',
      reply: 'Connected-lighting IoT is the origin story: platform analytics, a first-of-its-kind healthcare commissioning system, dynamic space partitioning with operable walls, and a consumer mobile app.',
      projects: ['insights', 'dali', 'partitioning', 'smart'],
      pills: ['Enterprise SaaS work', 'Consumer mobile work', 'Geospatial and mapping work'] },
    { id: 'mobile', kw: 'mobile ios android phone app consumer apps native',
      reply: 'The consumer mobile work is the Smart Lighting App — onboarding, scenes, and control designed for non-technical households on iOS and Android.',
      projects: ['smart', 'fintech'],
      pills: ['Consumer IoT', 'Fintech work', 'Accessibility expertise'] },
    { id: 'fintech', kw: 'fintech finance financial bank banking payments money open banking regulated savings goals',
      reply: 'Goals-Driven Finance is the fintech piece — a regulated open-banking product taken from PRD to a clickable build with an AI-assisted workflow.',
      projects: ['fintech'],
      pills: ['AI-assisted workflows', 'Enterprise SaaS work', 'Product walkthrough'] },
    { id: 'cyber', kw: 'cyber cybersecurity soc security threat threats incident monitoring operations center',
      reply: 'CTOC is the cyber flagship: a threat-operations center of 13 coordinated dashboards on one dark design system.',
      projects: ['ctoc', 'eai'],
      pills: ['Design systems experience', 'Defense industry projects', 'Data visualization'] },
    { id: 'dataviz', kw: 'data visualization visualisation viz charts chart graphs dashboards analytics metrics reporting dense',
      reply: 'Dense data surfaces are a through-line — occupancy heat maps and trend reporting in CORE Insights, and 13 dashboards of threat telemetry in CTOC.',
      projects: ['insights', 'ctoc'],
      pills: ['Enterprise SaaS work', 'Cyber operations', 'Geospatial and mapping work'] },
    { id: 'ai', kw: 'ai artificial intelligence ml machine learning llm agent agentic copilot automation genai',
      reply: 'AI work in two registers: the Application of AI case study on trust and human-in-the-loop enterprise UX, and the AI-assisted build behind Goals-Driven Finance. This concierge is part of that story too — a working retrieval assistant designed and shipped into the portfolio itself.',
      projects: ['eai', 'fintech', 'aegis'],
      pills: ['Defense industry projects', 'Enterprise SaaS work', 'Interactive prototypes'] },
    { id: 'process', kw: 'process research discovery usability testing methods wireframes artifacts prototype prototypes prototyping interaction how you work',
      reply: 'Every case study ships in two depths — a quick tour of outcomes and a deep dive with the process, decisions, and discarded alternatives. The deep dives are where the research and rationale live.',
      projects: ['insights', 'ctoc', 'eai'],
      pills: ['Design systems experience', 'Leadership examples', 'Accessibility expertise'] },
    { id: 'patents', kw: 'patent patents invention inventions ip intellectual property',
      reply: 'Three lighting-design patent applications (filed at Signify), each linked to Google Patents from the About page.',
      projects: ['about'],
      pills: ['Leadership examples', 'IoT work', 'Resume'] },
    { id: 'hire', kw: 'hire hiring interview role position opening job candidate fit recruit recruiter available availability contract freelance',
      reply: "Robert is available for full-time and contract work. Tell me the role's domain and I'll line up the most relevant evidence — or jump straight to the resume and contact below.",
      projects: ['resume', 'contact', 'about'],
      pills: ['Defense industry projects', 'Enterprise SaaS work', 'Design systems experience', 'Leadership examples'] },
    { id: 'resume', kw: 'resume cv curriculum vitae download pdf',
      reply: 'Here is the resume, plus the fastest routes to evidence behind it.',
      projects: ['resume', 'about', 'contact'],
      pills: ['Leadership examples', 'Enterprise SaaS work', 'Defense industry projects'] }
  ];

  var DEFAULT_PILLS = ['Show me enterprise SaaS work', 'Design systems experience', 'Defense sector work', 'Accessibility expertise', 'Leadership examples', 'Geospatial and mapping work', 'Dashboards', 'IoT lighting', 'Mobile apps'];
  var WELCOME = "Hi — I'm the portfolio concierge. Tell me what you're hiring for or looking for, and I'll route you to the most relevant projects, skills, and case studies on this site.";

  /* ================= RETRIEVAL ================= */
  function tokens(s) { return (s || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter(function (w) { return w.length > 1; }); }
  function scoreText(qTokens, text) {
    var t = ' ' + text.toLowerCase() + ' ', n = 0;
    for (var i = 0; i < qTokens.length; i++) {
      var w = qTokens[i];
      if (t.indexOf(' ' + w + ' ') !== -1) n += 2;
      else if (w.length > 3 && t.indexOf(w.slice(0, w.length - 1)) !== -1) n += 1; // light stemming
    }
    return n;
  }
  // full-text section search over window.RB_SEARCH_INDEX (see build-search-index.py):
  // lets answers deep-link to a specific page *and* section, beyond the case-study cards.
  function searchSections(q) {
    var idx = window.RB_SEARCH_INDEX;
    if (!idx || !idx.length) return [];
    var out = [];
    for (var i = 0; i < idx.length; i++) {
      var e = idx[i];
      var sc = scoreText(q, e.h) * 2 + scoreText(q, e.p) + scoreText(q, e.k);
      if (sc > 0) out.push([sc, e]);
    }
    out.sort(function (a, b) { return b[0] - a[0]; });
    return out;
  }
  function topSections(scored, min, n) {
    var seen = {}, out = [];
    for (var i = 0; i < scored.length && out.length < n; i++) {
      if (scored[i][0] < min) break;
      var e = scored[i][1];
      if (seen[e.u]) continue; seen[e.u] = 1; out.push(e);
    }
    return out;
  }
  function respond(query) {
    var q = tokens(query);
    var secScored = searchSections(q);
    var best = null, bestScore = 0, second = null;
    for (var i = 0; i < INTENTS.length; i++) {
      var s = scoreText(q, INTENTS[i].kw);
      if (s > bestScore) { second = best; best = INTENTS[i]; bestScore = s; }
      else if (best && s > 0 && (!second || s > scoreText(q, second.kw))) second = INTENTS[i];
    }
    var wantsTour = /\b(tour|journey|walk me|guide me|where do i start|start)\b/i.test(query);
    if (best && bestScore >= 2) {
      var projects = best.projects.slice(0, 4);
      // multi-intent: blend the runner-up's top project in
      if (second && second !== best && scoreText(q, second.kw) >= 2 && projects.indexOf(second.projects[0]) === -1) projects.push(second.projects[0]);
      return { text: best.reply, projects: projects.slice(0, 4), pills: best.pills, tour: (wantsTour || best.id === 'hire') && best.tour ? best.tour : (best.tour && /hiring|recruit/i.test(query) ? best.tour : null), sections: topSections(secScored, 9, 2), intent: best.id };
    }
    // fallback: score the index directly
    var ranked = Object.keys(P).map(function (k) { return [k, scoreText(q, P[k].kw + ' ' + P[k].title + ' ' + P[k].blurb)]; })
      .sort(function (a, b) { return b[1] - a[1]; }).filter(function (r) { return r[1] > 0; });
    if (ranked.length) {
      return { text: 'Here is the closest work I can find for that:', projects: ranked.slice(0, 3).map(function (r) { return r[0]; }), pills: DEFAULT_PILLS.slice(0, 4), sections: topSections(secScored, 4, 3), intent: 'fallback' };
    }
    var secHits = topSections(secScored, 2, 4);
    if (secHits.length) {
      return { text: 'Here is where that comes up on this site — jump straight to the section:', sections: secHits, pills: DEFAULT_PILLS.slice(0, 4), intent: 'search' };
    }
    return { text: "I couldn't match that to anything indexed on this site. Try a domain (defense, fintech, IoT), a craft (design systems, accessibility, data viz), or ask for leadership, patents, or the resume.", projects: ['insights', 'ctoc'], pills: DEFAULT_PILLS.slice(0, 4), intent: 'none' };
  }

  /* ================= STATE ================= */
  var state = { mode: 'fab', msgs: [] }; // mode: fab | mini | panel
  try { var saved = JSON.parse(store.get('rb-ai-chat') || 'null'); if (saved && saved.msgs) state = saved; } catch (e) {}
  function persist() { store.set('rb-ai-chat', JSON.stringify(state)); }

  var T = THEMES['default'];
  var els = {};

  /* ================= UI ================= */
  function css(el, s) { el.style.cssText += s; return el; }
  function mk(tag, styles, html) { var el = document.createElement(tag); if (styles) el.style.cssText = styles; if (html != null) el.innerHTML = html; return el; }
  function panelWidth() {
    var w = window.innerWidth;
    if (w <= 720) return '100vw';
    if (w <= 1100) return '50vw';
    if (w >= 1600) return '25vw';
    return '30vw';
  }

  function ensureIconFont() {
    if (document.querySelector('link[href*="Material+Symbols"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..500,0..1,0&icon_names=add,arrow_back,arrow_forward,auto_awesome,close,refresh,remove&display=block';
    document.head.appendChild(l);
  }

  function build() {
    T = THEMES[themeOf()] || THEMES['default'];
    ensureIconFont();
    var base = 'font-family:' + T.font + ';box-sizing:border-box;';

    /* ---- FAB ---- */
    var fab = mk('button', base + 'position:fixed;right:18px;bottom:18px;z-index:99990;height:54px;min-width:54px;max-width:calc(100vw - 36px);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 16px;display:inline-flex;align-items:center;gap:10px;cursor:pointer;border-radius:999px;font-size:13px;font-weight:600;letter-spacing:0.02em;' + T.fab + (reduce ? '' : 'transition:transform .2s ease, box-shadow .2s ease;'));
    fab.id = 'rb-ai-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open the portfolio concierge chat');
    fab.setAttribute('data-cursor', 'hover');
    fab.setAttribute('aria-haspopup', 'dialog');
    var glyph = mk('span', 'font-size:20px;line-height:1;' + (reduce ? '' : 'animation:rbAiPulse 2.6s ease-in-out infinite;'), '<span class="msi" aria-hidden="true" style="font-size:26px;">auto_awesome</span>');
    glyph.setAttribute('aria-hidden', 'true');
    var fabLbl = mk('span', 'max-width:0;overflow:hidden;white-space:nowrap;' + (reduce ? '' : 'transition:max-width .28s ease;'), seenBefore || state.msgs.length ? 'Continue your conversation' : 'Ask my portfolio anything');
    fab.appendChild(glyph); fab.appendChild(fabLbl);
    fab.addEventListener('mouseenter', function () { fabLbl.style.maxWidth = '240px'; });
    fab.addEventListener('mouseleave', function () { fabLbl.style.maxWidth = '0'; });
    fab.addEventListener('focus', function () { fabLbl.style.maxWidth = '240px'; });
    fab.addEventListener('blur', function () { fabLbl.style.maxWidth = '0'; });
    fab.addEventListener('click', function () { open(state.msgs.length ? 'panel' : 'mini'); });
    if (!reduce) {
      var st = mk('style', '', '@keyframes rbAiPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.55;transform:scale(0.92)}}');
      document.head.appendChild(st);
    }
    document.body.appendChild(fab);
    els.fab = fab;
    // one resolver for the bottom offset: clear the cookie banner while it is
    // up, and on narrow screens clear the case-study view switcher pinned to
    // the bottom centre (re-checked late because .dc pages render it via React)
    function fitFab() {
      var need = 18;
      var b = document.getElementById('rb-consent');
      if (b) need = Math.max(need, b.getBoundingClientRect().height + 30);
      var pill = document.querySelector('.verpill, .cs-verpill');
      if (pill && window.innerWidth <= 700) need = Math.max(need, 84);
      fab.style.bottom = need + 'px';
    }
    fitFab();
    setTimeout(fitFab, 600);
    setTimeout(fitFab, 2200);
    window.addEventListener('load', fitFab);
    window.addEventListener('resize', fitFab, { passive: true });
    window.addEventListener('rb-consent', function () { setTimeout(fitFab, 600); });

    /* ---- shared shell (mini modal / panel are the same node, resized) ---- */
    var shell = mk('section', base + 'position:fixed;z-index:99991;display:none;flex-direction:column;overflow:hidden;' + T.panel + (reduce ? '' : 'transition:width .3s ease, height .3s ease, right .3s ease, bottom .3s ease, top .3s ease, opacity .3s ease;'));
    shell.id = 'rb-ai-shell';
    shell.setAttribute('role', 'dialog');
    shell.setAttribute('aria-label', 'Portfolio concierge');
    document.body.appendChild(shell);
    els.shell = shell;

    /* header */
    var head = mk('div', 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid ' + (themeOf() === 'dossier' ? 'rgba(10,8,4,0.3)' : 'rgba(127,127,127,0.25)') + ';flex:0 0 auto;');
    var avatar = mk('span', 'width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border-radius:' + (T.radius === '0' ? '0' : '999px') + ';font-size:15px;flex:0 0 auto;' + T.user, '<span class="msi" aria-hidden="true">auto_awesome</span>');
    avatar.setAttribute('aria-hidden', 'true');
    var titleBox = mk('div', 'flex:1;min-width:0;');
    titleBox.appendChild(mk('div', 'font-size:13px;font-weight:700;letter-spacing:0.02em;', 'Portfolio Concierge'));
    titleBox.appendChild(mk('div', 'font-family:' + T.mono + ';font-size:9.5px;letter-spacing:0.1em;text-transform:uppercase;color:' + T.dimText + ';', 'Finds the work — you keep the decision'));
    var btnStyle = 'background:transparent;border:0;cursor:pointer;color:' + T.dimText + ';font-size:14px;padding:6px 7px;line-height:1;font-family:' + T.mono + ';';
    var newBtn = mk('button', btnStyle, '<span class="msi" aria-hidden="true">refresh</span>'); newBtn.type = 'button'; newBtn.title = 'New chat'; newBtn.setAttribute('aria-label', 'Start a new chat');
    var minBtn = mk('button', btnStyle, '<span class="msi" aria-hidden="true">remove</span>'); minBtn.type = 'button'; minBtn.title = 'Minimize'; minBtn.setAttribute('aria-label', 'Minimize the chat');
    var closeBtn = mk('button', btnStyle, '<span class="msi" aria-hidden="true">close</span>'); closeBtn.type = 'button'; closeBtn.title = 'Close'; closeBtn.setAttribute('aria-label', 'Close the chat');
    newBtn.addEventListener('click', function () { state.msgs = []; persist(); renderMsgs(); pushAI(WELCOME, null, DEFAULT_PILLS); });
    minBtn.addEventListener('click', minimize);
    closeBtn.addEventListener('click', function () { state.msgs = []; minimize(); persist(); });
    head.appendChild(avatar); head.appendChild(titleBox); head.appendChild(newBtn); head.appendChild(minBtn); head.appendChild(closeBtn);
    shell.appendChild(head);

    /* chat log */
    var log = mk('div', 'flex:1 1 auto;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;font-size:13.5px;line-height:1.55;');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    shell.appendChild(log);
    els.log = log;

    /* pills row */
    var pills = mk('div', 'flex:0 0 auto;display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 10px;');
    shell.appendChild(pills);
    els.pills = pills;

    /* input row */
    var form = mk('form', 'flex:0 0 auto;display:flex;gap:8px;padding:12px 16px 16px;border-top:1px solid ' + (themeOf() === 'dossier' ? 'rgba(10,8,4,0.3)' : 'rgba(127,127,127,0.25)') + ';');
    var input = mk('input', 'flex:1;min-width:0;padding:11px 14px;font-size:13.5px;font-family:inherit;color:inherit;border:1px solid ' + (themeOf() === 'dossier' ? '#0a0a0a' : 'rgba(127,127,127,0.35)') + ';border-radius:' + (T.radius === '0' ? '0' : '10px') + ';background:' + T.inputBg + ';outline-offset:2px;');
    input.type = 'text';
    input.placeholder = 'What are you looking for?';
    input.setAttribute('aria-label', 'Ask the portfolio concierge');
    input.maxLength = 300;
    var send = mk('button', 'padding:11px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;border:0;border-radius:' + (T.radius === '0' ? '0' : '10px') + ';background:' + T.accent + ';color:' + (themeOf() === 'default' ? '#06201d' : themeOf() === 'retro' ? '#04130b' : '#f4ead2') + ';', 'Send');
    send.type = 'submit';
    form.appendChild(input); form.appendChild(send);
    form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (v) { input.value = ''; ask(v); } });
    shell.appendChild(form);
    els.input = input;

    shell.addEventListener('keydown', function (e) { if (e.key === 'Escape') minimize(); });

    // restore an open conversation after page navigation
    if (state.mode === 'panel' && state.msgs.length) { open('panel', true); }
    else if (state.msgs.length) { /* keep minimized; FAB label already says continue */ }
  }

  function layout(mode) {
    var s = els.shell.style;
    var edge = themeOf() === 'dossier' ? '1.5px solid #0a0a0a'
             : themeOf() === 'retro' ? '1px solid rgba(108,240,164,0.45)'
             : '1px solid rgba(255,255,255,0.16)';
    if (mode === 'mini') {
      s.width = 'min(450px, calc(100vw - 24px))'; s.height = 'min(560px, calc(100vh - 96px))';
      try { if (window.CSS && CSS.supports('height', '100dvh')) s.height = 'min(560px, calc(100dvh - 96px))'; } catch (e) {}
      s.right = '18px'; s.bottom = '84px'; s.top = 'auto'; s.left = 'auto';
      s.borderRadius = T.radius === '0' ? '0' : '16px';
      s.border = edge;
      s.boxShadow = themeOf() === 'dossier' ? '8px 8px 0 rgba(10,8,4,0.14)' : '0 26px 64px -14px rgba(0,0,0,0.55)';
    } else {
      var w = panelWidth();
      if (window.innerWidth <= 720) { s.left = '0'; s.right = '0'; s.width = 'auto'; }
      else { s.width = w; s.right = '0'; s.left = 'auto'; }
      s.height = '100vh';
      try { if (window.CSS && CSS.supports('height', '100dvh')) s.height = '100dvh'; } catch (e) {}
      s.maxWidth = '100vw'; s.overflowX = 'hidden';
      s.bottom = '0'; s.top = '0';
      // keyboard-aware: 100vh/100dvh do not shrink when the on-screen keyboard
      // opens (especially iOS), leaving the input row hidden behind it. The
      // visual viewport tracks the keyboard on both platforms — fit to it.
      var vv = window.visualViewport;
      if (vv && window.innerWidth <= 720) {
        s.top = vv.offsetTop + 'px';
        s.bottom = 'auto';
        s.height = vv.height + 'px';
      }
      s.borderRadius = '0';
      s.border = 'none';
      s.borderLeft = edge;
      s.boxShadow = themeOf() === 'dossier' ? 'none' : '-18px 0 48px -24px rgba(0,0,0,0.5)';
    }
  }

  function open(mode, restoring) {
    if (window.innerWidth <= 720) mode = 'panel'; // phones: full-screen chat, keyboard-fitted
    state.mode = mode; persist();
    try { localStorage.setItem('rb-ai-seen', '1'); } catch (e) {}
    els.shell.style.display = 'flex';
    layout(mode);
    els.fab.style.display = 'none';
    renderMsgs();
    if (!state.msgs.length) pushAI(WELCOME, null, DEFAULT_PILLS);
    if (!restoring) track('AI_OPENED', { mode: mode });
    setTimeout(function () { try { els.input.focus({ preventScroll: true }); } catch (e) {} }, reduce ? 0 : 320);
  }
  function minimize() {
    state.mode = 'fab'; persist();
    els.shell.style.display = 'none';
    els.fab.style.display = 'inline-flex';
    try { els.fab.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---- message rendering ---- */
  function bubble(msg) {
    var isUser = msg.role === 'user';
    var b = mk('div', 'max-width:92%;padding:10px 13px;border-radius:' + (T.radius === '0' ? '0' : '12px') + ';align-self:' + (isUser ? 'flex-end' : 'flex-start') + ';' + (isUser ? T.user : T.ai));
    b.textContent = msg.text;
    return b;
  }
  function cardFor(key) {
    var p = P[key]; if (!p) return null;
    var c = mk('article', 'display:flex;gap:11px;padding:11px;align-self:stretch;' + T.card);
    if (p.thumb) {
      var img = mk('img', 'width:86px;height:57px;object-fit:cover;flex:0 0 auto;border-radius:' + (T.radius === '0' ? '0' : '7px') + ';');
      img.src = p.thumb; img.alt = ''; img.loading = 'lazy';
      c.appendChild(img);
    } else {
      var ph = mk('div', 'width:86px;height:57px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:19px;border-radius:' + (T.radius === '0' ? '0' : '7px') + ';' + T.user, '<span class="msi" aria-hidden="true">auto_awesome</span>');
      ph.setAttribute('aria-hidden', 'true');
      c.appendChild(ph);
    }
    var body = mk('div', 'flex:1;min-width:0;');
    body.appendChild(mk('div', 'font-size:13px;font-weight:700;line-height:1.3;', p.title));
    body.appendChild(mk('div', 'font-family:' + T.mono + ';font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:' + T.dimText + ';margin:2px 0 5px;', p.tags.join(' · ') + ' · ' + p.read));
    var linkRow = mk('div', 'display:flex;flex-wrap:wrap;gap:6px;');
    p.links.forEach(function (l) {
      var a = mk('a', 'font-size:11.5px;font-weight:600;text-decoration:none;padding:5px 10px;cursor:pointer;color:' + T.accent + ';border:1px solid ' + T.accent + ';border-radius:' + (T.radius === '0' ? '0' : '999px') + ';', l.label + ' <span class="msi" aria-hidden="true" style="font-size:1em;">arrow_forward</span>');
      a.href = l.href;
      a.setAttribute('data-cursor', 'hover');
      a.addEventListener('click', function () {
        track('AI_LINK_CLICKED', { target: l.href, project: p.title });
        if (/showcase|\.dc\.html/.test(l.href)) track('CASE_STUDY_OPENED', { case_study: p.title });
        if (l.href.indexOf('#contact') !== -1) track('CONTACT_CLICKED', {});
      });
      linkRow.appendChild(a);
    });
    body.appendChild(linkRow);
    c.appendChild(body);
    return c;
  }
  function tourBlock(tour) {
    var wrap = mk('div', 'align-self:stretch;padding:11px 13px;' + T.card);
    wrap.appendChild(mk('div', 'font-family:' + T.mono + ';font-size:9.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:' + T.accent + ';margin-bottom:7px;', tour.name));
    var ol = mk('ol', 'margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;font-size:12.5px;');
    tour.steps.forEach(function (s) {
      var li = document.createElement('li');
      var a = mk('a', 'color:inherit;text-decoration:underline;text-underline-offset:2px;cursor:pointer;', s[0]);
      a.href = s[1];
      a.addEventListener('click', function () { track('AI_LINK_CLICKED', { target: s[1], tour: tour.name }); });
      li.appendChild(a);
      ol.appendChild(li);
    });
    wrap.appendChild(ol);
    return wrap;
  }
  function sectionBlock(list) {
    var wrap = mk('div', 'align-self:stretch;padding:11px 13px;' + T.card);
    wrap.appendChild(mk('div', 'font-family:' + T.mono + ';font-size:9.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:' + T.accent + ';margin-bottom:8px;', 'Jump to a section'));
    var col = mk('div', 'display:flex;flex-direction:column;gap:8px;');
    list.forEach(function (e) {
      var a = mk('a', 'display:block;text-decoration:none;color:inherit;cursor:pointer;');
      a.href = e.u;
      a.setAttribute('data-cursor', 'hover');
      a.appendChild(mk('div', 'font-size:12.5px;font-weight:700;line-height:1.35;color:' + T.accent + ';',
        e.p + ' › ' + e.h + ' <span class="msi" aria-hidden="true" style="font-size:1em;">arrow_forward</span>'));
      if (e.s) a.appendChild(mk('div', 'font-size:11.5px;line-height:1.45;color:' + T.dimText + ';margin-top:2px;', e.s));
      a.addEventListener('click', function () { track('AI_SECTION_CLICKED', { target: e.u, heading: e.h }); });
      col.appendChild(a);
    });
    wrap.appendChild(col);
    return wrap;
  }
  function renderPills(list) {
    els.pills.innerHTML = '';
    (list || DEFAULT_PILLS).slice(0, 9).forEach(function (label) {
      var b = mk('button', 'font-size:11.5px;font-weight:600;padding:6px 11px;cursor:pointer;font-family:inherit;' + T.pill);
      b.type = 'button';
      b.textContent = label;
      b.setAttribute('data-cursor', 'hover');
      b.addEventListener('click', function () { track('SUGGESTION_CLICKED', { suggestion: label }); ask(label); });
      els.pills.appendChild(b);
    });
  }
  function renderMsgs() {
    els.log.innerHTML = '';
    var lastPills = null;
    state.msgs.forEach(function (m) {
      els.log.appendChild(bubble(m));
      if (m.projects) m.projects.forEach(function (k) { var c = cardFor(k); if (c) els.log.appendChild(c); });
      if (m.tour) els.log.appendChild(tourBlock(m.tour));
      if (m.sections && m.sections.length) els.log.appendChild(sectionBlock(m.sections));
      if (m.pills) lastPills = m.pills;
    });
    renderPills(lastPills);
    els.log.scrollTop = els.log.scrollHeight;
  }
  function pushAI(text, extra, pills) {
    var m = { role: 'ai', text: text, projects: extra && extra.projects, tour: extra && extra.tour, sections: extra && extra.sections, pills: pills || (extra && extra.pills) };
    state.msgs.push(m); persist(); renderMsgs();
  }
  function ask(q) {
    state.msgs.push({ role: 'user', text: q }); persist(); renderMsgs();
    track('AI_PROMPT_SUBMITTED', { prompt: q.slice(0, 120) });
    if (state.mode === 'mini') { state.mode = 'panel'; layout('panel'); persist(); }
    var r = respond(q);
    if (r.tour) track('TOUR_STARTED', { tour: r.tour.name });
    var delay = reduce ? 0 : 350;
    setTimeout(function () { pushAI(r.text, r, r.pills); }, delay);
  }

  /* ---- responsive: re-lay the panel on resize ---- */
  window.addEventListener('resize', function () { if (state.mode === 'panel' && els.shell && els.shell.style.display !== 'none') layout('panel'); });
  if (window.visualViewport) {
    var vvFit = function () {
      if (state.mode === 'panel' && els.shell && els.shell.style.display !== 'none') {
        layout('panel');
        if (els.log) els.log.scrollTop = els.log.scrollHeight;
      }
    };
    window.visualViewport.addEventListener('resize', vvFit);
    window.visualViewport.addEventListener('scroll', vvFit);
  }

  function boot() { if (!document.body) return setTimeout(boot, 60); build(); }
  boot();
})();
