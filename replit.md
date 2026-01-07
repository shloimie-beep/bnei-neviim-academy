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
- **API Structure**: RESTful endpoints under `/api` prefix

The backend handles user authentication, subscription management, phone number registration, audio file management, and IVR menu configuration.

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

### Authentication & Authorization
- Session-based authentication stored in PostgreSQL
- Role-based access control (customer vs admin)
- Protected routes on both frontend and backend
- Middleware pattern for route protection (`requireAuth`)

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

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- Stripe credentials managed via Replit Connectors (auto-configured)
- `REPL_IDENTITY` / `WEB_REPL_RENEWAL` - Replit authentication tokens