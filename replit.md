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
- **Video Hosting**: Vimeo for video uploads and delivery
- **Audio Storage**: Replit Object Storage for audio files with permanent URLs
- **API Structure**: RESTful endpoints under `/api` prefix

The backend handles user authentication, subscription management, phone number registration, audio file management, IVR menu configuration, and video content management.

### Video Upload Architecture
- **Video Hosting**: Vimeo for reliable video delivery and automatic transcoding
- **Upload Flow**: 
  1. Admin uploads video directly to Vimeo via the admin panel
  2. Backend uses Vimeo API to manage video metadata and privacy settings
  3. Vimeo automatically transcodes video to multiple resolutions
  4. Videos are served using Vimeo's embedded iframe player with secure hash codes
- **Embed URL Format**: `https://player.vimeo.com/video/{id}?h={hash}&dnt=1` for private/unlisted videos
- **Key Files**: 
  - `server/vimeoService.ts` - Vimeo API service
  - Video schema includes `vimeoVideoId`, `vimeoHash`, `embedUrl` fields for Vimeo videos

### Thumbnail Architecture
- **Video Thumbnails**: Stored and served entirely from Vimeo (no local storage)
  - Custom thumbnails: Uploaded directly to Vimeo via their API
  - Reset to default: Uses Vimeo's auto-generated thumbnail from video frame
  - Thumbnail URLs stored in `thumbnailPath` field as Vimeo CDN URLs (https://i.vimeocdn.com/...)
- **Audio Thumbnails**: Stored in Replit's Object Storage
  - Uploaded via admin panel to object storage
  - Served through `/api/videos/:id/thumbnail` endpoint
  - Paths stored as `/objects/...` format
- **Key Endpoints**:
  - `POST /api/admin/videos/:id/thumbnail` - Upload thumbnail (Vimeo for videos, object storage for audio)
  - `DELETE /api/admin/videos/:id/thumbnail` - Reset to Vimeo default (videos) or clear (audio)
  - `GET /api/videos/:id/thumbnail` - Serve thumbnail (redirects to Vimeo or streams from object storage)

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

### Video Categories with Subcategories
- **Purpose**: Organize videos into hierarchical categories (main categories and subcategories)
- **Database Schema**: The `videoCategories` table has a `parentCategoryId` field
  - `parentCategoryId = null` → Main category (top-level)
  - `parentCategoryId = <uuid>` → Subcategory (belongs to parent)
- **API Endpoints**:
  - `GET /api/video-categories` - Returns all categories with `parentCategoryId` field
  - Categories with `parentCategoryId: null` are main categories
  - Categories with a `parentCategoryId` value are subcategories of that parent
- **Display Guidelines for Mobile Apps**:
  1. First, display only main categories (where `parentCategoryId` is null)
  2. When user selects/expands a main category, show its subcategories (where `parentCategoryId` matches the selected category's `id`)
  3. Subcategories should be visually indented or styled differently (e.g., with a "└" prefix or primary color styling)
  4. Videos can belong to either main categories or subcategories via their `categoryId` field
- **Example Response**:
  ```json
  [
    { "id": "cat-1", "name": "Stories", "parentCategoryId": null },
    { "id": "cat-2", "name": "Short Stories", "parentCategoryId": "cat-1" },
    { "id": "cat-3", "name": "Long Stories", "parentCategoryId": "cat-1" },
    { "id": "cat-4", "name": "Music", "parentCategoryId": null }
  ]
  ```
  In this example, "Stories" and "Music" are main categories. "Short Stories" and "Long Stories" are subcategories under "Stories".

### Background Audio/Video Playback Requirements
- **IMPORTANT**: The mobile app MUST support background playback for both audio and video content
- **Audio Playback**:
  - Audio files (albums, tracks) should continue playing when the app is in the background
  - Audio should continue playing when the device screen is locked
  - Use appropriate audio session category (e.g., iOS: AVAudioSessionCategoryPlayback, Android: MediaSession)
- **Video Playback**:
  - Videos should support Picture-in-Picture (PiP) mode
  - When user leaves the app or locks the screen, video audio should continue playing
  - On iOS: Enable Background Modes → Audio, AirPlay, and Picture in Picture
  - On Android: Use MediaSession API and enable PiP in manifest
- **Implementation Notes**:
  - Enable background audio capabilities in app configuration
  - Handle audio interruptions gracefully (phone calls, other apps)
  - Show media controls in lock screen and notification center
  - Support remote control events (play, pause, skip) from headphones/car bluetooth

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