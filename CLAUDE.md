# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

```bash
npm install          # Install dependencies
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator/device
npm run web         # Run on web browser
```

### Code Quality

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix ESLint issues
npm run typecheck   # Run TypeScript type checking
npm test           # Run Jest tests
```

### Building

```bash
eas build --platform ios      # Build for iOS
eas build --platform android  # Build for Android
```

## Architecture Overview

### State Management Architecture

The app uses Context API with useReducer for centralized state management. The `AppContext` manages the entire
application state including feeds, articles, settings, and theme. All major state operations flow through the
context's action dispatchers (`markAsRead`, `addBookmark`, `refreshFeeds`, etc.).

### Service Layer Pattern

Three core services handle data operations:

- **DatabaseService**: SQLite operations using expo-sqlite with promise-based transaction handling
- **RSSService**: RSS feed parsing, validation, and fetching with rss-parser and axios
- **StorageService**: AsyncStorage operations for settings and app preferences

### Gesture-Based UI Architecture

The core UX revolves around swipe gestures implemented with react-native-gesture-handler and react-native-reanimated:

- **SwipeGesture**: PanGestureHandler wrapper that manages swipe detection, thresholds, and animations
- **SwipeUtils**: Configuration constants and calculation functions for swipe behavior
- Right swipe = mark as read, Left swipe = bookmark (configurable sensitivity)

### Navigation Structure

Bottom tab navigation with 4 main screens:

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

SQLite tables:

- `feeds`: RSS feed metadata and status
- `articles`: Article content with read/bookmark/skip flags
- Foreign key relationships with cascading deletes

## Module Path Resolution

Uses babel-plugin-module-resolver with `@/` alias pointing to `src/`. All imports use this pattern for clean
module resolution.

## Critical Dependencies

- **react-native-reanimated**: Must be imported as first line in gesture components
- **expo-sqlite**: Requires expo plugin configuration in app.json
- **react-native-gesture-handler**: Needs GestureHandlerRootView wrapper in App.tsx

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
