# RedVelvet - AI Companion Platform

## Overview

RedVelvet is a full-stack AI companion platform that provides users with personalized AI companions for meaningful conversations and interactions. The system features both web and mobile (Android) applications with freemium access, premium subscriptions, and sophisticated companion customization capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom theme support
- **Animations**: Framer Motion for smooth transitions and interactions
- **Mobile Support**: Capacitor for Android APK generation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with session-based authentication
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Passport.js with local strategy and Google OAuth
- **File Handling**: Multer for companion image uploads

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations
- **Memory System**: ChromaDB for conversation context and user preferences
- **Session Storage**: PostgreSQL-backed session store
- **File Storage**: Local filesystem for uploaded images

## Key Components

### Companion System
- **AI Integration**: Anthropic Claude (claude-sonnet-4-20250514) for natural conversations
- **Personality System**: Customizable traits (caring, confidence, humor, etc.)
- **Gender Support**: Male and female companions with preference filtering
- **Image Generation**: Pollinations API for character-consistent portraits
- **Memory Management**: Persistent conversation history and user preferences

### User Management
- **Authentication**: Username/password and Google OAuth
- **Email Verification**: SendGrid integration with token-based verification
- **Guest Support**: Session-based access with device fingerprinting
- **Premium Tiers**: Subscription management with PayPal integration

### Gamification & Monetization
- **Diamond System**: Virtual currency for premium features
- **Welcome Bonuses**: 25 diamonds for new registrations
- **Message Costs**: Diamond deduction for interactions
- **Image Generation**: Premium feature requiring diamonds
- **Device Tracking**: Anti-farming measures across platforms

### Mobile Platform
- **Android Support**: Capacitor-based APK generation
- **Cross-Platform**: Shared codebase between web and mobile
- **Device Fingerprinting**: Consistent user tracking across platforms
- **Offline Capability**: Local storage for session persistence

## External Dependencies

### AI Services
- **Anthropic Claude**: Primary conversation AI
- **Pollinations API**: Free image generation service

### Authentication & Communication
- **Google OAuth**: Social login integration
- **SendGrid**: Email verification and notifications
- **PayPal SDK**: Premium subscription processing

### Development Tools
- **Vite**: Build system and development server
- **Drizzle**: Database ORM and migration management
- **ChromaDB**: Vector database for memory management

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 provisioned module
- **Port Configuration**: 5000 (internal) → 80 (external)
- **Hot Reload**: Vite development server with HMR

### Production Build
- **Build Process**: Vite for client, esbuild for server
- **Deployment Target**: Autoscale infrastructure
- **Static Assets**: Served via Express with proper caching
- **Environment Variables**: Secure credential management

### Android Distribution
- **Build System**: Capacitor with Android Studio integration
- **APK Generation**: Automated script with Gradle
- **Signing**: Debug builds for development, release builds for production

## Changelog

### Critical Issues Resolved (January 2025)
- **AI Bot Fixed**: Verified working with reliable responses and diamond deduction (25→24→23)
- **Back Button Fixed**: Proper Android navigation with state cleanup and crash prevention
- **Device System**: Anti-abuse diamond tracking per device with PostgreSQL storage
- **Mobile API**: Complete endpoint testing confirmed functionality

### Codebase Optimization (January 27, 2025)
- **Cleanup Complete**: Removed 30+ redundant documentation files
- **Build Scripts**: Simplified to single production-ready build-apk.sh
- **Asset Cleanup**: Removed debugging files and test artifacts
- **Structure Simplified**: Clean, maintainable codebase focused on core functionality

## User Preferences

Preferred communication style: Simple, everyday language.