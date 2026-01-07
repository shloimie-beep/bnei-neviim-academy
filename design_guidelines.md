# Design Guidelines: Kids' Hotline Management Platform

## Design Approach

**Selected Approach:** Design System - Material Design Inspired
**Justification:** This is a utility-focused admin platform requiring clear information hierarchy, extensive forms, and dashboard views. Prioritizing functionality and usability over visual flair.

**Key Principles:**
- Clear information hierarchy for subscription management
- Intuitive admin workflows for non-technical users
- Kid-friendly yet professional aesthetic
- Efficient form completion and file upload processes

---

## Core Design Elements

### A. Typography
- **Primary Font:** Inter (Google Fonts) - clean, readable for forms and dashboards
- **Headings:** 
  - H1: text-4xl font-bold (Page titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-xl font-medium (Card titles, form sections)
- **Body:** text-base (Forms, descriptions, lists)
- **Small/Meta:** text-sm (Helper text, labels, timestamps)

### B. Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12
- Form field spacing: space-y-4
- Section padding: p-6 to p-8
- Card margins: gap-6 for grids
- Container max-width: max-w-6xl for dashboards, max-w-2xl for forms

**Grid Strategy:**
- Admin dashboards: 2-column responsive layouts (lg:grid-cols-2)
- File management: 3-column grid for audio files (md:grid-cols-2 lg:grid-cols-3)
- Conference monitoring: Single column list with expandable details

---

## Component Library

### Public Website Components

**1. Landing/Pricing Page**
- Hero: Simple centered layout with headline, subheadline, primary CTA
  - H1: "The Kids' Hotline" with engaging subtitle
  - Two CTA buttons: "Start Free Trial" (primary), "Learn More" (secondary)
- Pricing Cards: 2-column layout (Free Trial vs Monthly Subscription)
  - Card design with border, rounded corners, pricing prominently displayed
  - Feature lists with checkmarks
  - CTA button at bottom of each card
- Features Section: 3-column grid showcasing hotline capabilities
- FAQ Section: Accordion-style expandable items

**2. Account Creation Flow**
- Multi-step form with progress indicator (3 steps: Account → Payment → Confirmation)
- Form fields with clear labels above inputs, helper text below
- Phone number input with country code selector
- Stripe payment element integration
- Success confirmation with next steps

**3. Customer Dashboard**
- Top navigation: Logo left, user menu right
- Sidebar navigation: Dashboard, Subscription, Billing, Settings
- Main content area:
  - Subscription status card (active/trial, days remaining)
  - Phone number management section
  - Payment method card with edit button
  - Subscription action buttons (Update, Cancel)

### Admin Backend Components

**4. Admin Dashboard Layout**
- Horizontal top navigation with logo and admin user menu
- Main container with max-w-7xl
- Dashboard cards showing:
  - Active subscribers count
  - Conference call status
  - Recent audio uploads (last 5)
  - Quick action buttons

**5. Audio File Management**
- Upload section: Drag-and-drop zone with file input fallback
- File list: Grid of cards showing:
  - Audio filename with waveform preview icon
  - Duration display
  - Menu assignment dropdown (Main menu option number)
  - Edit/Delete actions
- Main menu configuration: Visual keypad showing which option maps to which audio

**6. Conference Call Control Panel**
- Live participants list with:
  - Phone number display (last 4 digits)
  - Mute status indicator (visual icon)
  - Individual mute/unmute toggle
  - Join time timestamp
- Global controls at top:
  - "Mute All" button (prominent, destructive style)
  - Active participants count
  - Call duration timer
- Unmute requests section: Queue of pending requests with approve/deny buttons

---

## Form Design Patterns

**Standard Input Fields:**
- Label above input (text-sm font-medium)
- Input with border, rounded corners, p-3
- Helper/error text below (text-sm)
- Consistent vertical spacing (space-y-2 for field groups)

**Buttons:**
- Primary: Solid background, white text, px-6 py-3
- Secondary: Outlined style, px-6 py-3
- Destructive: For cancel/delete actions
- Icon buttons: For inline actions (edit, delete)

**Cards:**
- Border with subtle shadow
- Rounded corners (rounded-lg)
- Padding p-6
- Header with title and optional action button

---

## Navigation Patterns

**Customer Portal:**
- Horizontal top nav with minimal items
- Mobile: Hamburger menu

**Admin Backend:**
- Persistent horizontal navigation
- Breadcrumb trail for sub-sections
- Action buttons aligned right in page headers

---

## Responsive Behavior

- Mobile-first approach
- Forms: Full-width on mobile, centered max-w-md on desktop
- Admin grids: Stack to single column on mobile
- Conference panel: Collapsible sections on mobile
- Navigation: Hamburger menu below md breakpoint

---

## Images

**Landing Page Hero:**
- Optional: Cheerful illustration of kids using phones/listening (placed right side of hero on desktop, above text on mobile)
- Style: Friendly, colorful, safe for kids aesthetic

**Dashboard Illustrations:**
- Empty states: Friendly illustrations when no subscribers/audio files exist
- Success states: Small celebratory icons after completing actions