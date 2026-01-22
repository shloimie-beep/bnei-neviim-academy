# Kids' Hotline Management Platform

## Overview

This is a subscription-based kids' hotline management platform that allows parents to subscribe to a phone service featuring stories and moderated group calls for children. The platform includes a customer-facing subscription flow with Stripe payments, a customer dashboard for managing phone numbers, and an admin panel for managing audio files, IVR menus, and conference sessions.

The application follows a monorepo structure with a React frontend and Express backend, using PostgreSQL for data persistence and Stripe for payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state, React Context for auth and theme
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

The frontend follows a page-based structure with protected routes for authenticated users and admin-only routes. Components are organized into UI primitives (`components/ui/`) and feature-specific components.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **Authentication**: Session-based auth with bcryptjs for password hashing
- **File Uploads**: Multer for audio file handling
- **Video Hosting**: Bunny Stream CDN for video uploads and delivery
- **API Structure**: RESTful endpoints under `/api` prefix

The backend handles user authentication, subscription management, phone number registration, audio file management, IVR menu configuration, and video content management.

### Video Upload Architecture
- **Video Hosting**: Bunny Stream CDN for reliable video delivery and automatic transcoding
- **Upload Flow**: 
  1. Admin creates video on Bunny Stream via `/api/admin/videos/bunny/create`
  2. Frontend uploads directly to Bunny CDN using the returned upload URL
  3. Backend finalizes record via `/api/admin/videos/bunny/finalize`
  4. Bunny automatically transcodes video to multiple resolutions
  5. Backend polls Bunny API to update video status when ready
- **Playback**: Uses Bunny's embedded iframe player for new videos, legacy videos still stream from original storage
- **Domain Restriction**: Bunny library settings allow domain restrictions to prevent unauthorized video sharing
- **Max Size**: Up to 10GB video files supported
- **Key Files**: 
  - `server/bunnyStream.ts` - Bunny Stream API service
  - Video schema includes `bunnyGuid`, `bunnyVideoId`, `storageType` fields for Bunny videos
- **Legacy Support**: Videos without `bunnyGuid` continue to use local/cloud storage streaming

### Document Viewer Architecture
- **Processing Flow**: PDFs are converted to page images on upload for better viewing
- **Upload Flow**:
  1. Admin uploads PDF document
  2. Document created with status "processing"
  3. Backend converts each PDF page to PNG images using pdf-to-img library
  4. Page images uploaded to object storage
  5. Document updated with page image paths and status "ready"
- **Viewing**: DocumentViewer component displays pages as scrollable images with zoom controls
- **Polling**: Viewer polls every 2 seconds while document status is "processing"
- **Key Files**:
  - `server/pdfConverter.ts` - PDF to image conversion service
  - `client/src/components/document-viewer.tsx` - Image-based document viewer
  - Documents schema includes `pageImages` array and `status` field

### Albums Architecture
- **Purpose**: Organize multiple audio tracks into albums with cover art
- **Display**: Albums appear in their own dedicated "Albums" section in the customer portal (not mixed with video categories)
- **Database Tables**:
  - `albums` - Album metadata (title, description, thumbnail, status)
  - `albumTracks` - Individual audio tracks with track numbers and Bunny CDN storage
- **Storage**:
  - Album thumbnails: Object storage (uploaded by hovering over album image)
  - Audio tracks: Bunny CDN at `album-tracks/{albumId}/{timestamp}.mp3`
- **Admin Endpoints**:
  - `GET/POST /api/admin/albums` - List and create albums
  - `PATCH/DELETE /api/admin/albums/:id` - Update and delete albums
  - `POST /api/admin/albums/:id/thumbnail` - Upload album cover image
  - `GET/POST /api/admin/albums/:id/tracks` - List and add tracks
  - `PATCH/DELETE /api/admin/albums/:albumId/tracks/:trackId` - Update and delete tracks
- **Customer Endpoints**:
  - `GET /api/albums` - List published albums with track counts
  - `GET /api/albums/:id` - Get album with all tracks
  - `GET /api/albums/:id/thumbnail` - Stream album cover image
  - `GET /api/albums/:albumId/tracks/:trackId/stream` - Stream track audio (redirects to Bunny CDN)
- **Key Files**:
  - `client/src/pages/admin/albums.tsx` - Admin album management UI
  - Album schema in `shared/schema.ts` with CASCADE delete for tracks

### RSS Feed Architecture
- **Purpose**: Distribute audio content via RSS podcast feed with folder organization
- **Audio Conversion**: All uploads automatically converted to MP3 64kbps using ffmpeg, originals deleted after conversion
- **Storage**: Local filesystem at `uploads/rss-audio/` with permanent URLs
- **Database Tables**:
  - `rss_folders` - Folder organization for audio items
  - `rss_audio_items` - Audio files with metadata, sortOrder, and folder association
- **Ordering**: sortOrder ASC (lower = higher priority), then createdAt DESC (newest first by default)
- **Admin Endpoints**:
  - `GET/POST /api/admin/rss-folders` - List and create folders
  - `PATCH/DELETE /api/admin/rss-folders/:id` - Update and delete folders (cascade deletes audio files)
  - `GET/POST /api/admin/rss-audio` - List and upload audio
  - `PATCH/DELETE /api/admin/rss-audio/:id` - Update and delete audio
  - `PATCH /api/admin/rss-audio/:id/reorder` - Adjust sortOrder for manual ordering
- **Public Endpoints**:
  - `GET /rss/feed.xml` - RSS 2.0 podcast feed with iTunes namespace
  - `GET /api/rss-audio/:id/stream` - Stream converted MP3 audio
- **Key Files**:
  - `server/audioConverter.ts` - ffmpeg-based MP3 64kbps conversion
  - `client/src/pages/admin/rss-feed.tsx` - Admin RSS feed management UI

### Data Storage
- **Primary Database**: PostgreSQL
- **Schema Location**: `shared/schema.ts` using Drizzle ORM
- **Key Tables**:
  - `users` - Customer and admin accounts with Stripe integration
  - `phoneNumbers` - Phone numbers linked to subscriptions
  - `audioFiles` - Uploaded audio content (greetings, stories, menus)
  - `menuOptions` - IVR menu configuration
  - `conferenceSessions` - Group call sessions
  - `conferenceParticipants` - Call participants tracking
  - `callLogs` - Call history and analytics
  - `albums` - Audio albums with metadata and thumbnails
  - `albumTracks` - Individual tracks within albums (Bunny CDN storage)

### Authentication & Authorization
- **Web (Browser)**: Session-based authentication stored in PostgreSQL
- **Mobile Apps**: JWT Bearer token authentication with 30-day expiry
- Role-based access control (customer vs admin)
- Protected routes on both frontend and backend
- Middleware pattern for route protection (`requireAuth`, `requireAdmin`)
- Hybrid auth via `getAuthUserId()` helper supports both session and Bearer tokens

### Mobile API
- **Key File**: `server/mobileAuth.ts` - JWT token generation and verification
- **Endpoints**:
  - `POST /api/mobile/login` - Login with email/password, returns JWT token
  - `GET /api/mobile/me` - Get current user with Bearer token
  - `POST /api/mobile/refresh-token` - Refresh JWT before expiry
  - `GET /api/mobile/info` - API documentation for mobile developers
- **Token Expiry**: 30 days (configurable in mobileAuth.ts)
- **All customer endpoints** support Bearer token auth (videos, audio, documents, phone numbers)
- **Security**: JWT secret derived from SESSION_SECRET (required environment variable)

### Payment Integration
- **Stripe Integration**: Uses `stripe-replit-sync` package for webhook handling and data synchronization
- **Subscription Model**: $9.99/month with 14-day free trial
- **Webhook Processing**: Handles checkout completion, subscription updates, and cancellations
- **Stripe Schema**: Separate `stripe` schema in PostgreSQL for synced Stripe data

## External Dependencies

### Third-Party Services
- **Stripe**: Payment processing and subscription management
  - Configured via Replit Connectors for API credentials
  - Supports both development and production environments
  - Webhook endpoint for real-time event processing

### Database
- **PostgreSQL**: Primary data store
  - Connection via `DATABASE_URL` environment variable
  - Drizzle ORM for type-safe queries
  - Migrations managed via `drizzle-kit push`

### Key NPM Packages
- `stripe` - Stripe API client
- `stripe-replit-sync` - Stripe webhook handling and data sync
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `express-session` / `connect-pg-simple` - Session management
- `multer` - File upload handling
- `bcryptjs` - Password hashing
- `zod` - Schema validation (shared between frontend and backend)

### Voitex Contact Sync Integration
- **Purpose**: Automatically syncs active subscriber phone numbers to Voitex.com contacts
- **Key File**: `server/voitexService.ts` - Voitex API service
- **API Endpoint**: `https://contacts.voitexapi.com/` for contact management
- **Automatic Sync Events**:
  - When checkout completes → Creates/updates contact in Voitex
  - When subscription is deleted → Removes contact from Voitex
  - Trial cancellations are immediate (no waiting for period end)
- **Admin Manual Sync**: POST `/api/admin/subscribers/sync-voitex` to sync all active subscribers
- **UI**: "Sync to Voitex" button in Admin Subscribers page

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - **Required** for both session cookies and JWT token signing
- `BUNNY_API_KEY` - Bunny Stream API key for video management
- `BUNNY_LIBRARY_ID` - Bunny Stream library ID
- `VOITEX_AUTH_KEY` - Voitex API authentication key for contact sync (optional)
- Stripe credentials managed via Replit Connectors (auto-configured)
- `REPL_IDENTITY` / `WEB_REPL_RENEWAL` - Replit authentication tokens