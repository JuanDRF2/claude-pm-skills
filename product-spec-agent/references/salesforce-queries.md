# Salesforce Queries — Business Case Data Pull

This is the canonical reference for pulling business case data from Salesforce. The patterns below are the only approved way to compute the business case for a Product Spec. Do not improvise.

## The six fields that matter

These are the only Case fields the skill uses for the business case. All other fields (Type, Subject, Description, Status, Main_Feature__c, Case_Subcategory__c, etc.) are out of scope.

**Matching fields** — used to identify which cases relate to the feature being specced:

1. **`Product_Tag__c`** — reference to the Product Tag object. Maps to the PM's mental model of "Product" (e.g., Membership Management, Shop, Accounting, Payments).
2. **`Product_Feature__c`** — reference to the Product Feature object. The specific feature within the product (e.g., "Digital Membership Cards Management").
3. **`Job_to_be_Done__c`** — reference to the Program object. Optional refinement when filtering by a specific JTBD.

**Breakdown / filter fields** — used to characterize the matched cases:

4. **`Request_Category__c`** — picklist. Used to exclude Implementation Cases AND to group cases by category in the business case output.
5. **`Case_Priority__c`** — picklist. Strategic priority of the case ("1. Compliance…", "2. Strategic Growth…", "3. Feature Parity…", "4. Custom Delight…", "5. Not Applicable").
6. **`Case_Severity__c`** — picklist. Impact severity of the case (Business Stopping / Critical / High / Medium / Low).

## Step 1 — Resolve the PM's plain-English answers to SF records

The PM gives you "Product: Membership", "Feature: Digital Membership Cards". You must resolve these to the actual SF record IDs before you can query Cases.

### Resolve Product Tag

```
objectName: "agf__ADM_Product_Tag__c"
selectFields: ["Id", "Name"]
whereClause: "Name LIKE '%<PM's product term>%'"
limit: 10
```

Show the matches to the PM. If multiple matches, ask which one (or which ones) to include. If one match, confirm it.

### Resolve Product Feature

```
objectName: "Product_Feature__c"
selectFields: ["Id", "Name", "Product_Tag__r.Name", "Status__c", "Deprecated__c"]
whereClause: "Name LIKE '%<PM's feature term>%' AND Product_Tag__c = '<Product Tag ID from above>' AND Deprecated__c = false"
limit: 20
```

**Expect multiple matches.** Most features map to 2+ Product Feature records.

**Then pull per-feature case counts in a single query** so the PM can see weighted scope before deciding:

```
objectName: "Case"
selectFields: ["Product_Feature__c", "Product_Feature__r.Name", "COUNT(Id) case_count", "COUNT_DISTINCT(AccountId) accounts"]
groupByFields: ["Product_Feature__c", "Product_Feature__r.Name"]
whereClause: "Product_Feature__c IN (<all matched IDs>)
  AND CreatedDate = LAST_N_YEARS:3
  AND (Request_Category__c != 'Implementation Cases' OR Request_Category__c = null)"
orderBy: "COUNT(Id) DESC"
```

**Present matches to the PM with case weight, like this:**

| # | Product Feature | Product Tag | Status | Cases (3y) | Accounts |
|---|---|---|---|---|---|
| 1 | Digital Membership Cards Management | Membership Management | Completed | 220 | 65 |
| 2 | Digital Membership Cards for Membership Programs | Membership Management | Completed | 95 | 32 |
| 3 | Digital Membership Cards Setup/Customization | Membership Management | Completed | 30 | 18 |

**Flag scope divergence.** If matches span multiple Product Tags, state it explicitly:

> "These matches span 3 Product Tags (Accounting, Billing, Payments). That's a strong signal the spec scope needs to be narrower than all matches — these are likely different initiatives owned by different domain teams."

**Mandatory PM confirmation.** Never default to "include all." Always ask explicitly, with the table above visible. Acceptable PM answers:

- "Include all"
- "Just #1 and #2"
- "Describe the spec scope and recommend" — let the PM say "I'm only building the issuance flow" and you respond with the subset that fits
- "Add features I didn't find" — accept ad-hoc Product Feature IDs the PM names

If zero matches were found, **do not proceed without resolving this.** Follow the zero-match recovery flow below — the spec cannot continue with no Product Feature record.

If the PM picks a subset, restate the locked scope back to them ("Including #1, #2. Excluded: #3.") before moving to the main business case queries.

#### Zero-match recovery — Product Feature creation required

When the Product Feature lookup returns no matches, the feature is net-new and does not yet exist in the Product Feature taxonomy. Examples: Email Engine, Bug Killer Machine, any V2-native infrastructure that's never been client-requested because it didn't exist to request.

**The skill must not produce a spec without a Product Feature record.** Future case tagging, JTBD linkage, business case queries across the org, and Architecture Guild visibility all depend on the Product Feature existing in SF. Skipping this means the spec is orphan data the moment it ships.

Mirror the JTBD creation flow:

1. Tell the PM directly: "No Product Feature matches '<term>'. This is a net-new feature. The spec cannot proceed without a Product Feature record in Salesforce. I'll draft the record; you create it in SF and paste the new record ID back."

2. **Describe `Product_Feature__c`** on first run of this flow to get current required fields (the org may add fields over time; never hardcode the field list).

3. Draft the new Product Feature record for the PM, pre-filling what you know:
    - **Name** — derived from the PM's feature term, sharpened to action+object form (e.g., "Email Engine" → consider "V2 Email Delivery Engine" if the PM agrees)
    - **Product Tag** — confirmed in the earlier Product Tag resolution step
    - **Status** — set to whatever the company uses for "Planning" or "Pre-development" (describe Status__c picklist to find the right initial value)
    - **Deprecated** — false
    - **Description** — one-paragraph summary derived from the PM's Round 1 answers
    - Other required fields surfaced by the object describe call

4. **Before the PM creates it,** warn about the same three risks as JTBD creation:
   - **Duplicate.** Run a wider fuzzy search across all non-deprecated Product Features. If similar names exist, list them.
   - **Bad name.** Same rule: actionable, specific, concise (<60 chars), generic where appropriate.
   - **Wrong Product Tag.** If the feature concept could plausibly belong to a different Product Tag, flag it.

5. PM creates the record in SF, pastes back the new record ID. Skill verifies the ID exists and proceeds.

6. **Note in the business case method statement** that the matched Product Feature was just created and contains no prior cases. The case queries will return zero counts — this is expected, not an error. The strategic rationale for building the feature lives in the Problem & Why Now section, not in case-volume signal.

This flow accepts that some specs will have empty business case tables. That's correct for net-new features. The skill does not fabricate signal; it accurately reflects that prior-case data does not exist, while ensuring the new Product Feature record is in place for all future specs and case tagging to reference.

### Resolve Jobs to be Done

**JTBD resolution is mandatory for every spec, for every PM-stated JTBD.** The skill is a JTBD taxonomy auditor: each PM-stated JTBD must either map to an existing `agf__PPM_Program__c` record or trigger creation of a new one. There is no "leave unresolved" path. Empty business case for an unresolved JTBD silently misleads future specs.

The skill **does not write to Salesforce.** When a new JTBD is needed, the skill drafts the record content for the PM to create manually, then asks the PM to paste back the new record ID.

#### Step 1 — Fuzzy match each PM-stated JTBD

For each JTBD the PM provided in Round 1 (typically 2–6 JTBDs):

1. Extract the core action from the "As a [role], I want [goal] so that [outcome]" phrasing. The matchable concept is the goal — verb + object.
2. Query `agf__PPM_Program__c` with `Name LIKE '%<keyword>%'` on the 2–3 most distinctive nouns/verbs.
3. Rank matches by name overlap. Limit 10.

```
objectName: "agf__PPM_Program__c"
selectFields: ["Id", "Name"]
whereClause: "Name LIKE '%<keyword 1>%' OR Name LIKE '%<keyword 2>%' OR Name LIKE '%<keyword 3>%'"
limit: 10
```

#### Step 2 — Classify each result and present to the PM

**Likely match (1 high-overlap result):**

> For *"As a member, I want to access my membership benefits without carrying a physical card"*, closest JTBD: **Member Benefit Access** (12 cases, 8 accounts on the matched Product Features). Use this, or show me more?

PM confirms or asks for the wider list.

**Ambiguous (multiple matches):**

> For *"As a member, I want all my digital cards in one place via portal login"*, found multiple matches:
> 1. Portal Authentication (5 cases)
> 2. Digital Membership Identification (3 cases)
> 3. Member Self-Service (8 cases)
>
> Which one? Or none of these — should we create a new one?

PM picks one or escalates to "create new."

**No match:**

> For *"As a Membership Manager, I want to send an email so members can download cards to their wallets"*, no matching JTBD found in Salesforce.
>
> Two options — you must pick one:
> 1. **Use closest existing match** — I can broaden the search if you want.
> 2. **Create new JTBD in Salesforce** — I'll draft the record content; you create it in SF and paste me the new ID.
>
> No third option. Leaving a JTBD unresolved silently breaks future spec analysis.

#### Step 3 — When the PM picks "Create new JTBD"

Before drafting the new record, run three checks and warn the PM about any that fire.

**Check A — Duplicate warning.** Run a wider fuzzy search across all existing JTBDs (synonyms, partial overlaps, common typos). If the proposed JTBD has any similar-but-not-matched neighbors, list them:

> Before creating, I want to flag a possible duplicate. These existing JTBDs are similar but didn't match the primary search:
> - Wallet Pass Distribution
> - Membership Card Email
>
> Is your JTBD genuinely distinct, or should we use one of these? (Duplicate JTBDs are managed by product leadership outside the skill — if this creates a duplicate, it'll get cleaned up later.)

**Check B — Bad name warning.** A good JTBD record name is:
- Actionable (has a verb)
- Specific (names the object and context)
- Concise (<60 chars)
- Generic where appropriate (not tied to a specific UI or implementation)

If the proposed JTBD name fails any check, warn:

> The proposed name *"Card works for members"* is too vague — it doesn't name the action or context. Suggested rewrite: *"Issue Digital Membership Card via Portal"*. You can override, but generic action names produce better case-tagging downstream.

**Check C — Cross-product warning.** If the JTBD's core concept likely applies to multiple Product Tags (e.g., "Receive Email Confirmation" applies to Membership + Scheduling + Payments), warn:

> This JTBD looks like it spans multiple products — *"Receive Email Confirmation"* applies to membership purchases, ticket purchases, donations, and gift card purchases. That's likely a cross-product JTBD. Product leadership manages cross-product JTBD scoping outside this skill, but flagging so leadership can review.

After warnings, present the draft record for the PM to create in Salesforce:

> Here's the JTBD record to create in Salesforce. After you create it, paste back the new record ID and I'll continue:
>
> - **Name:** Issue Digital Membership Card via Portal
> - **Description:** [PM-provided context, e.g., "Members access their active membership cards via the portal and add them to Apple Wallet or Google Wallet."]
> - [Other required `agf__PPM_Program__c` fields determined by describing the object on first run]

#### Step 4 — Lock the JTBD IDs

Once all PM-stated JTBDs are resolved (either existing or newly created), restate them back to the PM:

> Locked JTBDs for this spec:
> 1. Member Benefit Access (existing — a0X...)
> 2. Portal Self-Service (existing — a0X...)
> 3. Issue Digital Membership Card via Portal (new — a0X..., created by PM)
>
> Proceeding to Checkpoint 1 confirmation.

These IDs are stored for the rest of the spec session. JTBDs appear in the spec's "Users & Jobs to be Done" section both as the PM's original "As a [role]…" phrasing *and* with a reference to the formal JTBD record name. This keeps the spec readable while preserving taxonomy linkage.

#### Optional — JTBD-level business case filtering

After scope is locked, if the PM wants to see business case breakdown by JTBD (which subset of the pain belongs to which JTBD), run:

```
objectName: "Case"
selectFields: ["Job_to_be_Done__c", "Job_to_be_Done__r.Name", "COUNT(Id) case_count", "COUNT_DISTINCT(AccountId) accounts"]
groupByFields: ["Job_to_be_Done__c", "Job_to_be_Done__r.Name"]
whereClause: "Product_Feature__c IN (<locked PF IDs>)
  AND Job_to_be_Done__c IN (<locked JTBD IDs>)
  AND CreatedDate = LAST_N_YEARS:3
  AND (Request_Category__c != 'Implementation Cases' OR Request_Category__c = null)"
orderBy: "COUNT(Id) DESC"
```

This is opt-in (PM asks for it), not default. JTBD fill rate on Case records varies; PMs should treat sparse JTBD breakdowns as directional, not definitive.

## Step 2 — The mandatory exclusion

**ALWAYS include `(Request_Category__c != 'Implementation Cases' OR Request_Category__c = null)` in the WHERE clause.** Implementation Cases are internal labor cost (the internal implementation team configuring things for clients), not client demand signal.

Note: ~91% of cases have null `Request_Category__c`. The null bucket may include some implementation cases that weren't formally tagged. This is acceptable noise — the alternative (using `Type`) was rejected because Type is not in the approved field set.

## Step 3 — The aggregation queries

Use `salesforce_aggregate_query` (not `run_soql` — aggregate is cleaner for business case math).

### Query A — Cases by Request Category (the headline table)

```
objectName: "Case"
selectFields: [
  "Request_Category__c",
  "COUNT(Id) case_count",
  "COUNT_DISTINCT(AccountId) accounts"
]
groupByFields: ["Request_Category__c"]
whereClause: "Product_Feature__c IN (<comma-separated PF IDs>)
  AND CreatedDate = LAST_N_YEARS:3
  AND (Request_Category__c != 'Implementation Cases' OR Request_Category__c = null)"
orderBy: "COUNT(Id) DESC"
```

The headline table will likely show "null" as the largest bucket — this is expected. The non-null categories are the diagnostic signal (e.g., "15 New Feature Requests across 14 accounts").

### Query B — Cases by Case Priority

```
objectName: "Case"
selectFields: [
  "Case_Priority__c",
  "COUNT(Id) case_count",
  "COUNT_DISTINCT(AccountId) accounts"
]
groupByFields: ["Case_Priority__c"]
whereClause: "<same as Query A>"
orderBy: "COUNT(Id) DESC"
```

This breakdown tells you the strategic shape of the pain — "are these compliance-driven, strategic growth, feature parity, or custom delight cases?"

### Query C — Cases by Severity

```
objectName: "Case"
selectFields: [
  "Case_Severity__c",
  "COUNT(Id) case_count",
  "COUNT_DISTINCT(AccountId) accounts"
]
groupByFields: ["Case_Severity__c"]
whereClause: "<same as Query A>"
orderBy: "COUNT(Id) DESC"
```

This breakdown tells you the impact shape — how many are Business Stopping or Critical vs. Medium/Low.

### Query D — Distinct accounts with their ARR (for deduplication)

```
objectName: "Case"
selectFields: ["AccountId", "MAX(ARR__c) account_arr"]
groupByFields: ["AccountId"]
whereClause: "<same as Query A> AND AccountId != null"
limit: 200
```

Sum the `account_arr` column from this result to get deduplicated business case ARR. **Do NOT sum case-level ARR — that double-counts** because the same account appears on many cases.

### Query E — Top concentration (for color)

```
objectName: "Case"
selectFields: ["AccountId", "COUNT(Id) case_count", "MAX(ARR__c) account_arr"]
groupByFields: ["AccountId"]
whereClause: "<same as Query A> AND AccountId != null"
orderBy: "COUNT(Id) DESC"
limit: 5
```

Tells you whether the pain is concentrated (one or two accounts driving most cases) or distributed broadly.

## Step 4 — Compose the business case section

Present in this order:

1. **Method statement** — describe the query: which Product Tag, which Product Feature record IDs were matched, time window (3 years), Implementation Cases excluded via `Request_Category__c != 'Implementation Cases'`.

2. **Cases by Request Category table** (Query A) — **always included.** The headline. Acknowledge the null bucket as expected when it's the largest.

3. **Cases by Case Priority** (Query B) — **conditional.** Include only if the data has meaningful spread. Rule: if one Case Priority bucket holds 80% or more of the cases, drop the table and add a one-line note explaining why (e.g., "*Case Priority breakdown skipped — 87% of cases are tagged 'Strategic Growth'; no meaningful spread.*"). When included, this reveals the strategic shape of the pain.

4. **Cases by Severity** (Query C) — **conditional.** Same 80% rule. When one Severity bucket holds 80%+, drop and note (e.g., "*Severity breakdown skipped — 84% of cases are tagged 'Medium'; no meaningful spread.*"). When included, this reveals the impact shape.

5. **Deduplicated ARR exposure** (Query D) — total ARR across distinct accounts, and that figure as a % of the company's ~$[YOUR_ARR]M total.

6. **Top concentration** (Query E) — top 1 account by case count, top 5 by case count combined.

7. **Data caveat** — one sentence: "Request_Category, Case Priority, and Severity have varying fill rates across the case base; figures are based on matched Product_Feature__c records and exclude Implementation Cases."

### Why the 80% threshold for conditional breakdowns

A breakdown table with one bucket dominating is noise, not signal — it lengthens the spec without adding insight. The 80% rule is a fast judgment call: if it fires, the skill notes the dominant bucket inline and moves on. PMs can still see the underlying distribution by asking for it explicitly during Checkpoint 2.

If both Case Priority and Severity get dropped, the spec is still complete — Request Category and the ARR/concentration data carry the business case.

## Notes on multi-feature matching

Multi-match is the common case, not the exception. Examples from the Product Feature taxonomy:

- "Digital Membership Cards" → 3 matches, all under Membership Management (scope-equivalent)
- "Refunds" → 5+ matches across Accounting, Billing, and Payments (scope-divergent — different initiatives)
- "Gift Cards" → 7+ matches across Storefront, Accounting, Payments (scope-divergent)
- "Membership Sales" → 5 matches across POS / Online / Console / Renewals / Upgrades (channel-divergent)
- "Events" → 8+ matches across sales / config / reports / membership-tied events (scope-divergent within one Product Tag)

The scoping decision matters because it changes the business case ARR and the affected domain teams. Auto-including all matches in any of the divergent cases above produces meaningless numbers.

**Therefore: explicit PM confirmation is mandatory on every spec, even when matches look scope-equivalent.** No defaults. The PM either says "include all" or names a subset. The 10-second exchange forces deliberate scope choice and makes Checkpoint 1 a real gate, not a rubber stamp.

When matches span multiple Product Tags, call it out explicitly — that's a strong signal the spec scope needs to narrow.
