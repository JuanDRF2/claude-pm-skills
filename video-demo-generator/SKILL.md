---
name: video-demo-generator
description: Generate polished, on-brand MP4 demo videos for interactive artifacts and UI components. Use this skill whenever you need to create a video walkthrough of an interactive HTML artifact, showcase a feature flow, document user interactions, or create a demo for stakeholders. The generator automatically applies design tokens (colors, typography, spacing) from the design-system skill, ensuring consistent branding. Works with: billing flows, upgrade/renewal interfaces, modal interactions, form wizards, or any interactive component. Creates videos in MP4 format, ready to embed or share.
---

# Video Demo Generator

Automatically generate professional, on-brand demo videos for interactive artifacts. This skill integrates with the **design-system** skill to apply consistent colors, typography, and styling.

## What It Does

Given an interactive HTML artifact or feature flow description, this generator:

1. **Extracts the interaction flow** - Understands what happens when users click, toggle, navigate tabs, fill forms
2. **Creates visual frames** - Generates scene-by-scene screenshots using design tokens
3. **Applies brand styling** - Uses colors, fonts, and spacing from `design-system`
4. **Produces MP4 video** - Outputs a shareable, embedable video file (typically 0.3-1.5 MB)

## When to Use

| Scenario | Use? |
|---|---|
| "Show me how the artifact works in a video" | ✅ Yes |
| "Create a demo for stakeholders" | ✅ Yes |
| "I need a 60-90 second walkthrough" | ✅ Yes |
| "Document the billing flow visually" | ✅ Yes |
| "Show all the tabs and interactions" | ✅ Yes |
| "Embed a video on a landing page" | ✅ Yes (MP4 works everywhere) |

## Input: What You Provide

### Minimum Required:
- **Artifact HTML file path** (e.g., `/path/to/artifact.html`) OR
- **Feature description** (e.g., "Team Billing Card with Manage modal, 3 tabs: Change Plan, Seats, Cancel")

### Optional:
- **Scene timing** (how many seconds per scene; default 5-10s)
- **Specific interactions to show** (e.g., "highlight the toggle for pay monthly/annually")
- **Total duration** (default ~60-90 seconds)

## Output: What You Get

```
billing-artifact-demo.mp4
├─ Resolution: 1280x720 (HD)
├─ Duration: ~60-90 seconds
├─ FPS: 30 fps
├─ Format: H.264 video codec
├─ Size: 0.3-1.5 MB (very small)
├─ Ready to: Share, embed, present
└─ Styling: 100% design-system tokens
```

## How It Works

### Step 1: Scene Extraction
The generator breaks down your artifact into **scenes**:

```
Scene 1: Initial View (5s)
  └─ Shows the artifact at rest state

Scene 2: User Interaction (3s)
  └─ Hovers/clicks a button

Scene 3: Modal Opens (3s)
  └─ Smooth transition to modal view

Scene 4: Tab Navigation (10s)
  └─ Click each tab, dwell 3s per tab

Scene 5: Form Interaction (5s)
  └─ Toggle switches, radio buttons, etc.

Scene 6: Close & Summary (5s)
  └─ Return to initial state, show final state
```

### Step 2: Frame Generation
For each scene, the generator:

1. **Creates a visual frame** using design tokens:
   - Colors from `design-system/references/color-palette.json`
   - Typography scale (page title, section title, body, label)
   - Spacing grid (4px, 8px, 12px, 16px, 20px, 24px, 32px)
   - Component patterns (buttons, cards, modals)

2. **Applies consistent styling** to all frames:
   ```css
   /* Every frame uses */
   background: #F1F5F9  /* Light background */
   font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", ...
   color: #1E293B       /* Dark text */

   /* Interactive elements use */
   primary-button: #0F766E  /* Brand primary */
   border: #E2E8F0
   hover: #F0FDFA (light accent)
   ```

3. **Holds each frame** for the specified duration (default 30 fps × duration = frame count)

### Step 3: Video Encoding
- Converts frame sequence to MP4 using ffmpeg
- H.264 codec (maximum compatibility)
- CRF 23 quality (balanced file size vs. quality)

## Integration with design-system

This skill **automatically imports** from `design-system`:

```python
# The video generator reads:
- color-palette.json (all hex codes)
- SKILL.md (spacing grid, typography, component patterns)

# And applies to every frame:
- Brand colors (never custom hex)
- Typography standards (no random sizes)
- Spacing consistency (grid-based)
- Component patterns (buttons, modals, cards)
```

**Example:** When showing an "Upgrade" button in the video, it automatically uses:
- Background: `#0F766E` (Primary brand color from palette.json)
- Padding: `12px 24px`
- Border-radius: `6px`
- Hover: `#115E59` (darker shade)

## Common Use Cases

### 1. Team Billing Flow
```
Input: "Show the Team Billing Card with Manage modal"
Output:
- Scene 1: Card visible (5s)
- Scene 2: Click "Manage Plan" (3s)
- Scene 3: Modal opens on "Change Plan" tab (10s)
- Scene 4: Show billing-cycle options (radio buttons) (5s)
- Scene 5: Switch to "Seats" tab (10s)
- Scene 6: Show seat add/remove options (10s)
- Scene 7: Switch to "Cancel" tab (10s)
- Scene 8: Close modal, back to card (5s)
Total: ~58 seconds
```

### 2. Feature Announcement
```
Input: "Short 30-second demo of new annual billing discount"
Output:
- Scene 1: Change Plan option visible (3s)
- Scene 2: Show "Billed Monthly" selected (5s)
- Scene 3: Show "Billed Annually" option (5s)
- Scene 4: Amount calculation highlights (5s)
- Scene 5: "Switch to Annual" button ready (5s)
- Scene 6: Confirm state (5s)
Total: 28 seconds
```

### 3. Stakeholder Presentation
```
Input: "Complete flow for 2-minute investor pitch"
Output:
- Full artifact walkthrough with all interactions
- Slow pace (8-10s per scene for commentary)
- Total: ~120 seconds
- Ready to embed in slides or website
```

## Technical Details

### Frame Generation Algorithm

```
For each scene in [scenes]:
  1. Create blank image (1280×720)
  2. Apply background color from palette (e.g., #F1F5F9)
  3. Draw scene title using design-system typography
  4. Draw scene description using component patterns
  5. Add scene counter (Scene X/Y)
  6. Save PNG
  7. Duplicate frame: (duration_seconds × fps) times

Convert all frames → MP4 using ffmpeg:
  ffmpeg -framerate 30 -i frame_%04d.png \
    -c:v libx264 -pix_fmt yuv420p \
    -crf 23 -y output.mp4
```

### File Size Optimization

- **1280×720 @ 30fps:** ~0.3 MB per 30 seconds
- **Full 90-second demo:** ~0.8-1.2 MB
- **2-minute demo:** ~1.5-2 MB

Sizes depend on:
- Video complexity (more colors = larger file)
- Duration
- CRF quality (23 is good balance)

## Output Files

All demos are saved to:
```
/mnt/user-data/outputs/[artifact-name]-demo.mp4
```

Examples:
- `billing-artifact-demo.mp4` (billing flow)
- `upgrade-flow-demo.mp4` (upgrade experience)
- `payment-options-demo.mp4` (payment selection)

## Customization

### Optional Parameters:

```python
duration_per_scene = 5  # seconds (default)
total_duration = 60     # seconds (default ~60s)
fps = 30                # frames per second (fixed)
resolution = (1280, 720)  # fixed to HD
quality = 23            # CRF (fixed)
```

### Scene Customization:

```python
scenes = [
  {
    "name": "Scene 1: Initial View",
    "description": "Card is visible with member info",
    "duration": 5
  },
  {
    "name": "Scene 2: Click Manage",
    "description": "Modal opens with Upgrade tab active",
    "duration": 8  # Custom duration
  },
  # ... more scenes
]
```

## Styling Rules (Auto-Applied)

Every video frame automatically follows these rules from `design-system`:

- ✅ Only colors from color-palette.json
- ✅ Typography from scales (no custom sizes)
- ✅ Spacing from grid (4px, 8px, 12px, 16px...)
- ✅ Component patterns (buttons, cards, modals)
- ✅ System font stack
- ✅ No hardcoded hex values
- ✅ Consistent hover/active states

## Examples Generated with This Skill

- ✅ `billing-artifact-demo.mp4` (billing flow module)
- ✅ `upgrade-flow-demo.mp4` (upgrade options with payment methods)
- ✅ `payment-options-demo.mp4` (monthly vs. annual payment)

## When This Skill Triggers

You'll see this skill suggested when you:

- Ask to "create a video of this artifact"
- Want a "demo for stakeholders"
- Need to "show how this flow works"
- Request a "visual walkthrough" of a feature
- Say "record this interaction"
- Ask to "create a 60-second demo"
- Want to "document this feature visually"

## Dependencies

- ✅ `ffmpeg` (installed, creates MP4)
- ✅ Python 3.x (PIL for frame generation)
- ✅ `design-system` skill (supplies design tokens)

## Related Skills

- **design-system** — Defines all design tokens, colors, typography, components
- **mockup-builder** — Creates static mockups; use this skill for videos instead
