# RedVelvet - AI Companion Platform

## Overview
RedVelvet is a full-stack AI companion platform designed to offer personalized AI companions for engaging conversations and interactions. The platform includes both web and mobile (Android) applications, operating on a freemium model with premium subscription options and extensive companion customization features. The vision is to enable users to "Fall in Love, One Message at a Time..." by providing a sophisticated and intimate AI companion experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (server state), React hooks (local state)
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom themes (luxury gradient system: #FF5C8D → #E91E63 → #C41E3A)
- **Typography**: Google Fonts (Playfair Display for headings, Poppins for body)
- **Animations**: Framer Motion
- **Mobile UI**: Glass morphism effects, frosted backgrounds, WhatsApp-style chat interface, fixed header/footer, status bar integration
- **Cross-Platform**: Capacitor for Android APK generation, enabling shared codebase with web. Native mobile components created for complete separation of mobile and desktop UI/UX.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful with session-based authentication
- **Authentication**: Express sessions, Passport.js (local strategy, Google OAuth)
- **File Handling**: Multer for image uploads

### Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit
- **Memory System**: ChromaDB for conversation context and user preferences
- **Session Storage**: PostgreSQL
- **File Storage**: Local filesystem

### Core Features
- **AI Integration**: Anthropic Claude (claude-sonnet-4-20250514) for natural and personalized conversations. AI responses are influenced by customizable personality traits, relationship dynamics, conversation styles, emotional response levels, and interest topics.
- **Companion Customization**: Traits (caring, confidence, humor), gender, mood badges, intimate quotes. Image generation via Pollinations API for character portraits (512x512 pixels, center face). Supports photo albums with multiple image uploads.
- **User Management**: Email/password registration, Google OAuth, email verification (SendGrid), guest access (session-based with device fingerprinting).
- **Gamification & Monetization**: Freemium model with virtual "diamond" currency. Diamonds are used for premium features like message interactions and image generation. Welcome bonuses (25 diamonds) for new users. Subscription tiers for unlimited access. Device fingerprinting used for anti-farming measures and persistent diamond tracking across sessions and devices.
- **Mobile Platform**: Android APK generation via Capacitor, leveraging a local GUI with server API calls for dynamic data. Implemented comprehensive mobile-specific UI/UX for chat, navigation, and system bar handling.

## External Dependencies

### AI Services
- **Anthropic Claude**: For AI conversation generation.
- **Pollinations API**: For companion image generation.

### Authentication & Communication
- **Google OAuth**: For social login.
- **SendGrid**: For email verification and notifications.

### Payment Processing
- **PayPal SDK**: For premium subscription processing.

### Data & Development Tools
- **ChromaDB**: Vector database for AI memory management.
- **Drizzle ORM**: For PostgreSQL database interaction.
- **Vite**: Build tool and development server.

## Build Status & Deployment

### APK Build Ready (August 26, 2025)
- **Status**: All critical issues resolved, ready for production build
- **Solution**: GitHub Actions workflow (.github/workflows/build-apk.yml)
- **Server Status**: Live at https://red-velvet-connection.replit.app
- **Functionality**: AI chat responses and diamond tracking fully working
- **Recent Fixes**: 
  - InputStream import added (fixes Java compilation)
  - AI response parsing fixed (handles all server scenarios)
  - Duplicate workflows resolved (single clean build process)
  - Capacitor sync completed (fixes cordova.variables.gradle missing)
  - Web assets built and synchronized with Android
- **Build Options**: GitHub Actions (primary), Android Studio (local), online builders