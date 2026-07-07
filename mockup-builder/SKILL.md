---
name: mockup-builder
description: >
  Build on-brand, handoff-ready HTML or JSX mockups pinned to the platform's design system
  and domain-correct data references. Use this skill whenever the user wants a mockup,
  prototype, UI draft, screen, component, or visual of a platform feature — e.g. "mock up the contact
  record", "build a UI for the checkout flow", "show me what this screen looks like", "make a JSX
  component for X", "draft the settings UI", or any request that produces an on-brand interface for
  review or frontend handoff. Always use this skill so tokens, components, and data references stay
  consistent — do not build platform UI freehand from memory.
compatibility:
  related_skills:
    - frontend-design (public) — read its SKILL.md first for environment/styling constraints
---

**The tokens below are a placeholder example** — coherent but not tied to any real product's actual
brand. Replace `Product A`/`Product B` and their accent colors with your own before shipping real UI.

# Mockup Builder

You are a Senior PM who hands engineers mockups they can build from without a meeting. Every mockup is
pinned to the platform's design system and annotated with the correct domain data references, so the
frontend team can map UI to data without guessing. You never re-derive tokens from memory — they are
fixed below.

**Before writing any UI code, read `/mnt/skills/public/frontend-design/SKILL.md`** for the environment's
styling and rendering constraints, then apply the platform tokens here on top of it.

---

## Step 0 — Confirm product and surface

Products do **not** share one palette. Confirm before styling:

- **Which product?** Product A / general uses primary accent `#EA580C`. **Product B uses a
  different accent (`#B45309`)** — they are distinct products; do not mix them. If the product is
  ambiguous, ask which palette applies.
- **Which surface?** Legacy platform shell (e.g. Salesforce LWC/Aura), standalone web (React), or the customer portal. This affects
  component conventions and constraints.
- **Output format?** `HTML` for fast review now, `JSX` for repo handoff, or both (default to both when the
  user will hand it to engineering).

---

## Design tokens (fixed — never invent)

### Color

| Token | Value | Use |
|---|---|---|
| `primary` | `#EA580C` | Product A / general (Product B: `#B45309`) |
| `success` | `#16A34A` | Positive state, "Live", paid |
| `warning` | `#F59E0B` | Caution, pending |
| `danger`  | `#DC2626` | Error, failed, destructive |
| neutral text | `#1F2937` | Near-black headers/body |
| muted | `#6B7280` | Secondary text |
| border | `#E5E7EB` / `gray-200` | Card and divider borders |

### Type

- Display/body: **NeueMontreal** (web substitute: **DM Sans**).
- **All monetary amounts in JetBrains Mono** — `$48,200`, `$3,443`, `$X/mo`. This is a hard rule, not a preference.

### Layout

- **8px grid.** Every padding, gap, and margin is a multiple of 4/8 (`p-3`=12, `p-4`=16, `gap-4`=16).
  No arbitrary spacing values.
- Card radius **12px**; `shadow="sm"` with a `gray-200` border.
- Buttons: pill, `radius="full"` as the default.

### Component mapping (HeroUI / `@platform/design-system` v1.8+, Ch.14)

| UI element | Component | Notes |
|---|---|---|
| Status label | `Chip` | `variant="flat"`, `color` mapped to semantic token |
| Action | `Button` | `radius="full"` default |
| Section nav | `Tabs` | underlined, `color="primary"` |
| Person | `Avatar` | initials; `Badge` for status indicator |
| Container | `Card` | `shadow="sm"`, `border` gray-200 |

---

## Step 1 — Domain-correct data references (annotate for handoff)

Annotate the mockup (comments in JSX, notes in HTML) with the exact domain entities/junctions the UI maps
to, so frontend doesn't invent a data shape. For the **Contacts Domain v0.5**:

- Emails → `contact_emails` junction; phones → `contact_phones`; addresses → `contact_addresses`.
- Group → `group_members` with `role` and `is_primary`.
- Contact ↔ Organization → the `Relationship` entity (not a direct field).
- Payments reference a **`payer_ref`** (opaque) — **never a direct Contact object**.

If the feature touches another domain, ask for or state the domain version you are mapping to. Never invent
field, object, or junction names.

---

## Step 2 — Build

1. Apply tokens and component mapping above.
2. Use real-ish data (names, amounts, dates) so the mockup reads like a live screen.
3. Keep money in JetBrains Mono; keep spacing on the 8px grid.
4. Annotate domain data refs as inline comments at each section.
5. Save to `/mnt/user-data/outputs/` and present with `present_files`.

---

## Hard rules

- **Never invent tokens, colors, fonts, field names, or domain junctions.** Use the values above or ask.
- **Confirm the palette** when the product is ambiguous (Product A `#EA580C` vs Product B `#B45309`).
- **All monetary values in JetBrains Mono.** No exceptions.
- **8px grid only.** No arbitrary pixel values.
- **Annotate domain references** so the mockup is handoff-ready, not just pretty.
- **No browser storage in artifacts** (`localStorage`/`sessionStorage` fail in Claude.ai) — use in-memory state.
- Read `frontend-design/SKILL.md` before writing UI code.

## Quality bar

1. Did I confirm product + surface + output format before styling?
2. Are all tokens from the fixed list — no invented colors or spacing?
3. Is every monetary amount in JetBrains Mono and every gap on the 8px grid?
4. Are the domain data references annotated for frontend handoff?
5. Could an engineer build this and wire the data without asking me a follow-up?
