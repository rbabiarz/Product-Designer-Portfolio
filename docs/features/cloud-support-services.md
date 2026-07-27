# Cloud Support & Services — The Back Room Behind the Lights

**User:** a recruiter or design leader who has never installed a light fitting, reading to find out
whether this designer can hold a safety-critical back-office product together — and, secondarily,
anyone who wants to see what the *staff* side of a hardware business actually looks like.

**Thesis:** three unrelated jobs sit behind one navigation rail — handing out equipment software,
keeping 414 customer accounts straight, and unlocking a control box nobody can reach — and what stops
that becoming three products wearing the same header is not a palette. It is four habits: meaning is
written rather than colored, a refusal always comes with a way forward, anything permanent leaves a
receipt, and every screen is built to be described over a phone.

**What the page proves:** that the load-bearing design work in an internal tool is in the sentences.
The approval gate is one line of plain text instead of hidden files, and that single decision sets the
pattern every other message on the site copies. The building-transfer flow is a tab rather than a
pop-up, with an uneditable log of who moved what and when, and its "include members" box ships
unchecked because the two possible mistakes are not equally recoverable. The reset flow is the
centerpiece: a control box with no internet asks a ten-character question, a support person on a call
computes the answer in the portal, and neither party can finish alone — security that lives in the
shape of the arrangement, with the design work almost entirely about reading characters aloud without
being misheard.

**Source:** Figma *Cloud v7.1* (`xlEjdZxkJsr1q2viJqHraW`), Desktop section, 46 visible 1440×1024
screens across four feature areas. Eleven exported into `spotstudios/assets/cloud/`.

## Scope

| Area | Covered | How |
|---|---|---|
| Equipment software | Yes | Two-question filter, latest vs. history, the file fingerprint, the publishing form |
| Customer organizations | Yes | 414-row list with three ways in, the empty state, customer → building → room, five tabs |
| People and access | Yes | Admins/Members split, role spelled out per row, email as the first column |
| Messages | Partly | The message layer only — see non-goals |
| Security | Yes | Challenge/response reset, four steps, both ends of the phone call |

## Non-goals

- **The Notifications module.** The rail item and a snackbar component exist in the Figma file; the
  screens behind that rail do not. Section 10 says so in the page itself rather than inventing them.
- **Business outcomes.** No adoption, time-saved, or ticket-volume metrics — none are available. Every
  number on the page is observable in the design (414 accounts, 14 a page, 3 attempts, 5 areas, 5 tabs).
- **Team composition.** Omitted rather than estimated; the facts strip carries role, company, product,
  audience, platform, and scope instead.
- **The mobile portal.** Two phone screens exist in the Figma file, too few to make a claim from.

## States present

Empty (`← Choose an Organization`, and the deliberately blank right two-thirds) · locked (padlocked
rooms) · restricted (the approval gate) · error with attempts remaining (two tries left) · connection
failure with a reference code · planned downtime · optional-vs-required form fields · collapsed history
· permanent audit log.

## Bar met

Plain English throughout (grade 7.9 / ease 71.0; zero whole-word hits across 60+ technical terms in
body copy) · axe-core clean at five viewports and 400% zoom · visible focus on all 9 stops, all
≥ 24×24 · scroll containers keyboard-reachable · no motion under `prefers-reduced-motion` · meaning
never on hue alone · every nontrivial decision paired with the alternative it beat (pop-up vs. tab,
checked vs. unchecked default, hiding files vs. stating the rule).
