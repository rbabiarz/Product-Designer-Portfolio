// AEGIS DI — mock operational data. Composite scenarios from PRD §7.
// Names, units, callsigns are fictional. All timestamps relative to a fixed "now".

window.AEGIS_DATA = (() => {
  const NOW = new Date("2026-05-26T14:32:00Z");

  const fmtZulu = (d) => {
    const pad = n => String(n).padStart(2,'0');
    return `${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}Z MAY 26`;
  };
  const minsAgo = (n) => new Date(NOW.getTime() - n*60_000);

  // ---------- Indicators / fused cards (S1 triage) ----------
  const indicators = [
    {
      id: "IND-2026-0814",
      title: "Unknown actor surfaced in vicinity of CFS Alert resupply window",
      region: "AO-NORTH",
      coords: "82.5018° N, 62.3481° W",
      severity: "s2",
      ts: minsAgo(7),
      sources: [
        { kind: "sigint", ref: "SIG/R/0826-114", caveat: "ORCON", time: minsAgo(11) },
        { kind: "osint", ref: "OSI/TWX/9912-A", caveat: "FVEY", time: minsAgo(18) }
      ],
      ai: {
        proposedEntity: "EX-IRBIS-04",
        confidence: 0.78,
        rationale: "Cross-correlation of voice print fragment (SIG/R/0826-114, ƒ-bin 04-A) and timestamp-adjacent social post (OSI/TWX/9912-A) places a 78% probability of match against entity EX-IRBIS-04 (previously assessed active in AO-NORTH 2025-Q4).",
        contradicting: "Geo-tagged image metadata (OSI/TWX/9912-A) places device 11.3km north of last known EX-IRBIS-04 transit corridor; cohort variance within historical norm but flagged.",
        modelVersion: "aegis-er-2.3.1",
      }
    },
    {
      id: "IND-2026-0813",
      title: "Anomalous financial flow — shell entity LANDFALL CONSULTING",
      region: "AO-EAST",
      coords: "Toronto / Tallinn / Limassol",
      severity: "s1",
      ts: minsAgo(22),
      sources: [
        { kind: "fininl", ref: "FIN/TRC/4451", caveat: "CAN ONLY", time: minsAgo(31) },
        { kind: "humint", ref: "HUM/LIA/0211", caveat: "ORCON, REL FVEY", time: minsAgo(45) },
        { kind: "osint", ref: "OSI/REG/CORP-7741", time: minsAgo(60) }
      ],
      ai: { proposedEntity: "ORG-LANDFALL-CONS", confidence: 0.91, rationale: "Three transactions ≥ CAD $250k routed via known typology (T-04); beneficial ownership chain matches HUM/LIA/0211 reporting.", modelVersion: "aegis-er-2.3.1" }
    },
    {
      id: "IND-2026-0812",
      title: "Unattributed UAV track, RCAF radar trace, Goose Bay sector",
      region: "AO-EAST",
      coords: "53.31° N, 60.42° W",
      severity: "s2",
      ts: minsAgo(34),
      sources: [
        { kind: "geoint", ref: "GEO/RAD/8821", time: minsAgo(35) },
        { kind: "sigint", ref: "SIG/E/0826-077", time: minsAgo(40) }
      ],
      ai: { proposedEntity: "TRACK-UNK-08821", confidence: 0.62, rationale: "Track signature consistent with commercial UAV class; no transponder; nearest correlation to civilian filed flight plan is 84km offset.", modelVersion: "aegis-er-2.3.1" }
    },
    {
      id: "IND-2026-0811",
      title: "FI indicator — coordinated narrative shift across diaspora media",
      region: "AO-DOM",
      coords: "Vancouver / Montréal / Online",
      severity: "s2",
      ts: minsAgo(58),
      sources: [
        { kind: "osint", ref: "OSI/MED/1102-B", time: minsAgo(58) },
        { kind: "partner", ref: "PART/UK-CFI/22", caveat: "REL FVEY", time: minsAgo(70) }
      ],
      ai: { proposedEntity: "CAMPAIGN-PETREL-3", confidence: 0.84, rationale: "Synchronised posting pattern across 14 accounts (Δ < 6 min); language overlap with PETREL-3 campaign template (prior 2025-Q4 indicators).", modelVersion: "aegis-er-2.3.1" }
    },
    {
      id: "IND-2026-0810",
      title: "Port call deviation — m/v ATLANTIC HERON, declared route vs AIS",
      region: "AO-EAST",
      coords: "47.56° N, 52.71° W",
      severity: "s3",
      ts: minsAgo(95),
      sources: [
        { kind: "geoint", ref: "GEO/AIS/55102", time: minsAgo(96) },
        { kind: "osint", ref: "OSI/SHIP/REG-2811", time: minsAgo(120) }
      ],
      ai: { proposedEntity: "VESSEL-ATLHERON", confidence: 0.95, rationale: "AIS gap 04:12Z–07:48Z; resumed transponder 38nm from declared waypoint. Pattern matches dark-fleet typology DF-22.", modelVersion: "aegis-er-2.3.1" }
    },
    {
      id: "IND-2026-0809",
      title: "Cyber recon against utility SCADA segment — Maritimes",
      region: "AO-EAST",
      coords: "Halifax sector",
      severity: "s1",
      ts: minsAgo(132),
      sources: [
        { kind: "sigint", ref: "CSE/CYB/77-A", caveat: "CAN ONLY", time: minsAgo(133) },
        { kind: "partner", ref: "PART/US-CISA/14", caveat: "REL FVEY", time: minsAgo(180) }
      ],
      ai: { proposedEntity: "ACTOR-HORIZON-3", confidence: 0.71, rationale: "TTP overlap with HORIZON-3 (8/12 indicators present). One indicator (C2 domain) is novel — flagged for adjudication.", modelVersion: "aegis-er-2.3.1" }
    }
  ];

  // ---------- Entities ----------
  const entities = [
    { id: "EX-IRBIS-04", kind: "person", label: "EX-IRBIS-04", subtitle: "Designated foreign collector, AO-NORTH",
      summary: "Probable designated collector operating under commercial cover in AO-NORTH since 2024-Q2. Three reports in past 30 days place subject within 50km of CFS Alert resupply corridor.",
      attrs: { "Alias(es)": "BORIS K., ALEXEI T.", "Last sighting": "21 MAY 26", "Citizenship": "Disputed", "Cover": "Geological survey contractor", "Risk": "Elevated" },
      reports: 47, links: 12, conf: 0.78 },
    { id: "ORG-LANDFALL-CONS", kind: "org", label: "LANDFALL CONSULTING LTD.", subtitle: "Shell entity, suspected typology T-04",
      summary: "Ontario-incorporated consultancy with no operating footprint. Used as routing layer in three transactions ≥ CAD $250k matching known typology.",
      attrs: { "Incorporated": "12 JAN 26", "Jurisdiction": "ON, Canada", "Directors": "2 (nominee)", "UBO chain": "TLL → LCA → ?", "Risk": "High" },
      reports: 8, links: 23, conf: 0.91 },
    { id: "CAMPAIGN-PETREL-3", kind: "campaign", label: "PETREL-3", subtitle: "Foreign-interference influence campaign",
      summary: "Persistent influence campaign targeting Canadian diaspora communities. Narrative re-template observed in past 24h.",
      attrs: { "First seen": "08 NOV 25", "Active accounts": "≈ 142", "Languages": "EN, FR, RU, ZH", "Attribution": "Provisional", "Risk": "Elevated" },
      reports: 31, links: 96, conf: 0.84 }
  ];

  // ---------- PIRs / Coverage (S3) ----------
  const pirs = [
    { id: "PIR-7",  title: "Foreign interference — federal election cycle 2026", queue: 24, capacity: 3, assigned: 2, depth: "over" },
    { id: "PIR-3",  title: "Threats to critical infrastructure — energy & water", queue: 12, capacity: 3, assigned: 3, depth: "fit" },
    { id: "PIR-1",  title: "Arctic sovereignty — state actor presence", queue: 7, capacity: 2, assigned: 2, depth: "fit" },
    { id: "PIR-12", title: "Maritime grey-zone activity — East Coast", queue: 18, capacity: 4, assigned: 2, depth: "over" },
    { id: "PIR-22", title: "Counter-narcotics — synthetic precursors", queue: 4, capacity: 2, assigned: 2, depth: "fit" },
    { id: "PIR-30", title: "Insider threat & personnel security", queue: 2, capacity: 1, assigned: 1, depth: "under" }
  ];

  const analysts = [
    { id: "AN-01", name: "M. Lefèvre",  initials: "ML", pir: "PIR-7",  load: 5, status: "active", clearance: "TS//SI", since: "08:00", note: "Anchor on FI/election", duplicateWith: null },
    { id: "AN-02", name: "K. Osei",     initials: "KO", pir: "PIR-7",  load: 4, status: "active", clearance: "TS//SI", since: "08:00", note: "", duplicateWith: "AN-03" },
    { id: "AN-03", name: "J. Tremblay", initials: "JT", pir: "PIR-12", load: 6, status: "active", clearance: "TS",     since: "08:00", note: "", duplicateWith: "AN-02" },
    { id: "AN-04", name: "S. Whitford", initials: "SW", pir: "PIR-12", load: 3, status: "active", clearance: "TS",     since: "08:00", note: "" },
    { id: "AN-05", name: "R. Iqbal",    initials: "RI", pir: "PIR-3",  load: 4, status: "active", clearance: "TS//SI", since: "08:00", note: "Liaison w/ NCSE" },
    { id: "AN-06", name: "D. Côté",     initials: "DC", pir: "PIR-3",  load: 5, status: "active", clearance: "TS",     since: "08:00", note: "" },
    { id: "AN-07", name: "L. Nakashima",initials: "LN", pir: "PIR-3",  load: 4, status: "active", clearance: "TS",     since: "08:00", note: "" },
    { id: "AN-08", name: "T. Bélanger", initials: "TB", pir: "PIR-1",  load: 4, status: "active", clearance: "TS//SI", since: "08:00", note: "" },
    { id: "AN-09", name: "P. Singh",    initials: "PS", pir: "PIR-1",  load: 3, status: "out",    clearance: "TS",     since: "—",     note: "Short-notice out — medical" },
    { id: "AN-10", name: "H. Vasquez",  initials: "HV", pir: "PIR-22", load: 2, status: "active", clearance: "TS",     since: "08:00", note: "" },
    { id: "AN-11", name: "G. Tanaka",   initials: "GT", pir: "PIR-22", load: 2, status: "active", clearance: "TS",     since: "08:00", note: "" },
    { id: "AN-12", name: "A. Morin",    initials: "AM", pir: "PIR-30", load: 3, status: "active", clearance: "TS//SI", since: "08:00", note: "" }
  ];

  // ---------- Assessment (S2 / S5) ----------
  const assessment = {
    id: "ASSESS-2026-0044",
    title: "Foreign interference indicator: PETREL-3 narrative shift, May 2026",
    author: "Margaux Lévesque",
    coAuthor: null,
    classification: "secret",
    caveats: ["REL FVEY", "ORCON"],
    due: "27 MAY 26, 1800Z",
    customer: "ADM(POL) / PCO IS",
    bluf: "PETREL-3 campaign re-templated its primary narrative on 24-25 MAY 26 to emphasise sovereignty grievance over economic grievance; coordination signatures match prior PETREL-3 surges with **high confidence**. Operational impact remains **moderate**; reach is concentrated and recovery of prior narrative is plausible within 14 days.",
    keyJudgements: [
      {
        id: "KJ-1", text: "PETREL-3 has shifted its primary narrative emphasis from economic grievance to sovereignty grievance over the 48 hours ending 1200Z 25 MAY 26.",
        confidence: "high",
        citations: ["OSI/MED/1102-B", "PART/UK-CFI/22", "OSI/MED/1099-C"],
        dissent: null
      },
      {
        id: "KJ-2", text: "The shift is coordinated, not organic. Synchronised posting across 14 anchor accounts (Δ < 6 min) and reuse of a known PETREL-3 template phrase pattern indicate central direction.",
        confidence: "high",
        citations: ["OSI/MED/1102-B", "AEG/PAT/3382"],
        dissent: { author: "K. Osei", text: "Two of 14 anchor accounts show prior independent activity inconsistent with central direction; rate of false-positive on cluster method is ≈ 8% per validation set 2025-Q4." }
      },
      {
        id: "KJ-3", text: "Operational impact is moderate. Estimated reach is ≈ 0.6M unique impressions in Canadian-relevant audiences within 24h of the shift — below the 1.2M threshold previously associated with measurable polling movement.",
        confidence: "moderate",
        citations: ["OSI/MED/1102-B", "PART/US-FBI-CI/09"],
        dissent: null
      },
      {
        id: "KJ-4", text: "Recovery to prior narrative is plausible within 14 days based on PETREL-3 historical cadence; we judge a return-to-baseline probability of 55–70% absent further intervention.",
        confidence: "moderate",
        citations: ["AEG/PAT/3382"],
        dissent: null
      }
    ],
    sources: [
      { ref: "OSI/MED/1102-B", kind: "osint",   title: "Synchronised post cluster, 14 anchor accounts, 24-25 MAY", date: "25 MAY 26", caveat: "REL FVEY",
        excerpt: "At 1148Z, accounts A1–A14 published variants of a single template phrase within a 5-min 47-sec window. Template hash matches PETREL-3 sample 2025-11-14.",
        classification: "secret" },
      { ref: "PART/UK-CFI/22", kind: "partner", title: "UK CFI weekly summary, week ending 24 MAY", date: "24 MAY 26", caveat: "REL FVEY, ORCON",
        excerpt: "PETREL-3 narrative beat shift assessed; emphasis on territorial framing rises 41% week-over-week.",
        classification: "secret" },
      { ref: "OSI/MED/1099-C", kind: "osint",   title: "Open-source media monitoring digest", date: "23 MAY 26", caveat: "—",
        excerpt: "Three Russian-language outlets independently amplify identical framing within 6h window.",
        classification: "protb" },
      { ref: "AEG/PAT/3382",   kind: "internal",title: "Pattern AEG/PAT/3382 — synchronised cluster", date: "21 MAY 26", caveat: "CAN ONLY",
        excerpt: "Detection: 14-account cluster, posting window Δ < 6 min, template match score 0.94.",
        classification: "secret" },
      { ref: "PART/US-FBI-CI/09", kind: "partner", title: "FBI CI brief — PETREL adjunct activity", date: "20 MAY 26", caveat: "REL FVEY",
        excerpt: "Adjunct infrastructure overlap with PETREL-3 hosting fingerprint observed in NoVA.",
        classification: "secret" }
    ],
    aiSuggestions: [
      { id: "AI-1", kind: "evidence", text: "Consider citing AEG/PAT/3375 — prior PETREL-3 cluster of similar Δ < 6 min pattern, weakens KJ-2 dissent.", source: "AEG/PAT/3375" },
      { id: "AI-2", kind: "tradecraft", text: "ICD 203 — 'high confidence' applied to KJ-2 may be over-stated; consider 'moderate to high' given dissent log.", source: null },
      { id: "AI-3", kind: "evidence", text: "Contradicting evidence available: OSI/REG/A-1102 documents one anchor account changed ownership 12 days ago — supports K. Osei's dissent.", source: "OSI/REG/A-1102" }
    ]
  };

  // ---------- DDIL sync (S4) ----------
  const ddil = {
    disconnectedFor: "3d 22h 47m",
    site: "FOB OUVERTURE",
    operator: "Capt. P. Singh",
    bandwidth: "256 kbps SATCOM (degraded)",
    lastSync: "22 MAY 2026, 1648Z",
    queue: [
      { id: "LCL-2026-441", kind: "indicator",  cls: "secret",   ttl: "—", title: "TF-DELTA — sensor placement, sector C", direction: "push", size: "112 KB", conflict: false },
      { id: "LCL-2026-440", kind: "assessment", cls: "secret",   ttl: "—", title: "Pattern of life, Compound 7", direction: "push", size: "1.2 MB", conflict: false },
      { id: "LCL-2026-439", kind: "entity",     cls: "protb",    ttl: "—", title: "New entity: VEH-WHITE-4101", direction: "push", size: "8 KB",  conflict: false },
      { id: "RMT-3322-A",   kind: "entity",     cls: "secret",   ttl: "—", title: "Update: EX-IRBIS-04 last sighting (home unit edit)", direction: "pull", size: "12 KB", conflict: true,
        conflictNote: "Local edit at 24 MAY 1102Z vs home-unit edit at 24 MAY 1418Z — both modified 'last sighting' field." },
      { id: "RMT-3322-B",   kind: "tasking",    cls: "secret",   ttl: "—", title: "Re-tasking — PIR-1 prioritisation",     direction: "pull", size: "4 KB",  conflict: false },
      { id: "LCL-2026-438", kind: "indicator",  cls: "secret",   ttl: "—", title: "TF-DELTA — patrol contact, sector B", direction: "push", size: "88 KB", conflict: false }
    ]
  };

  // ---------- Releasability (S6) ----------
  const release = {
    source: "ASSESS-2026-0044",
    target: "Five Eyes — UK DI, US ODNI, AU ASD, NZ NZSIS",
    operator: "Margaux Lévesque",
    coSign: "Devon McKay (Watch Supervisor)",
    redactions: [
      { id: "R-1", text: "OSI/MED/1102-B", reason: "Source reference may identify Canadian collection method; substitute with 'multiple open-source feeds'", action: "substitute", auto: true, accepted: null },
      { id: "R-2", text: "K. Osei", reason: "Analyst name — Canadian person", action: "redact", auto: true, accepted: null },
      { id: "R-3", text: "≈ 0.6M unique impressions in Canadian-relevant audiences", reason: "Disclosure-rounded — within FVEY release tolerances", action: "keep", auto: true, accepted: null },
      { id: "R-4", text: "AEG/PAT/3382", reason: "Internal pattern reference — substitute with method classification", action: "substitute", auto: true, accepted: null },
      { id: "R-5", text: "ADM(POL) / PCO IS", reason: "Customer identification — CAN ONLY", action: "redact", auto: true, accepted: null }
    ],
    irreducible: ["KJ-2 dissent retained — required for ICD 203 compliance; cannot be removed without invalidating assessment."]
  };

  // ---------- Geo / map (COP) ----------
  const geoPins = [
    { id: "IND-2026-0814", x: 0.78, y: 0.12, sev: "s2", label: "Unknown actor — Alert" },
    { id: "IND-2026-0813", x: 0.42, y: 0.58, sev: "s1", label: "LANDFALL — TOR/TLL" },
    { id: "IND-2026-0812", x: 0.62, y: 0.41, sev: "s2", label: "UAV track — Goose Bay" },
    { id: "IND-2026-0811", x: 0.18, y: 0.62, sev: "s2", label: "PETREL-3 — VAN/MTL" },
    { id: "IND-2026-0810", x: 0.71, y: 0.47, sev: "s3", label: "m/v Atlantic Heron" },
    { id: "IND-2026-0809", x: 0.69, y: 0.51, sev: "s1", label: "SCADA recon — Halifax" }
  ];

  // ---------- Roles ----------
  const roles = {
    margaux:  { id: "margaux",  name: "Margaux Lévesque",   title: "Strategic Analyst",       initials: "ML", clearance: "TS//SI" },
    devon:    { id: "devon",    name: "Devon McKay",        title: "Watch Floor Supervisor",  initials: "DM", clearance: "TS//SI" },
    marcus:   { id: "marcus",   name: "Marcus Beauchamp",   title: "Director, Mission Ops",   initials: "MB", clearance: "TS//SI" }
  };

  return { NOW, fmtZulu, minsAgo, indicators, entities, pirs, analysts, assessment, ddil, release, geoPins, roles };
})();
