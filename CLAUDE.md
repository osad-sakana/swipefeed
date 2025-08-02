# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

```bash
npm install          # Install dependencies
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run serve       # Serve production build
```

### Code Quality

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix ESLint issues
npm run typecheck   # Run TypeScript type checking
```

### Building

```bash
npm run build       # Build for production deployment
```

## Architecture Overview

### State Management Architecture

The app uses Context API with useReducer for centralized state management. The `AppContext` manages the entire
application state including feeds, articles, settings, and theme. All major state operations flow through the
context's action dispatchers (`markAsRead`, `addBookmark`, `refreshFeeds`, etc.).

### Service Layer Pattern

Three core services handle data operations:

- **DatabaseService**: IndexedDB operations using Dexie with promise-based transaction handling
- **RSSService**: RSS feed parsing, validation, and fetching with rss-parser and axios
- **StorageService**: localStorage operations for settings and app preferences

### Gesture-Based UI Architecture

The core UX revolves around swipe gestures implemented with framer-motion:

- **SwipeGesture**: Drag gesture wrapper that manages swipe detection, thresholds, and animations
- **SwipeUtils**: Configuration constants and calculation functions for swipe behavior
- Right swipe = mark as read, Left swipe = bookmark (configurable sensitivity)

### Navigation Structure

React Router with bottom tab navigation with 4 main screens:

- **SwipeScreen**: Main reading interface with full-screen article cards
- **FeedManagerScreen**: RSS feed CRUD operations with validation
- **BookmarksScreen**: Bookmarked articles list view
- **SettingsScreen**: Theme, font size, swipe sensitivity, and data management

### Data Flow

1. RSS feeds → RSSService.fetchFeed() → DatabaseService.saveArticles()
2. User actions → Context actions → Database updates → State updates
3. Swipe gestures → SwipeGesture → Action dispatch → Database + State update
4. Settings changes → StorageService → Context state update

## Key Configuration Points

### Swipe Behavior Customization

Modify `src/utils/swipeUtils.ts` SWIPE_CONFIG:

- `THRESHOLD`: Distance required to trigger action (default: 30% screen width)
- `VELOCITY_THRESHOLD`: Minimum swipe velocity for instant action
- `ANIMATION_DURATION`: Swipe animation timing

### Theme System

Themes defined in `src/context/AppContext.tsx` with light/dark variants. Theme switching updates entire app via
context. Colors follow iOS design system patterns.

### Database Schema

IndexedDB (via Dexie) tables:

- `feeds`: RSS feed metadata and status
- `articles`: Article content with read/bookmark/skip flags
- Indexed queries for performance optimization

## Module Path Resolution

Uses Vite's path alias with `@/` pointing to `src/`. All imports use this pattern for clean module resolution.

## Critical Dependencies

- **framer-motion**: Used for drag gestures and animations in SwipeGesture component
- **dexie**: IndexedDB wrapper for client-side database operations
- **styled-components**: CSS-in-JS styling solution
- **react-router-dom**: Client-side routing for single-page application

## State Management Patterns

Use the provided context actions rather than direct database calls. The context handles error states, loading
states, and ensures UI consistency. All async operations should dispatch loading states and handle errors
appropriately.

## RSS Feed Handling

RSSService includes URL normalization, feed validation, duplicate detection, and error handling. When adding new
feed sources, use the validation flow to ensure proper feed format before saving to database.

## Markdown Linting

### Code Quality Commands

```bash
npm run lint:md        # Check markdown files with markdownlint
npm run lint:md:fix    # Auto-fix markdown issues
```

### Markdown Configuration

- Uses markdownlint-cli for consistent markdown formatting
- Configuration in `.markdownlint.json` with line length limit of 120 characters
- Auto-fixing handles most formatting issues (headings spacing, fenced code blocks, lists)
- Manual fixes required for line length violations
