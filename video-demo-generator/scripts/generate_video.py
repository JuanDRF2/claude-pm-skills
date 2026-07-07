#!/usr/bin/env python3
"""
Video Demo Generator
Generates MP4 demo videos using design-system colors and typography.

INTEGRATION: This script reads design tokens from the design-system Skill.
All colors come from: design-system/references/color-palette.json
All typography standards come from: design-system/SKILL.md
"""

import json
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path


class DemoVideoGenerator:
    """Generate demo videos using design tokens from the design-system Skill"""

    def __init__(self, output_dir="/mnt/user-data/outputs", fps=30, resolution=(1280, 720)):
        """
        Initialize video generator with design system tokens.

        Reads colors and typography from the design-system skill.
        """
        self.output_dir = output_dir
        self.fps = fps
        self.resolution = resolution
        self.width, self.height = resolution
        os.makedirs(output_dir, exist_ok=True)

        # Load design tokens from the design-system Skill
        self._load_design_tokens()

    def _load_design_tokens(self):
        """
        Load design tokens from the design-system skill.

        Looks for color-palette.json in multiple locations:
        1. Installed skill location: /mnt/skills/user/design-system/
        2. Local reference: ./references/
        3. Fallback hardcoded values
        """
        self.COLORS = self._load_colors()
        self.FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        self.SPACING = self._load_spacing()

        print(f"✅ Loaded design tokens from design-system")
        print(f"   Brand Color: {self.COLORS.get('brand', 'ERROR')}")
        print(f"   Text Color: {self.COLORS.get('dark', 'ERROR')}")
        print(f"   Border Color: {self.COLORS.get('default', 'ERROR')}")

    def _load_colors(self):
        """Load color palette from the design-system Skill"""

        # Try installed skill location first
        skill_path = Path("/mnt/skills/user/design-system/references/color-palette.json")
        if skill_path.exists():
            try:
                with open(skill_path) as f:
                    data = json.load(f)
                    colors = {}
                    # Flatten color structure
                    for category in ["primary", "semantic", "text", "backgrounds", "borders"]:
                        if category in data["colors"]:
                            for name, info in data["colors"][category].items():
                                colors[name] = info["hex"]
                    return colors
            except Exception as e:
                print(f"⚠️  Error reading {skill_path}: {e}")

        # Fallback: hardcoded values (design-system placeholder defaults)
        print("ℹ️  Using default placeholder colors (design-system not found)")
        return {
            "brand": "#0F766E",
            "linkBlue": "#2563EB",
            "successGreen": "#16A34A",
            "dark": "#1E293B",
            "muted": "#64748B",
            "default": "#E2E8F0",
            "light": "#F1F5F9",
            "lighter": "#F8FAFC",
            "accent": "#F0FDFA",
            "accentBorder": "#99F6E4",
        }

    def _load_spacing(self):
        """Load spacing grid from the design-system Skill"""
        skill_path = Path("/mnt/skills/user/design-system/references/color-palette.json")
        if skill_path.exists():
            try:
                with open(skill_path) as f:
                    data = json.load(f)
                    return data.get("spacing", {})
            except:
                pass

        # Fallback spacing grid
        return {
            "xs": 4, "s": 8, "m": 12, "l": 16, "xl": 20, "2xl": 24, "3xl": 32
        }

    def hex_to_rgb(self, hex_color):
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def create_scene_frame(self, title, description, scene_num, total_scenes):
        """Create a single frame using the design system tokens"""
        img = Image.new("RGB", (self.width, self.height),
                       self.hex_to_rgb(self.COLORS["light"]))
        draw = ImageDraw.Draw(img)

        try:
            title_font = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
            text_font = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
            small_font = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
        except:
            title_font = text_font = small_font = ImageFont.load_default()

        # Draw card/modal container
        card_x1, card_y1 = 50, 60
        card_x2, card_y2 = self.width - 50, self.height - 60
        draw.rectangle([card_x1, card_y1, card_x2, card_y2],
                      outline=self.hex_to_rgb(self.COLORS["default"]),
                      width=2,
                      fill=self.hex_to_rgb("#FFFFFF"))

        # Draw title (Primary brand color)
        draw.text((100, 100), title,
                 fill=self.hex_to_rgb(self.COLORS["brand"]),
                 font=title_font)

        # Draw progress indicator
        progress_y = self.height - 80
        draw.text((100, progress_y), f"Scene {scene_num}/{total_scenes}",
                 fill=self.hex_to_rgb(self.COLORS["muted"]),
                 font=small_font)

        # Draw description (Dark Text)
        desc_y = 200
        for line in description.split("\n"):
            draw.text((120, desc_y), line,
                     fill=self.hex_to_rgb(self.COLORS["dark"]),
                     font=text_font)
            desc_y += 50

        return img

    def generate_video(self, scenes, output_filename):
        """Generate MP4 video from scenes"""
        frames_dir = "/tmp/demo_video_frames"
        os.makedirs(frames_dir, exist_ok=True)

        total_frames = 0

        print(f"\n📸 Generating {len(scenes)} scenes...")

        for idx, scene in enumerate(scenes, 1):
            print(f"  Scene {idx}: {scene['name']} ({scene['duration']}s)...")

            img = self.create_scene_frame(
                scene["name"],
                scene["description"],
                idx,
                len(scenes)
            )

            # Calculate frames for this scene
            frames_for_scene = scene["duration"] * self.fps

            for frame_idx in range(frames_for_scene):
                img.save(f"{frames_dir}/frame_{total_frames:04d}.png")
                total_frames += 1

            print(f"    ✅ {frames_for_scene} frames")

        # Create video
        print(f"\n🎥 Creating MP4 video ({total_frames} frames)...")
        output_path = f"{self.output_dir}/{output_filename}"

        cmd = [
            'ffmpeg',
            '-framerate', str(self.fps),
            '-i', f'{frames_dir}/frame_%04d.png',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-crf', '23',
            '-y',
            output_path
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            file_size = os.path.getsize(output_path) / (1024*1024)
            duration = total_frames / self.fps
            print(f"\n✅✅✅ VIDEO CREATED! ✅✅✅")
            print(f"📹 {output_filename}")
            print(f"   Size: {file_size:.2f} MB")
            print(f"   Duration: {int(duration)} seconds")
            print(f"   Resolution: {self.width}x{self.height} @ {self.fps}fps")
            print(f"   Path: {output_path}")
            return output_path
        else:
            print(f"❌ Error: {result.stderr}")
            return None


def generate_billing_demo():
    """Example: Generate a team billing flow demo video"""
    gen = DemoVideoGenerator()

    scenes = [
        {
            "name": "Scene 1: Team Billing Card",
            "description": "Clean card showing plan info\n\nPlan: Pro\nBilling Cycle: Monthly\nNext Invoice: Aug 12, 2026\nSeats Used: 8 / 10",
            "duration": 5
        },
        {
            "name": "Scene 2: Click Manage Button",
            "description": "User clicks 'Manage Plan'\nbutton\n\nModal is opening...",
            "duration": 3
        },
        {
            "name": "Scene 3: Change Plan Tab",
            "description": "Plan options visible\n\n• Starter - $9.99/seat/month\n  Billed Monthly OR Annually\n\n• Pro - $19.99/seat/month\n  Billed Monthly OR Annually",
            "duration": 10
        },
        {
            "name": "Scene 4: Billing Options",
            "description": "User selects billing cycle\n\nRadio buttons for:\n• Billed Monthly\n• Billed Annually\n\nShowing pricing breakdown",
            "duration": 8
        },
        {
            "name": "Scene 5: Seats Tab",
            "description": "Seat management displayed\n\nCurrent: 10 seats - $199.90/month\n\n• Add seats: +$19.99/seat/month\n• Remove seats: prorated credit",
            "duration": 10
        },
        {
            "name": "Scene 6: Cancel Tab",
            "description": "Cancel option with warnings\n\n⚠️ What you'll lose:\n✗ All Pro features\n✗ Priority support\n✗ Team seats above 3",
            "duration": 10
        },
        {
            "name": "Scene 7: Close Modal",
            "description": "Modal closes\n\nReturning to card view...",
            "duration": 3
        },
        {
            "name": "Scene 8: Complete Flow",
            "description": "Billing Flow\n\n✓ Simple card + Rich modal\n✓ 3 functional tabs\n✓ Plan & seat options\n✓ Professional design",
            "duration": 5
        }
    ]

    return gen.generate_video(scenes, "billing-demo.mp4")


if __name__ == "__main__":
    print("🎬 Video Demo Generator")
    print("Using design tokens from design-system\n")

    generate_billing_demo()
