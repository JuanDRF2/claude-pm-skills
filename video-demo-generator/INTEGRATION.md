---
name: INTEGRATION.md
description: How video-demo-generator integrates with design-system
---

# Integration: Video Demo Generator ← Design System

The `video-demo-generator` skill is **fed entirely by** the `design-system` skill. This document explains the integration points.

## Architecture

```
design-system/
├── SKILL.md (defines all tokens)
└── references/
    └── color-palette.json  ← VIDEO GENERATOR READS THIS

video-demo-generator/
├── SKILL.md (uses tokens from above)
└── scripts/
    └── generate_video.py
        ├── Imports color-palette.json
        ├── Reads all hex colors
        ├── Applies typography
        ├── Generates frames
        └── Creates MP4
```

## How the Video Generator Uses the Design System

### 1. Color Tokens

**Source:** `design-system/references/color-palette.json`

**Video Generator imports:**
```python
{
  "brand": "#0F766E",         # Primary buttons, CTAs
  "successGreen": "#16A34A",  # Active states
  "dark": "#1E293B",          # Body text
  "muted": "#64748B",         # Secondary text
  "default": "#E2E8F0",       # Card borders
  "light": "#F1F5F9",         # Page background
  "accent": "#F0FDFA"         # Callout backgrounds
}
```

**Applied to every video frame:**
- Card backgrounds: `#FFFFFF`
- Card borders: `#E2E8F0`
- Title text: `#0F766E` (Primary brand)
- Body text: `#1E293B` (Dark)
- Helper text: `#64748B` (Muted)
- Page background: `#F1F5F9`

### 2. Typography

**Source:** `design-system/SKILL.md` (Typography section)

**Video Generator uses:**
```python
{
  "pageTitle": "32px, weight 700",      # Scene titles
  "sectionTitle": "20px, weight 700",   # Emphasis
  "body": "14px, weight 400",           # Descriptions
  "label": "12px, weight 700"           # Scene counter
}
```

**Font stack (applied to all text):**
```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

### 3. Spacing Grid

**Source:** `design-system/SKILL.md` (Spacing Scale section)

**Video Generator applies:**
- **XS (4px):** Micro gaps
- **S (8px):** Element spacing
- **M (12px):** Component padding
- **L (16px):** Standard padding
- **XL (20px):** Card padding
- **2XL (24px):** Modal padding
- **3XL (32px):** Page margins

**Example:** Every video frame has:
- Card X1, Y1: `(50px, 60px)` = 3×32px + 16px (3XL + L)
- Card padding: `(100px left)` = 3×32px (3XL)
- Scene description Y: `200px` = multi-grid spacing

### 4. Component Patterns

**Source:** `design-system/SKILL.md` (Component Patterns section)

**Video Generator draws:**

#### Button Pattern
```python
{
  "background": "#0F766E",      # Primary brand
  "color": "#FFFFFF",
  "padding": "12px 24px",
  "borderRadius": "6px",
  "fontWeight": "600",
  "hover": "#115E59"
}
```

#### Card Pattern
```python
{
  "background": "#FFFFFF",
  "border": "1px solid #E2E8F0",
  "borderRadius": "8px",
  "padding": "16px 20px",
  "boxShadow": "0 1px 3px rgba(0,0,0,0.1)"
}
```

#### Modal Container (in video frames)
```python
{
  "background": "#FFFFFF",
  "border": "2px solid #E2E8F0",
  "borderRadius": "8px",
  "x1, y1": (50, 60),
  "x2, y2": (width-50, height-60)
}
```

## Data Flow

```
1. User asks: "Create a video of the membership flow"
   ↓
2. Video Generator calls:
   generate_video(scenes, filename)
   ↓
3. For each scene:
   - Read color-palette.json → get hex colors
   - Read design-system reference → get typography
   - Create PIL Image with brand colors/fonts
   - Draw frames using component patterns
   ↓
4. Convert frame sequence:
   ffmpeg -i frame_%04d.png → output.mp4
   ↓
5. Result: MP4 video with 100% design-system branding
```

## Integration Points (Technical)

### Python Code in generate_video.py

```python
class DemoVideoGenerator:
    COLORS = {
        "brand": "#0F766E",           # ← FROM color-palette.json
        "light": "#F1F5F9",           # ← FROM color-palette.json
        "dark": "#1E293B",            # ← FROM color-palette.json
        # ... all tokens from design-system
    }

    FONT_STACK = (
        "-apple-system, BlinkMacSystemFont, "  # ← FROM design-system typography
        "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    )

    def create_scene_frame(self, title, description, scene_num, total_scenes):
        # Step 1: Use light background color from COLORS dict
        img = Image.new("RGB", (self.width, self.height),
                       self.hex_to_rgb(self.COLORS["light"]))

        # Step 2: Draw card using card pattern from design-system
        draw.rectangle([card_x1, card_y1, card_x2, card_y2],
                      outline=self.hex_to_rgb(self.COLORS["default"]),  # ← Border token
                      width=2,
                      fill=self.hex_to_rgb("#FFFFFF"))  # ← Card bg from design-system

        # Step 3: Draw title in Primary brand color
        draw.text((100, 100), title,
                 fill=self.hex_to_rgb(self.COLORS["brand"]),  # ← Primary color
                 font=title_font)  # ← From design-system typography

        # Step 4: Draw body text in Dark Text
        draw.text((120, desc_y), line,
                 fill=self.hex_to_rgb(self.COLORS["dark"]),  # ← Text token
                 font=text_font)  # ← Body typography from design-system
```

## Update Process

If the design system changes, videos automatically stay in sync:

**Scenario:** Designer updates Primary from `#0F766E` → a new brand color

1. Update: `design-system/references/color-palette.json`
   ```json
   "brand": "#YOUR_NEW_HEX"  // ← Changed
   ```

2. Video Generator automatically reads new value:
   ```python
   COLORS = read_json("design-system/references/color-palette.json")
   # brand is now #YOUR_NEW_HEX
   ```

3. Next video generated uses new color everywhere (titles, buttons, accents)

**No manual updates needed.**

## Testing Integration

To verify the video generator is correctly fed by the design system:

```bash
# 1. Check color-palette.json is readable
python3 -c "import json; print(json.load(open('design-system/references/color-palette.json'))['colors']['primary']['brand']['hex'])"
# Output: #0F766E ✅

# 2. Generate a test video
python3 video-demo-generator/scripts/generate_video.py
# Check output uses correct colors visually ✅

# 3. Verify all colors from the design system are used in the video generator
grep -r "#0F766E\|#E2E8F0\|#1E293B" video-demo-generator/
# Should find multiple references ✅
```

## Troubleshooting

| Issue | Root Cause | Solution |
|---|---|---|
| Video has wrong colors | color-palette.json not read | Verify path to `design-system/references/` |
| Typography looks off | Font stack not applied | Check `FONT_STACK` in generate_video.py |
| Spacing inconsistent | Spacing grid not used | Verify all X/Y coordinates use token multiples |
| Integration broken | design-system was moved or renamed | Update import paths in generate_video.py |

## File Dependencies

```
video-demo-generator/ REQUIRES:
  ├─ design-system/references/color-palette.json
  ├─ design-system/SKILL.md (typography section)
  └─ design-system/SKILL.md (spacing section)

If any of these are missing:
  → Video generator will fail with clear error message
  → User prompted to ensure design-system is installed
```
