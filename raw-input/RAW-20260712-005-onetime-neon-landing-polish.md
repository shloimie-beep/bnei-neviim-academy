Act as the senior UI/front-end designer for the One Time Mishnayos public landing page.

This is a focused visual-polish pass. The site must feel modern, high-tech, energetic, premium, and trustworthy—not like a collection of plain boxes on a black background.

Do not deploy until desktop and mobile screenshots are approved.

REFERENCE

Current-state screenshot:
/workspace/scratch/ffef2e71fe52/upload/4c45f0a4-6ef2-4dc8-973a-0a76dab1b443.png

PRIMARY FILES

- public/one-time/index.html
- public/one-time/signup.html
- public/js/bna-bot-widget.js
- Existing One Time CSS/assets/tests

ASSET PREFLIGHT

Check these exact local Windows paths before editing:

Smiling student:
C:\Users\User\Downloads\OneTimeOneTime - Rabbi Eli Scheller_files\smilykid.png

Rabbi teaching photographs:
C:\Users\User\Downloads\drive-download-20260622T143701Z-3-001.zip

If either path is unavailable:

- Do not substitute an unrelated stock or AI image.
- Create a clearly labeled image placeholder.
- Report the missing asset.
- Continue with the rest of the visual implementation.

If available:

- Copy smilykid.png to:
  public/assets/one-time/students/smiley-kid.png
- Extract the ZIP into a temporary directory.
- Do not commit the original ZIP.
- Select and optimize only the strongest Rabbi teaching photographs.
- Store them under:
  public/assets/one-time/rabbi/teaching-locations/
- Use normalized filenames such as:
  rabbi-scheller-baltimore.webp
  rabbi-scheller-georgia.webp
- Preserve originals outside the public build.
- Do not distort or stretch images.
- Generate correctly sized WebP assets.
- Record which source file maps to each final asset.

VISUAL SYSTEM

Replace the current metallic-gold feeling with a neon/chrome-yellow system.

Use approximately:

- Black: #050505
- Deep blue-black: #071117
- Ice blue: #DFF8FF
- Electric blue highlight: #86E8FF
- Neon yellow: #F0FF32
- Bright yellow highlight: #FAFF82
- White: #FFFFFF

Do not use brown, amber, mustard, beige-gold, or dark-gold gradients.

Buttons should use a bright yellow/chrome treatment with:

- A pale-yellow highlight
- Neon-yellow center
- Subtle white reflection
- Ice-blue edge reflection
- Strong black depth shadow
- Soft yellow outer glow
- A restrained light sweep

The buttons should feel high-tech, not like gold plaques.

Add depth throughout the page with:

- Layered shadows
- Fine translucent borders
- Ice-blue edge lighting
- Radial blue illumination
- Subtle yellow highlights
- Background grids
- Large blurred light fields
- Very subtle noise or texture where appropriate

Do not overuse glow. Text must remain sharp and readable.

HEADER

Replace the crowded desktop navigation with the same compact navigation model at every viewport.

The visible sticky header should contain only:

1. One Time logo
2. “Worldwide Mishnah Learning”
3. “Sign Up Now”
4. Hamburger menu

All section navigation belongs inside the hamburger drawer, including on desktop.

Drawer links:

- What You Receive
- What He’ll Gain
- How It Works
- Who It’s For
- Rabbi Scheller
- Member Login

Requirements:

- Use a polished right-side drawer with a dark translucent background.
- Add a soft ice-blue border and shadow.
- Support Escape to close.
- Trap keyboard focus while open.
- Restore focus to the hamburger after closing.
- Make the overlay and controls accessible.
- Keep the header compact on 390px screens.
- Do not hide “Worldwide Mishnah Learning” completely on mobile; use a small two-line treatment if necessary.

ROSH HASHANAH TICKER

The latest instruction supersedes the earlier bottom placement.

Place the moving Rosh Hashanah strip once, directly beneath the header at the top of the page. Do not repeat it at the bottom.

It should contain dynamically calculated text such as:

“ROSH HASHANAH SPECIAL • [N] DAYS TO ROSH HASHANAH • JOIN FREE UNTIL ROSH HASHANAH • SIGN UP NOW”

Requirements:

- Bright neon/chrome yellow background—not gold.
- Dark text.
- Seamless horizontal motion.
- Dynamic day calculation.
- Pause on hover and keyboard focus.
- Static accessible version for reduced-motion users.
- “Sign Up Now” links to /one-time/signup.
- It should scroll away normally rather than permanently consuming screen space.

HERO

Do not add a final hero photograph during this pass.

Remove or redesign the current large empty tilted rectangle so it does not look like a broken image placeholder.

Restore a full-bleed background grid across the entire hero, not only the right-hand panel.

Add:

- A subtle grid across the full hero
- Ice-blue radial light from the right
- Restrained yellow illumination near the text
- Large faint circular or orbital lines
- Smooth black-to-blue shading
- Depth behind the heading
- A polished fade toward the following section

The hero should occupy the first screen cleanly without excessive empty space.

Kicker:

“Worldwide Mishnah learning — live from Eretz Yisrael”

Make this substantially larger than the current version:

- Approximately 21–24px desktop
- Approximately 15–17px mobile
- Stronger weight
- Ice-white or very pale blue text
- Matching neon-yellow line on both the left and right
- Lines must be symmetrical
- Shorten the lines on mobile instead of allowing awkward wrapping

Heading:

“Give your son a love for learning Torah.”

Schedule:

“Live every day at 7:00 p.m. Israel time.”

CTA:

“Sign Up Now”

The hero CTA is one of only three large Sign Up Now buttons allowed on the page.

Add a tasteful entrance animation to the hero text when the page loads.

WHAT YOU RECEIVE

Section heading:

“What You Receive”

Subheading:

“A complete online dashboard for learning, progress tracking, reminders, and communication.”

Use the smiling-child asset in this section:

public/assets/one-time/students/smiley-kid.png

Desktop composition:

- Large circular photograph on one side
- Feature layout on the other side
- The circle should have an even crop, consistent aspect ratio, and deliberate object-position
- Add a thin neon-yellow ring, ice-blue secondary ring, and a deep soft shadow
- The image must not appear stretched
- Visually connect the circle to the feature panel using subtle lines or gradients

Mobile:

- Center the circular image above the feature grid
- Approximately 210–240px wide
- Preserve the full face and natural crop

Replace letter icons with consistent professional SVG icons. Use existing icon tooling if present; otherwise use lightweight inline SVGs. Do not add a large framework solely for icons.

Recommended mappings:

- Live class: video camera
- Class library: media library/play
- Student portal: graduation cap
- Parent portal: users/family
- Review sheets: document
- Reminders: bell
- Questions with Rabbi: message/question bubble
- Monitored platform: shield/check

All feature cards must:

- Have exactly equal heights within each row
- Use the same icon size
- Use the same padding
- Align titles consistently
- Use CSS Grid with stretched rows
- Have a subtle blue-black gradient rather than plain black
- Include translucent borders, inner highlights, and real depth shadows
- Lift slightly on hover without excessive movement
- Avoid paragraphs if the title is self-explanatory

Features:

- Live daily Mishnayos class
- Online class library
- Student portal
- Parent portal
- Review sheets
- Daily reminders
- Questions with Rabbi Scheller
- Monitored online platform

WHAT HE’LL GAIN

Heading:

“What He’ll Gain”

Retain these three benefits:

- Clarity
- Accomplishment
- Excitement for learning Torah

Use the previously approved concise benefit copy.

Improve the visual treatment:

- Three equal-height editorial panels
- A photo or visual slot in each panel
- Strong iconography and depth
- Ice-blue/yellow accent differences between panels
- No numbered generic boxes
- No oversized empty areas
- Consistent image ratios and content alignment

The teaching-location ZIP is intended primarily for the later Rabbi carousel. Do not randomly reuse those photographs here.

Until separate benefit photographs are approved, use elegant graphical placeholders labeled:

- Clarity image pending
- Accomplishment image pending
- Excitement image pending

Do not insert generic stock children.

SCROLL REVEALS

Add polished scroll-triggered reveals to the major sections.

Use IntersectionObserver rather than a heavy animation library.

Motion specification:

- Initial opacity: 0
- Initial vertical offset: approximately 16–24px
- Duration: 500–700ms
- Smooth easing
- Small stagger between related cards
- Animate once only
- Do not animate every tiny piece of text independently
- Do not make users wait to read content

When prefers-reduced-motion is enabled:

- Show everything immediately
- Disable translating, marquee movement, and decorative looping effects

HOW IT WORKS

Heading:

“How It Works”

Use this supporting copy:

“Join the live class now and stay updated as we continue refining the technology that brings Torah learning to boys around the world.”

Use only three steps:

1. Sign up
2. Receive the class link
3. Enjoy the live class

Design this as a connected journey:

- Three large step nodes
- A glowing line connecting them on desktop
- A vertical connection on mobile
- One concise title per step
- Relevant icon for each step
- No long paragraphs
- No fourth step
- No Family/School explanation here

Do not place another large CTA inside this section.

WHO IT’S FOR

Heading:

“Who It’s For”

Supporting copy:

“Built for families, homeschoolers, schools, and local boys who want a clear daily Mishnayos rhythm.”

Audiences:

- Families
- English-speaking homeschoolers
- Schools
- Local boys in Ramat Beit Shemesh Alef

Give this section a more distinctive composition than another standard card grid.

Use:

- A light-blue or blue-black illuminated background
- A subtle world-map/grid/orbit treatment
- Four large audience markers or glass panels
- Meaningful icons
- Strong even alignment
- Short labels
- No filler paragraphs under every audience

The local-class item may include:

“Free live class at 7:00 p.m.”

RABBI SCHELLER TEACHING CAROUSEL

Keep this section near the bottom.

Use the strongest photographs from:

C:\Users\User\Downloads\drive-download-20260622T143701Z-3-001.zip

Prioritize photographs labeled or identifiable as:

- Baltimore
- Georgia
- Other clear teaching locations
- Large classes
- Rabbi Scheller visibly teaching
- Engaged students
- Sharp, properly exposed images

Select approximately 6–8 strong, nonduplicate photographs.

Reject:

- Blurry photographs
- Screenshots containing browser or application chrome
- Near-duplicates
- Images where the Rabbi is badly obscured
- Extremely low-resolution files
- Awkward crops
- Images without public-use clearance

Carousel requirements:

- Consistent 16:9 visual frame
- One main image plus a subtle preview of the next image on desktop
- Single full-width image on mobile
- Per-image object-position adjustments
- Location label over a dark gradient
- Previous/next buttons
- Pagination
- Keyboard support
- Touch/swipe support
- Auto-advance with pause on hover/focus
- Reduced-motion static behavior
- No layout shift
- Descriptive alt text, such as:
  “Rabbi Eli Scheller teaching students in Baltimore”

Preserve the existing “As Seen Across the Jewish World” logo marquee, but keep all logo backgrounds transparent and understated.

ROBOT SCHELLER / WHATSAPP

The current launcher shows mostly a small face. That is not acceptable.

Use the existing complete Robot Scheller asset and show the entire character.

Closed launcher:

- Approximately 100–108px desktop
- Approximately 82–90px mobile
- Entire head, WhatsApp body, arms, tassels, and feet visible
- Use a real img with object-fit: contain
- Center horizontally and vertically
- No clipping
- No face-only crop
- Add a neon-yellow outer ring
- Add an ice-blue secondary glow
- Add a small recognizable green WhatsApp badge
- Add a restrained entrance pop after page load
- Do not use a distracting permanent bounce

On hover/focus, show:

“Ask Robot Scheller”

Open assistant:

- Show the entire robot as a small image in the assistant header corner
- Preserve “Current class information”
- Preserve every currently working action
- Do not cover the title, close button, or messages
- Keep the robot visible without cropping

Test positioning against the ticker, footer, mobile safe areas, and browser edges.

CTA PLACEMENT

Allow large “Sign Up Now” buttons in exactly three locations:

1. Header
2. Hero
3. Final CTA above the footer

Remove large duplicate CTAs from all middle sections.

FINAL CTA

Immediately before the footer, add a visually strong but concise final panel:

Heading:
“Ready to join the live class?”

Button:
“Sign Up Now”

Use the neon-yellow button treatment and a restrained blue/yellow glow.

FOOTER

Improve the footer structure.

Include:

- One Time logo
- Short brand line
- Home
- Sign Up Now
- Privacy
- Terms
- Member Login

Include social-media icons only when real URLs are configured. Do not add dead `#` links.

Use a dark layered background, fine top border, readable spacing, and a clean mobile stack.

Do not place the Rosh Hashanah ticker in the footer.

RESPONSIVE AND QUALITY REQUIREMENTS

Test at:

- 1440px
- 1024px
- 768px
- 430px
- 390px

Verify:

- No horizontal overflow
- No uneven feature cards
- No gold or mustard button colors
- Full hero background grid
- Symmetrical hero kicker lines
- Hamburger navigation at every viewport
- Only three large CTAs
- Ticker appears only at the top
- Smiling-child image is circular and evenly cropped
- Rabbi carousel images are not stretched
- Complete WhatsApp robot is visible
- Current class information still works
- Scroll reveals work
- Reduced-motion mode works
- All controls have keyboard focus states
- Images use explicit width/height or aspect-ratio to prevent layout shift
- Existing signup, bot, and landing tests still pass

DELIVERABLES

Return:

1. Changed-file list
2. Asset source-to-destination map
3. List of selected carousel images and locations
4. Any unavailable assets
5. Screenshots at all required widths
6. Short before/after requirement matrix
7. Test results
8. Confirmation that nothing was deployed