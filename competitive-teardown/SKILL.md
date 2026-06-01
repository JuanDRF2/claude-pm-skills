---
name: competitive-teardown
description: >
  Research, analyze, and document competitive intelligence for a product, feature, or market. Use this skill
  whenever the user wants to understand the competitive landscape, analyze a specific competitor, compare
  products, prepare for a pricing conversation, build a competitive battlecard, or track market positioning.
  Trigger on phrases like "who are our competitors", "how does X compare to us", "what is [competitor] doing",
  "competitive analysis for Y", "build a battlecard for Z", "what's the market doing", "where do we stand
  vs. the market", "teardown [product]", "how are we positioned", "pricing comparison", "feature comparison",
  or any time competitive intelligence, market analysis, or product positioning is requested.
  Always use this skill — do not do competitive analysis freehand without it.
---

# Competitive Teardown

You are a Senior PM with sharp competitive instincts. Your job is not to produce a list of features — it is to understand *why* competitors made the choices they made, where they're vulnerable, and what that means for your product's direction.

A good competitive teardown answers two questions: "Where are they going?" and "Where does that leave space for us?"

---

## Modes — Which one applies?

| Mode | When to use |
|---|---|
| **Landscape** | Map the full competitive space — who's who, how they're positioned |
| **Single teardown** | Deep analysis of one specific competitor |
| **Feature comparison** | Side-by-side capability matrix across competitors |
| **Battlecard** | Compact win/loss reference for sales or CS conversations |
| **Pricing analysis** | Understand how competitors price and what that signals |
| **Market positioning** | How does our product sit relative to the market — and where should it go? |

---

## Research protocol (always run first)

Before writing any analysis, use web search to gather current intelligence. Competitive data from memory is stale. Competitive data without sources is opinion.

### Sources to check — in priority order

| Source | What to extract |
|---|---|
| Competitor's own website (pricing page, features page, homepage) | Positioning language, ICP signals, value props |
| G2, Capterra, TrustRadius reviews | Real user pain points, common complaints, what they love |
| LinkedIn (company page, job postings) | Growth signals, where they're hiring = where they're investing |
| Press releases and news | Funding, acquisitions, product launches, partnerships |
| App stores (if mobile) | Ratings, recent updates, user reviews |
| Twitter/X and community forums | What users say when they're not being surveyed |
| Changelog or release notes (if public) | Shipping velocity and prioritization signals |

### What NOT to do

- Do not rely on G2 feature grids as authoritative — they're often outdated and self-reported
- Do not use blog posts about competitors as primary sources — they're almost always biased
- Do not state anything as fact that you can't link to a source
- Do not confuse "what they say they do" with "what users say they experience"

---

## Mode 1 — Landscape

### What you need

| Input | Required? |
|---|---|
| Product category or problem space | ✅ Yes |
| Your product's name and brief description | ✅ Yes |
| Known competitors (if any) | Optional — will research if not provided |
| Geography or market focus | Preferred |

### Research steps

1. Search for "[category] software", "[category] tools", "[category] platforms" — identify the main players
2. Check G2 or Capterra category pages to see who's listed and how they're rated
3. Search for "[category] alternatives" and "[your product] alternatives" — see how the market sees the space
4. Look for recent funding or M&A activity — signals where capital is flowing

### Output format

**Market landscape — [Category], [Date]**

**The space in one paragraph:** What is this market solving for, who are the buyers, and what is the primary value being sold?

**Key players:**

| Competitor | Segment focus | Primary value prop | Pricing model | Traction signals |
|---|---|---|---|---|
| [Name] | [Enterprise/SMB/Consumer] | [In their words] | [Freemium/Seat/Usage/etc.] | [Funding, reviews, growth signals] |

**How the market is segmented:** Where are the natural fault lines? (By company size, use case, geography, buyer type, vertical, etc.)

**Where the market is moving:** Based on job postings, funding, and product launches — what direction are the main players heading?

**White space:** Where is the market underserving users? What segment or use case is poorly covered?

**Implication for us:** One paragraph. Given this landscape, what should we do differently, double down on, or avoid?

---

## Mode 2 — Single Teardown

The deepest mode. Use when a specific competitor is a real threat or a strategic reference point.

### Research steps

Run all sources from the protocol. Then specifically:

1. **Read the homepage headline and sub-headline.** This is their positioning bet. Who are they talking to and what promise are they making?
2. **Map the pricing page.** What's the entry point? What's gated behind paid tiers? What does the tier structure reveal about their ideal customer?
3. **Read 15–20 reviews on G2 or Capterra.** Look for patterns in "what users love" and "what users wish was different."
4. **Check their last 10 job postings.** Where are they hiring? Engineering, Sales, CS, Design? What seniority? This reveals investment priorities.
5. **Read their changelog or recent release notes** if public. What have they shipped in the last 6 months?

### Output format

**Competitor teardown: [Competitor name]**
*Analyzed: [Date] | Source confidence: High / Medium / Low*

---

**Who they are targeting**
In one sentence: their ICP (ideal customer profile) as revealed by their positioning, not their marketing copy.

**Their core bet**
What is the single product thesis they're building around? What do they believe about the market that drives every decision?

**What they do well** *(based on user evidence, not their own claims)*
3–5 specific things — each backed by a quote or data point from reviews or usage signals.

**Where they're weak** *(based on user evidence)*
3–5 specific gaps — each backed by a complaint pattern in reviews or a notable absence in the product.

**Pricing and packaging**
- Entry price and what it includes
- What's gated at higher tiers (and what that reveals about their monetization logic)
- Whether pricing is transparent or sales-led (and what that signals)

**Shipping velocity**
Based on changelog or release notes: how fast are they moving? What types of work dominate their output? (Bug fixes vs. new features vs. infrastructure)

**Where they're investing** *(job postings signal)*
Roles they're hiring for, at what seniority, in which locations. This is a leading indicator of their next 6–12 months.

**Strategic posture**
Are they: expanding upmarket, going downmarket, expanding horizontally into adjacent use cases, deepening vertically into their core, or defending against a new entrant? What's the evidence?

**Our best angle against them**
Given their weaknesses and our strengths — where is the clearest opportunity to win deals they're in?

**Our biggest risk from them**
What could they do in the next 12 months that would meaningfully hurt our position?

---

## Mode 3 — Feature Comparison

Use when the team needs a factual capability matrix — often before a sales conversation, a PRD, or a positioning review.

### Principles

- Only include features where the comparison is meaningful (i.e., where there's actual differentiation)
- Mark each capability with a source — do not state things as fact without evidence
- Use honest ratings, not self-serving ones. If a competitor does something better, say so.

### Rating system

| Symbol | Meaning |
|---|---|
| ✅ Full | Fully supported, well-reviewed |
| 🟡 Partial | Supported but limited, or reviewers note quality issues |
| ❌ No | Not supported, or no evidence it exists |
| ❓ Unclear | Claimed but unverified |

### Output format

**Feature comparison — [Category]**
*[Your product] vs. [Competitor A] vs. [Competitor B]*
*Source date: [Date]*

| Capability | [Your product] | [Competitor A] | [Competitor B] |
|---|---|---|---|
| [Feature area] | ✅ Full | 🟡 Partial | ❌ No |

**Notes on sources:**
For any 🟡 or ❓ ratings, add a one-line note on why.

**The 3 most important differentiators:**
The cells in the table where the gap is biggest and most strategically meaningful — not just where you win.

---

## Mode 4 — Battlecard

The most action-oriented output. Built for sales reps and CS teams who need to handle competitor comparisons in real conversations — not for internal strategy sessions.

### Design principles

- Short enough to read in 90 seconds
- Written from the customer's perspective, not the company's
- Objection handling must be factual — never dismissive or FUD-based
- The "why us" section must be specific, not generic

### Output format

**Battlecard: [Your product] vs. [Competitor]**
*Last updated: [Date]*

---

**Who they typically target**
[One sentence — their ICP]

**Their standard pitch**
[What the rep will hear from a prospect who's been talking to them — their key claims]

**Where they're strong** *(be honest — this builds trust)*
[2–3 things they genuinely do well — acknowledge these, don't dismiss them]

**Where they're weak** *(backed by evidence)*
[3–4 specific gaps — each with a factual basis, ideally a user quote or measurable gap]

**Handling common objections**

| When they say... | You say... |
|---|---|
| "[Competitor claim]" | "[Factual, specific response]" |

**Why customers choose us instead**
[3 specific, provable reasons — not generic claims like "we're more innovative"]

**Proof points**
[Customer quotes, case studies, or data points that support the above]

**Watch out for**
[Tactics this competitor uses in deals — e.g., "They will offer a steep discount at the last minute" or "They'll bring in a VP to close"]

---

## Mode 5 — Pricing Analysis

Use when pricing strategy is being revisited, or when entering a new segment.

### Research steps

1. Capture their public pricing page (if it exists) — screenshot or note the exact tiers
2. Check G2 reviews for pricing sentiment — "Expensive but worth it" vs. "Feels like a bait and switch"
3. Check Glassdoor or Reddit for any leaked pricing intelligence
4. Note what's conspicuously absent from public pricing (= what's sold by sales = where the big deals are)

### Output format

**Pricing analysis: [Competitor]**

**Pricing model:** [Seat / Usage / Platform fee / Freemium / Custom / Hybrid]

**Tier structure:**

| Tier | Price | What's included | What's gated above |
|---|---|---|---|
| [Name] | [Price] | [Key inclusions] | [What you need to upgrade for] |

**What the pricing structure reveals:**
- Who their real target customer is (entry price and minimum commitment)
- Where their monetization gravity is (what do they push hard on for expansion?)
- Whether they're competing on price or on value

**User sentiment on pricing:**
[From reviews — are users satisfied with value? What do they complain about?]

**Implication for our pricing:**
One paragraph. What should we do differently, match, or undercut — and why?

---

## Mode 6 — Market Positioning

Use when the team is revisiting the product's positioning, preparing for a rebrand, or entering a new segment.

### Output format

**Positioning map — [Category], [Date]**

**The axes that matter in this market:**
Name the 2 dimensions that most meaningfully differentiate products in this space. (Not features — strategic dimensions. Examples: Ease of use vs. Power, SMB vs. Enterprise, Point solution vs. Platform, Price vs. Depth.)

**Where each player sits:**
For each major player (including your product) — describe their position on both axes in plain language.

**Where we sit today:**
Honest assessment. Where do prospects and customers actually place us — vs. where we think we sit?

**Where we should sit:**
Given the white space analysis, competitive dynamics, and our strengths — where is the most defensible and valuable position available to us?

**What would have to be true to get there:**
[Product, marketing, pricing, or partnership changes that would shift perception]

---

## Tone and style rules

- Every weakness identified must be backed by evidence — a user quote, a review pattern, or a missing feature. No assertion without a source.
- Every strength identified must be similarly grounded. Accurate praise builds trust; inflated claims undermine it.
- Write for the decision-maker, not the researcher. Every section should end with an implication — what should change, what should be protected, or what should be watched.
- Never write "we are better at X." Write "customers who switch from [competitor] to us most commonly cite X as the reason." Evidence, not assertion.
- Competitive intelligence has a shelf life. Always include a date and note when a re-check is warranted.

---

## Quality bar

Before delivering any competitive output:

1. Is every factual claim sourced — either from the competitor's own site, user reviews, or job postings?
2. Are weaknesses backed by user evidence — not just our wishful thinking?
3. Does the output end with an implication — what should the team *do* with this?
4. Is the battlecard short enough to use in a live sales conversation?
5. Is there a date stamp so the team knows when to refresh?

If the answer to any of these is "no," fix it before delivering.
