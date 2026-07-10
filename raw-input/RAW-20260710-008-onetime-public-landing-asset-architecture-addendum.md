ADDENDUM — EXACT ASSET SOURCES, FILE MAP, AND COMPONENT ARCHITECTURE

This addendum is binding. Locate and inspect the real files, copy approved assets into the repository, connect them to the specified components, and report anything inaccessible or unverified.

Do not stop at recommendations. Do not use generic substitutes when a real approved asset exists.

1. EXACT WINDOWS SOURCE DIRECTORY

The source folder shown in the screenshot is:

$env:USERPROFILE\Downloads\OneTimeOneTime - Rabbi Eli Scheller_files

Explorer breadcrumb:

Downloads > OneTimeOneTime - Rabbi Eli Scheller_files

Equivalent Windows pattern:

C:\Users\<current-Windows-user>\Downloads\OneTimeOneTime - Rabbi Eli Scheller_files

The screenshot shows 21 items.

Windows Explorer is hiding file extensions and truncating several long names. Do not guess missing extensions or reconstruct truncated filenames from the screenshot.

First enumerate the literal files:

$source = Join-Path $env:USERPROFILE 'Downloads\OneTimeOneTime - Rabbi Eli Scheller_files'

if (-not (Test-Path -LiteralPath $source)) {
  Write-Error "ASSET_SOURCE_UNAVAILABLE: $source"
} else {
  Get-ChildItem -LiteralPath $source -File |
    Sort-Object Name |
    Select-Object Name, FullName, Extension, Length, LastWriteTime |
    Format-Table -AutoSize
}

Inspect each candidate’s:

- complete filename;
- MIME type;
- extension;
- dimensions;
- transparency;
- duration, if video;
- visible content;
- provenance/permission.

A Chrome icon does not prove that a file is HTML. It may be a WebP or another browser-associated image.

If running inside WSL, search:

/mnt/c/Users/<Windows-user>/Downloads/OneTimeOneTime - Rabbi Eli Scheller_files

If the Codex environment cannot access this folder:

1. Report exactly:
   ASSET_SOURCE_UNAVAILABLE

2. State the inaccessible path.

3. Finish the complete component and layout implementation with replacement-ready asset slots.

4. Do not claim that the files were imported.

5. Do not invent images, filenames, locations, or media logos.

6. State that the 21-item folder must be attached or copied into the worktree.

2. FILE-BY-FILE ASSET MAP

Resolve the complete filename and extension from the filesystem before copying.

A. rabbi book

Intended use:
- Main editorial photograph in “Meet Rabbi Eli Scheller.”
- This is the half-screen photograph of Rabbi Eli holding his book.
- Do not use it in the hero.

Proposed destination:

public/assets/one-time/rabbi/rabbi-eli-holding-book.<verified-extension>

B. naki logo

Intended use:
- “As Seen Across the Jewish World” media-logo marquee.

Proposed destination:

public/assets/one-time/press/naki.<verified-extension>

Requirements:
- Preserve transparency.
- Preserve aspect ratio.
- Do not place it inside a bulky white card.

C. top-row item beginning rs=h_100,cg_true

Its thumbnail is cut off in the screenshot.

Requirements:
- Inspect it before assigning it.
- Do not publish it as a press logo based only on its filename.

D. smilykid

This appears to be a photograph of a child.

Requirements:
- Do not publish it until identity, relevance, and marketing-photo permission are verified.
- It may later become an image for a “What Your Son Will Gain” card.
- Do not assume it is a Rabbi Eli teaching-location image.

E. mishpacha

The thumbnail visibly shows the Mishpacha logo.

Intended use:
- “As Seen Across the Jewish World” marquee.

Proposed destination:

public/assets/one-time/press/mishpacha.<verified-extension>

Do not imply an endorsement beyond the verified relationship.

F. promo_website_v1 (1080p) (1)

This appears to be a promotional video.

Requirements:
- Inspect its content, duration, codec, dimensions, audio, and usage rights.
- Treat it as an optional promotional-media candidate.
- Do not automatically use it as the hero.
- Never autoplay it with sound.
- Do not let this video block the landing-page rebuild.

G. item displayed approximately as rs=h_100,cg_true,m

The thumbnail visibly shows TorahAnytime.

Intended use:
- Media-logo marquee.

Proposed destination:

public/assets/one-time/press/torah-anytime.<verified-extension>

H. item displayed as rs=h_100,cg_true (1)

The thumbnail visibly shows 24Six.

Intended use:
- Media-logo marquee.

Proposed destination:

public/assets/one-time/press/24six.<verified-extension>

I. 1178363755

This is unidentified from the screenshot.

Requirements:
- Inspect the complete filename, MIME type, dimensions, and content.
- Do not use it until identified.

J. another item beginning rs=h_100,cg_true

The thumbnail visibly shows The Loop.

Intended use:
- Media-logo marquee.

Proposed destination:

public/assets/one-time/press/the-loop.<verified-extension>

Disambiguate it from the other similarly named rs= files by inspecting the real files.

K. 1138747998

L. 1158542993

M. 1158589767

N. 1158803771

O. 1174681253

These five files are unidentified from the screenshot.

Requirements:
- Inspect MIME type, dimensions, metadata, and visible content.
- They may be browser-associated image files.
- If any is genuinely a Baltimore, Flatbush/New York, Hollywood, Florida, or other Rabbi Eli teaching photograph, map it only after visually verifying both the photograph and location.
- Otherwise leave it unused.

P. b_w_captivated_crowd_photo-D4O3QBhB

This appears to be a generic black-and-white crowd photograph.

Requirements:
- Do not present it as Rabbi Eli’s actual audience unless provenance proves that.
- Do not use it as evidence of Rabbi Eli’s popularity.
- Use it only as restrained decorative material if licensing and provenance are verified.

Q. global_connections_world_map-CSE_2YOo

This appears to be a world/network map graphic.

Possible use:
- Subtle decorative layer in “Teaching Torah Across the World.”

Requirements:
- It is not a class photograph.
- It does not prove any teaching location.
- Verify licensing and optimize it before use.

R. Las_Vegas_1767898934148-DQ6DRoTn

Requirements:
- Inspect its actual content before use.
- Do not caption it “Las Vegas” merely because the filename contains that wording.
- Use the location only when verified by the asset and context.

S. index-B10aVpMk

This appears to be downloaded site code or bundle material.

Requirements:
- Do not use it as a marketing image.
- Do not import downloaded third-party bundle code into the application.

T. onetimelogo

This is the visible white One Time logo on black.

Intended use:
- Sticky header.
- Footer.

Proposed destination:

public/assets/one-time/brand/one-time-logo-white.<verified-extension>

Requirements:
- Preserve aspect ratio.
- Do not replace it with plain typed text.
- Use the approved canonical brand spelling consistently.

U. onetime hero vertical

This is the existing vertical Rabbi promotional image.

Requirements:
- Keep it only as a reference asset for this pass.
- The new hero must remain intentionally image-free until the final hero image is selected.
- Do not quietly put this picture back into the hero.

3. TEACHING-LOCATION PHOTOGRAPHS

The Explorer screenshot does not visibly prove which files correspond to:

- Baltimore;
- Flatbush / New York;
- Hollywood, Florida;
- Orlando, Florida;
- other Rabbi Eli teaching locations.

Inspect all 21 files, especially the numeric files.

Assign a location only after verifying it from:

- the actual image;
- reliable metadata;
- surrounding source context;
- or an existing approved asset manifest.

If the location photographs are absent:

- preserve the polished data-driven carousel component;
- leave replacement-ready slide slots;
- report the exact missing locations;
- do not fabricate a caption.

4. FINAL ROBOT SCHELLER ASSET

Use only the newest blue Robot Scheller image attached with this addendum.

Do not use either earlier robot draft.

The final approved version has:

- complete green WhatsApp speech-bubble body;
- full white telephone symbol;
- visible bubble tail;
- dark formal suit jacket;
- no white shirt;
- no tie;
- blue stylized robotic face;
- blue circuit-patterned technological kippah;
- no antenna or protrusion above the kippah;
- realistic robotic tzitzis;
- full head, beard, arms, hands, body, legs, feet, and tassels visible.

Copy it to:

public/assets/one-time/robot/robot-scheller-whatsapp.png

Use it for:

RobotSchellerLauncher

Do not use it as a hero CTA.

The floating control must say through its accessible label:

“Open Rabbi Scheller’s WhatsApp assistant.”

The expanded panel must disclose that it is an automated assistant.

If a transparent derivative is needed, create a clean web-ready cutout while preserving:

- the complete WhatsApp bubble;
- head;
- beard;
- jacket;
- arms;
- legs;
- feet;
- tzitzis.

5. PRODUCTION ASSET STRUCTURE

Follow existing repository conventions where appropriate, but preserve this logical organization:

public/assets/one-time/
  brand/
    one-time-logo-white.*
  rabbi/
    rabbi-eli-holding-book.*
  press/
    naki.*
    mishpacha.*
    torah-anytime.*
    24six.*
    the-loop.*
  teaching/
    <verified-location-slug>.*
  outcomes/
    <approved-images>.*
  decorative/
    <verified-licensed-assets>.*
  robot/
    robot-scheller-whatsapp.png

Never reference these locations from production code:

- $env:USERPROFILE
- Downloads
- /workspace/scratch
- temporary attachment paths
- blob URLs

6. REQUIRED ASSET MANIFEST

Create a data-driven asset manifest containing:

- original source filename;
- production filename;
- section/use;
- width;
- height;
- alt text;
- verified location, where applicable;
- identity verification;
- permission/provenance status;
- optimization status;
- used or held-back status.

Do not publish an asset whose identity, location, or permission remains unknown.

7. REQUIRED REACT COMPONENT ARCHITECTURE

Do not build the landing page as one giant component.

Do not make the entire site a repetitive grid of identical dark cards.

Follow the repository’s existing conventions, but implement the equivalent of:

features/one-time-landing/
  OneTimeLandingPage.tsx
  oneTimeLandingContent.ts
  oneTimeLandingAssets.ts

  components/
    LandingHeader.tsx
    HeroSection.tsx
    SignupDialog.tsx
    RabbiProfileSection.tsx
    MediaLogoMarquee.tsx
    TeachingLocationsCarousel.tsx
    OutcomesSection.tsx
    BenefitsGrid.tsx
    HowItWorksSection.tsx
    AudienceSection.tsx
    RobotSchellerLauncher.tsx
    LandingFooter.tsx

  hooks/
    useReducedMotion.ts
    useSectionObserver.ts

  styles/
    one-time-landing.<existing-style-format>

Use existing equivalent components when they already exist.

Do not duplicate existing:

- Dialog primitives;
- form controls;
- buttons;
- image components;
- typography;
- carousel components;
- focus-management utilities.

Architecture requirements:

oneTimeLandingContent must own:

- navigation;
- hero copy;
- schedule;
- Rosh Hashanah offer;
- address;
- outcomes;
- benefits;
- steps;
- audiences;
- footer copy.

oneTimeLandingAssets must own:

- brand logo;
- Rabbi book portrait;
- press logos;
- classroom slides;
- outcome images;
- decorative media;
- Robot Scheller asset;
- alt text;
- location and provenance metadata.

SignupDialog must be one shared component opened by every Sign Up Now trigger.

MediaLogoMarquee must consume a data-driven logo array.

TeachingLocationsCarousel must consume a data-driven verified slide array.

Components must remain independently responsive and testable.

Use the project’s existing dialog, motion, and carousel libraries when installed.

If no suitable motion library exists, use lightweight CSS and browser APIs.

Do not add a large dependency solely for:

- logo movement;
- glow;
- shimmer;
- section reveals.

Keep visual effects in reusable tokens and classes rather than scattered inline styles.

8. VISUAL QUALITY GATES

The page is not accepted merely because every section exists.

It must satisfy all of these requirements:

- The first viewport has an obvious hierarchy:
  compact header → emotional headline → supporting copy → schedule/promotion → Sign Up Now.

- The site is not a repetitive wall of generic cards.

- Every major section has a distinct composition while sharing one design system.

- Yellow is a precise premium highlight, not a flat full-width background.

- Ice blue looks like reflected technological light around:
  borders;
  shadows;
  focus rings;
  chrome;
  image edges.

- Ice blue must not become a competing second brand.

- The Sign Up Now button has a restrained premium light sweep—not flashing or strobing.

- The Rabbi book portrait feels editorial and prestigious.

- Media logos are borderless, balanced, and correctly proportioned.

- Teaching photographs are large, immersive, and verified.

- Robot Scheller remains readable at floating-launcher size.

After the first implementation:

1. Capture full-page screenshots at 1440px and 390px.

2. Review them.

3. Perform a second visual-polish pass checking:

   - alignment;
   - spacing rhythm;
   - type wrapping;
   - image crops;
   - card height;
   - glow intensity;
   - dead space;
   - CTA prominence;
   - mobile density;
   - bot placement.

Also capture focused screenshots of:

- sticky header;
- hero;
- signup dialog;
- Rabbi/press section;
- teaching carousel;
- Benefits grid;
- mobile menu;
- footer;
- Robot Scheller launcher.

No final screenshot may show:

- horizontal overflow;
- clipped headings;
- broken assets;
- source filenames;
- repeated CTA wording;
- accidental empty blocks;
- bot overlapping another control.

9. FUNCTIONAL QUALITY GATES

Add or update tests for:

- every Sign Up Now trigger opening the same dialog;
- name and email required;
- phone optional;
- no student-name field in quick capture;
- Family/School next-step branching;
- UTM/referrer preservation;
- duplicate-submit prevention;
- server error and retry;
- dialog focus trap;
- Escape close;
- focus restoration;
- mobile-menu keyboard behavior;
- carousel keyboard controls;
- carousel pause control;
- reduced-motion behavior;
- no broken image requests;
- no horizontal overflow at required widths.

Run the project’s real:

- formatter;
- linter;
- typecheck;
- unit/component tests;
- relevant integration or E2E tests;
- production build.

10. REQUIRED FINAL ASSET REPORT

Return this table:

Source filename | Production filename | Section | Verified content | Rights/provenance | Used or held back

Explicitly list:

- inaccessible files;
- unidentified numeric files;
- missing location photographs;
- ambiguous captions;
- child photographs withheld for permission;
- press marks withheld for verification;
- assets deliberately not used.

Do not say “assets integrated” without producing this evidence.

END ADDENDUM
---
raw_id: RAW-20260710-008
source_channel: codex_chat
source_attachment: C:\Users\User\.codex\attachments\b9b930a6-8c53-4ea2-b675-e40f4f1def6d\pasted-text.txt
parse_status: registered
created_requirement_register: tasks-pending/2026-07-10-onetime-public-landing-production-rebuild.md
created_at: 2026-07-10T12:00:00+03:00
scope: rabbi_sheller_provider / one_time_mishnah_class
title: One Time public landing asset and architecture addendum
---
