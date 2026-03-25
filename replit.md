# Kids' Hotline Management Platform

## Overview

This is a subscription-based kids' hotline management platform designed for children's content. It enables parents to subscribe to a phone service offering stories and moderated group calls. The platform features a customer-facing subscription flow with integrated payments, a dashboard for managing phone numbers, and an admin panel for content management (audio, IVR menus, conference sessions, video, documents, and RSS feeds). The project aims to provide a safe and engaging audio-visual experience for children, with a focus on ease of use for parents and robust content management for administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application uses a monorepo architecture, separating the frontend and backend.

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack Query (server state), React Context (auth, theme).
- **UI Components**: shadcn/ui (built on Radix UI).
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode).
- **Form Handling**: React Hook Form with Zod validation.
- **Build Tool**: Vite.

### Backend
- **Framework**: Express.js with TypeScript.
- **Database ORM**: Drizzle ORM with PostgreSQL.
- **Session Management**: express-session with connect-pg-simple.
- **Authentication**: Session-based with bcryptjs for password hashing; JWT Bearer tokens for mobile.
- **File Uploads**: Multer for audio, Vimeo for video, Replit Object Storage for audio/document images/album art.
- **API Structure**: RESTful endpoints under `/api`.

### Content Management and Delivery
- **Video Architecture**:
    - Hosted and streamed via Vimeo.
    - Admin uploads directly to Vimeo, backend manages metadata.
    - Supports embedding private/unlisted videos with secure hashes.
    - Video thumbnails are managed and served by Vimeo.
- **Document Viewer Architecture**:
    - PDFs are converted to page-by-page PNG images on upload using `pdf-to-img`.
    - Images are stored in Replit Object Storage and displayed in a scrollable viewer.
- **Albums Architecture**:
    - Organizes audio tracks with cover art into distinct albums.
    - Album art and tracks stored in Replit Object Storage.
- **RSS Feed Architecture**:
    - Distributes audio content via an RSS podcast feed.
    - All audio is converted to MP3 64kbps mono using ffmpeg and stored in Replit Object Storage.
    - Supports hierarchical folder organization and manual reordering of audio items.
- **Audio Storage Architecture**:
    - ALL audio files (IVR/menu, media, RSS, albums) are stored in Replit Object Storage for persistence across deployments.
    - IVR/menu audio stored at `/objects/.private/audio/{uuid}.mp3`.
    - RSS audio stored at `/objects/.private/rss-audio/{filename}.mp3`.
    - Greeting stored at fixed path `/objects/.private/rss-audio/greeting.mp3`.
    - NEVER use local disk paths for audio storage — local files are wiped on every deployment.

### Announcement Banner
- Scrolling marquee displayed at the top of the subscriber dashboard when active.
- Admin manages via `/admin/announcement` — edits text and toggles visibility.
- Webhook endpoint `POST /api/webhook/announcement` allows external apps to update the banner using a secret key (`x-webhook-secret` header).
- Stored as a singleton row in the `site_announcement` DB table; webhook secret auto-generated on first use.

### Data Storage
- **Primary Database**: PostgreSQL, with schema defined using Drizzle ORM.
- **Key Tables**: `users`, `phoneNumbers`, `audioFiles`, `menuOptions`, `conferenceSessions`, `albums`, `albumTracks`, `rss_folders`, `rss_audio_items`, `videoCategories`, `site_announcement`.

### Authentication & Authorization
- **Web**: Session-based authentication stored in PostgreSQL.
- **Mobile Apps**: JWT Bearer token authentication (30-day expiry).
- Role-based access control (customer vs. admin).
- Hybrid authentication mechanism supporting both session and JWT.

### Mobile API
- Provides JWT-based authentication for mobile clients.
- All customer-facing endpoints support Bearer token authentication.
- **Audio/Video Playback**:
    - Supports background playback for both audio and video.
    - Video supports Picture-in-Picture (PiP) mode.
    - Requires appropriate mobile OS configurations for background media.

### Video Categories
- Supports hierarchical categorization of videos using `parentCategoryId` for main categories and subcategories.

## External Dependencies

### Third-Party Services
- **Stripe**: Payment processing and subscription management, integrated via `stripe-replit-sync` for webhooks and data synchronization.
- **Vimeo**: Video hosting and streaming.
- **Voitex.com**: Contact synchronization for active subscriber phone numbers.

### Database
- **PostgreSQL**: Primary relational database.

### Key NPM Packages
- `stripe`, `stripe-replit-sync`
- `drizzle-orm`, `drizzle-kit`
- `express-session`, `connect-pg-simple`
- `multer`
- `bcryptjs`
- `zod`

### Environment Variables
- `DATABASE_URL`
- `SESSION_SECRET` (critical for session and JWT)
- `VOITEX_AUTH_KEY` (optional)