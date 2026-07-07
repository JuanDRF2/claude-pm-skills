---
name: design-system
description: Implement your platform's design system consistently across all UI components and modules. Use this skill whenever building new features, designing components, creating member/constituent-facing interfaces, or any donor/customer-facing features. This skill ensures color consistency, typography standards, spacing rules, component patterns, and accessibility across the entire platform. Always reference this when designing new modules, updating existing ones, or creating mockups.
---

# Design System Implementation

This is the authoritative guide for building consistent, professional, accessible UI components across your platform. Use this skill whenever you're designing, building, or refining any part of the interface.

**The palette below is a placeholder example** — a colorimetrically coherent starter palette (teal primary, slate neutrals, standard semantic colors), not any specific company's real brand. Replace `Primary` and its derived tints with your own brand color before shipping real UI, then keep everything else (typography, spacing, radii, component patterns) as-is or adapt to your own system.

## Quick Reference: Design Tokens

### Color Palette

Built from one primary hue (teal, ~175°) plus a neutral slate scale — this keeps every token visually related instead of a grab-bag of unrelated hex values. Swap `Primary` for your real brand color and regenerate the tinted/shaded variants around it to keep the same coherence.

| Token | Hex | HSL | Usage | Example |
|---|---|---|---|---|
| **Primary** | `#0F766E` | hsl(175, 84%, 25%) | Primary buttons, active states, hover effects, important alerts | CTA buttons, active tab underlines, action confirmations |
| **Link Blue** | `#2563EB` | hsl(221, 83%, 53%) | Links, external-system UI elements | External links, third-party record links |
| **Success Green** | `#16A34A` | hsl(142, 71%, 36%) | Status indicators, checkmarks, success states | Active status badges, completion indicators |
| **Dark Text** | `#1E293B` | hsl(217, 33%, 17%) | Primary text, headings, high-contrast content | Body text, card titles, labels |
| **Muted Text** | `#64748B` | hsl(215, 16%, 47%) | Secondary text, hints, disabled states | Helper text, descriptions, form labels |
| **Border Gray** | `#E2E8F0` | hsl(214, 32%, 91%) | Dividers, card borders, input borders | Form field borders, section dividers |
| **Background Light** | `#F1F5F9` | hsl(210, 40%, 96%) | Secondary backgrounds, hover states | Page background, disabled buttons |
| **Background Lighter** | `#F8FAFC` | hsl(210, 40%, 98%) | Tertiary backgrounds, section backgrounds | Card backgrounds, form sections |
| **Light Accent** | `#F0FDFA` | hsl(166, 76%, 97%) | Callout backgrounds, warning/info boxes | Preview panels, info sections |
| **Light Accent Border** | `#99F6E4` | hsl(168, 84%, 78%) | Accent borders for tinted backgrounds | Borders around callout sections |

### Typography

| Element | Font Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Page Title** | 32px | 700 | 1.2 | Primary page heading |
| **Section Title** | 20-24px | 700 | 1.3 | Section/modal headings |
| **Subsection** | 16px | 700 | 1.3 | Card titles, tab labels |
| **Body Text** | 14-15px | 400 | 1.5-1.6 | Main content, descriptions |
| **Small Text** | 12-13px | 400 | 1.4 | Helper text, secondary info |
| **Label** | 11-12px | 700 | 1.2 | Form labels, badges (uppercase) |

**Font Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| **XS** | 4px | Micro gaps between elements |
| **S** | 8px | Gaps between inline elements |
| **M** | 12px | Padding inside small components |
| **L** | 16px | Standard padding, gaps between sections |
| **XL** | 20px | Card padding, major gaps |
| **2XL** | 24px | Modal padding, large gaps |
| **3XL** | 32px | Page padding, major spacing |

### Border Radius

| Context | Value |
|---|---|
| **Subtle** | 4px |
| **Standard** | 6-8px |
| **Prominent** | 12-16px |
| **Pill** | 20px (full buttons, badges) |

## Component Patterns

### Buttons

```css
/* Primary Button */
- Background: #0F766E
- Color: white
- Padding: 12px 24px
- Border-radius: 6px
- Font-weight: 600
- Hover: background #115E59

/* Secondary Button (Outlined) */
- Background: white
- Border: 1px solid #E2E8F0
- Color: #1E293B
- Padding: 12px 24px
- Hover: background #F1F5F9
```

### Cards

```css
- Background: white
- Border: 1px solid #E2E8F0
- Border-radius: 8px
- Padding: 16-20px
- Box-shadow: subtle (0 1px 3px rgba(0,0,0,0.1))
```

### Modals

```css
- Background: white
- Border-radius: 16px
- Max-width: 700px
- Box-shadow: 0 20px 60px rgba(0,0,0,0.3)
- Padding: 24-32px
```

### Form Elements

```css
/* Input Fields */
- Height: 40px
- Border: 1px solid #E2E8F0
- Border-radius: 4px
- Padding: 0 12px
- Focus: border #0F766E, box-shadow 0 0 0 3px rgba(15,118,110,0.1)

/* Toggle Switch */
- Width: 52px
- Height: 28px
- Checked: background #0F766E
- Disabled: background #E2E8F0
```

### Tabs

```css
- Padding: 16px 24px (each tab)
- Border-bottom: 3px solid transparent
- Active: border-color #0F766E, color #0F766E
- Inactive: color #64748B
- Hover: color #1E293B
```

## Hybrid UI Architecture

If your platform sits partly on a legacy/third-party shell (e.g. a CRM's native UI layer) and partly on your own renovated surfaces, keep the two visually and structurally separate:

### Legacy/Third-Party Shell (Global Chrome)
- Utility bar
- App launcher
- Navigation
- Related lists
- Activity panel
- Global actions

### Your Platform (Content Areas)
- All creation modals
- Wizard flows
- Detail page sections
- Management interfaces
- Advanced features

**Rule:** Never mix legacy shell styling into your own content areas. Keep separation clean.

## Accessibility Standards

- **Touch targets:** minimum 40px × 40px
- **Color contrast:** WCAG AA minimum (4.5:1 for text)
- **Focus indicators:** visible, at least 2px
- **Semantic HTML:** proper heading hierarchy, form labels
- **ARIA labels:** for toggle switches, modals, custom components

## Common Patterns by Use Case

### Membership/Account Management
- Simple card (name, dates, status) + rich modal for actions
- Status badges with color-coded indicators
- Payment options with radio button groups
- Warning boxes (`#F0FDFA` background) for destructive actions

### Data Tables
- Header: `#F8FAFC` background, bold labels
- Rows: alternating `#FFFFFF` / `#F8FAFC`
- Borders: `#E2E8F0`
- Hover: `#F1F5F9`

### Alerts & Callouts
- Success: `#16A34A` text, no background
- Warning: `#0F766E` text, `#F0FDFA` background, `#99F6E4` border
- Info: `#64748B` text, `#F8FAFC` background
- Error: `#0F766E` text, `#F0FDFA` background

## Implementation Checklist

When building new features:

- [ ] Colors from palette (never custom hex values)
- [ ] Typography follows scale (no random font sizes)
- [ ] Spacing uses grid (4px, 8px, 12px, 16px, 20px, 24px, 32px)
- [ ] Border radius consistent (4px, 6px, 8px, 12px, 16px, 20px)
- [ ] Buttons match button patterns
- [ ] Cards/modals follow component specs
- [ ] Form elements have proper states (default, focus, disabled, error)
- [ ] Accessibility requirements met (contrast, focus, labels)
- [ ] Hover states defined for interactive elements
- [ ] No hardcoded colors (all variables/tokens)

## Files & Resources

- See `references/color-palette.json` for machine-readable token definitions

## When to Reference This Skill

- **New module design:** Any time you're designing a new feature
- **Component updates:** Refreshing existing components to match current design system
- **Hybrid UI decisions:** Choosing between legacy shell vs. your own styling
- **Color/spacing questions:** Need to know the right hex or pixel value
- **Consistency checks:** Ensuring all new features look and feel consistent
- **Video/mockup generation:** Using design tokens for visuals

---

**Related Skills:** `video-demo-generator`
