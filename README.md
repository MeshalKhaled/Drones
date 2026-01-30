# Drone Fleet Management Dashboard

A production-grade drone fleet management and monitoring system built with Next.js 14+ App Router, featuring real-time telemetry, mission planning, analytics, and live map visualization.

## 🚀 Tech Stack

### Core Framework

- **Next.js 14+** (App Router) - React framework with Server Components, Route Handlers, and Server Actions
- **TypeScript** (strict mode) - Type safety with `noImplicitAny`, `strictNullChecks`, and comprehensive Zod validation
- **Tailwind CSS** - Utility-first styling with custom design tokens

### State Management

- **@tanstack/react-query** - Server state management, polling, caching, and optimistic updates
- **Zustand** - Lightweight UI state (view modes, panel states, selections)

### Data & Validation

- **Zod** - Runtime type validation for API requests/responses and form data
- **Type-safe API client** - Centralized fetch utilities with automatic error handling

### UI/UX Libraries

- **Mapbox GL JS** - Interactive maps with GeoJSON sources, custom layers, and real-time updates
- **Recharts** - Responsive, accessible charts for analytics
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Consistent icon system
- **Sonner** - Toast notifications
- **@dnd-kit** - Drag & drop for waypoint reordering

### Performance

- **next/dynamic** - Code splitting and lazy loading for heavy components (Mapbox)
- **next/image** - Optimized image loading with automatic WebP conversion
- **next/font** - Self-hosted fonts (Inter) for performance
- **React Window** (installed, ready for large lists)

## 📁 Architecture

### Project Structure

```
drones/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard route group
│   │   ├── fleet/         # Fleet overview page
│   │   ├── map/           # Live map view
│   │   ├── missions/      # Missions list & planning
│   │   ├── drones/[id]/   # Drone detail pages
│   │   └── analytics/     # Analytics dashboard
│   ├── api/               # API route handlers
│   └── actions/           # Server Actions
├── components/            # React components
│   ├── analytics/         # Analytics charts
│   ├── drones/            # Drone-specific components
│   ├── fleet/             # Fleet page components
│   ├── map/               # Map components
│   ├── mission/           # Mission components
│   ├── layout/            # Layout components
│   ├── providers/         # Context providers
│   └── ui/                # Reusable UI primitives
├── hooks/                 # Custom React hooks
│   ├── data/             # Data fetching hooks
│   ├── ui/               # UI state hooks
│   └── utils/            # Utility hooks
├── lib/                   # Shared libraries
│   ├── api/              # API client
│   ├── domain/           # Domain types & schemas
│   ├── stores/           # State stores (Zustand + globalThis)
│   └── utils/            # Utility functions
├── services/             # Business logic
│   └── mock-data.ts      # Mock data & simulation
├── public/               # Static assets
├── docs/                 # Documentation
├── tooling/              # Dev tooling configs
│   ├── .storybook/       # Storybook config
│   ├── stories/          # Storybook stories
│   └── sentry.*.config.ts # Sentry configs
└── __tests__/            # Unit & integration tests
```

### Server Components by Default

Next.js 14+ App Router uses Server Components by default, providing:

- **Zero client JavaScript** for static content
- **Direct database/API access** without client-side fetch
- **Automatic code splitting** and streaming with Suspense
- **SEO-friendly** server-rendered HTML

### Client Components (`"use client"`)

Only used when necessary:

- Interactive UI (buttons, inputs, drag & drop)
- Browser APIs (Mapbox GL JS, window events)
- React hooks (`useState`, `useEffect`, `useQuery`)
- Real-time updates (React Query polling)

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Server Components                     │
│  (page.tsx, loading.tsx, error.tsx, table components)  │
│  - Direct data fetching                                 │
│  - Server Actions for mutations                         │
│  - Suspense boundaries for streaming                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Route Handlers (/api/*)                     │
│  - Typed request/response validation (Zod)              │
│  - Latency simulation (200-500ms)                      │
│  - Error simulation (5% failure rate)                   │
│  - In-memory mock data                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Client Components                           │
│  - React Query for polling server state                 │
│  - Zustand for UI state (panels, selections)           │
│  - Optimistic UI with useOptimistic                     │
│  - Throttled map updates (250ms)                        │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Design System

### Color Palette (Dark Theme)

All colors defined as HSL CSS variables in `app/globals.css`:

- **Background**: `hsl(240 10% 3.9%)` - Near black
- **Surface/Card**: `hsl(240 10% 3.9%)` - Slightly lighter for cards
- **Foreground**: `hsl(0 0% 98%)` - Primary text
- **Muted**: `hsl(240 5% 64.9%)` - Secondary text
- **Border**: `hsl(240 3.7% 15.9%)` - Subtle borders
- **Primary**: `hsl(217 91% 60%)` - Blue (#60a5fa) for actions
- **Status Colors**:
  - Online: `hsl(142 76% 36%)` - Green (#4ade80)
  - In-Mission: `hsl(217 91% 60%)` - Blue (#60a5fa)
  - Charging: `hsl(43 96% 56%)` - Amber (#fbbf24)
  - Offline: `hsl(0 84% 60%)` - Red (#f87171)

### Typography

- **Font**: Inter (self-hosted via `next/font`)
- **Base size**: 16px (1rem)
- **Scale**: Tailwind's default scale (text-xs to text-6xl)
- **Line height**: Default (1.5)

### Spacing

- **Base unit**: 4px (Tailwind default)
- **Common gaps**: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px)
- **Padding**: `p-4` (16px) for cards, `p-6` (24px) for sections

### Components

- **Border radius**: `0.5rem` (8px) - `rounded-md`
- **Focus ring**: `ring-2 ring-ring ring-offset-2` for accessibility
- **Skeleton loading**: Pulse animation with `animate-pulse`

## 📄 Features Implemented

### ✅ Fleet Overview (`/fleet`)

- Grid/list view toggle (Zustand state)
- Search with debouncing (250ms)
- Status filters (online, offline, charging, in-mission)
- Sort dropdown (name, status, battery, flight hours)
- Drone cards with images, status badges, battery indicators
- Metrics table with pagination
- React Query polling (5s interval) with `keepPreviousData`
- Loading skeletons (no spinners)
- Error boundary with retry

### ✅ Live Map View (`/map`)

- Full-screen Mapbox GL JS map
- Real-time telemetry updates (1s polling, 250ms throttled map updates)
- Status-colored markers (20+ drones)
- Hover tooltips with drone info
- Click marker → telemetry side panel
- Flight path trails (last 30 points per drone)
- Map controls (zoom, center-to-fleet, layer toggles)
- Legend with status indicators
- Dynamic import (`ssr: false`) for Mapbox
- Environment guard for Mapbox token
- Loading skeleton (no spinner)
- Error boundary with retry

### ✅ Mission Planning (`/missions/new`)

- Interactive map for waypoint placement
- Click-to-add waypoints (minimum 5 required)
- Visual path preview (polyline)
- Drag & drop waypoint reordering (@dnd-kit)
- Waypoint editor (altitude, speed, action)
- Mission summary (distance, duration, validation)
- Client-side Zod validation (only shows errors after save attempt)
- Server Action for mission creation (`createMissionAction`)
- Optimistic UI with `useOptimistic`
- Post-save navigation to `/missions`
- Loading skeleton
- Error boundary

### ✅ Missions List (`/missions`)

- Server-rendered table with pagination
- Search (mission ID/name)
- Filter by status (pending, in-progress, completed, failed)
- Sort (startDate, status)
- Links to drone detail pages
- "New Mission" button
- Loading skeleton
- Error boundary

### ✅ Analytics Dashboard (`/analytics`)

- Time range selector (24h, 7d, 30d)
- Total flight hours card
- Battery health trends (LineChart)
- Mission success rate (PieChart)
- Active vs inactive drones (BarChart)
- Server-side parallel data fetching (`Promise.all`)
- Suspense boundaries for streaming
- Loading skeletons
- Error boundary

### ✅ Drone Detail View (`/drones/[id]`)

- Server-rendered drone profile (name, status, battery, flight hours, health)
- Live telemetry card (1s polling)
- Mission history table (server-side pagination)
- Command panel (ARM, TAKEOFF, LAND, RTL) via Server Actions
- Optimistic UI for commands
- Photo/asset gallery with lightbox
- `generateStaticParams` for first 10 drones (ISR)
- Loading skeleton
- Error boundary

## 🔧 Next.js Features Used

### Route Handlers (`/app/api/*`)

- Typed request/response validation with Zod
- Consistent error envelopes (`{ data, error, meta }`)
- Latency simulation (200-500ms)
- Error simulation (5% failure rate)

### Server Actions (`/app/actions/*`)

- `"use server"` directive for mutations
- Zod validation on server
- `revalidatePath` for cache invalidation
- Optimistic UI support via `useOptimistic`

### Suspense & Streaming

- `<Suspense>` boundaries for progressive loading
- Parallel data fetching with `Promise.all`
- Loading skeletons (not spinners)

### Image Optimization

- `next/image` with `priority` for LCP images
- Automatic WebP conversion
- Responsive sizing

### Font Optimization

- `next/font` for Inter (self-hosted, zero layout shift)

### Dynamic Imports

- `next/dynamic` with `ssr: false` for Mapbox GL JS
- Code splitting for heavy client components

## 🛠️ Setup

### Prerequisites

- **Node.js 18+** and npm/yarn/pnpm
- **Mapbox Access Token** (free tier available at [mapbox.com](https://www.mapbox.com))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd drones

# Install dependencies
npm install

# Set up environment variables
# Create .env.local file and add:
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### Development

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

The application will automatically redirect to `/fleet` on startup.

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Lint
npm run lint
npm run lint:strict  # Fail on warnings

# Format code
npm run format
npm run format:check  # Check without formatting

# Run tests
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage report

# Full verification
npm run verify  # Runs all checks + tests + build
```

### Storybook

```bash
# Start Storybook dev server
npm run storybook

# Build Storybook
npm run build-storybook
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze
```

## 📊 API Endpoints

All endpoints return typed JSON with consistent envelopes:

```typescript
{
  data: T | null,
  error: { code: string; message: string } | null,
  meta?: { total?: number; page?: number; pageSize?: number; totalPages?: number }
}
```

### `GET /api/drones`

Query parameters:

- `search` (string): Search by name or ID
- `status` (`online` | `offline` | `charging` | `in-mission`): Filter by status
- `sort` (`name` | `status` | `batteryPct` | `updatedAt`): Sort order
- `id` (UUID): Fetch single drone by ID

### `GET /api/missions`

Query parameters:

- `droneId` (UUID): Filter by drone ID
- `search` (string): Search by mission ID or name
- `status` (`pending` | `in-progress` | `completed` | `failed` | `cancelled`): Filter by status
- `sort` (`startDate` | `status`): Sort order
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 20, max: 100)

### `GET /api/telemetry`

Query parameters:

- `droneId` (UUID): Get telemetry for specific drone
- `scope` (`fleet`): Get telemetry for all active drones

### `GET /api/analytics`

Query parameters:

- `range` (`24h` | `7d` | `30d`): Time range for aggregation

## 🎯 Architecture Decisions

### Why Server Components by Default?

- **Performance**: Zero client JS for static content
- **SEO**: Server-rendered HTML
- **Security**: Sensitive logic stays on server
- **Cost**: Reduced client bundle size

### Why React Query for Server State?

- **Polling**: Built-in `refetchInterval` for real-time updates
- **Caching**: Automatic request deduplication and cache management
- **Optimistic Updates**: `keepPreviousData` prevents UI flicker
- **Error Handling**: Centralized retry logic

### Why Zustand for UI State?

- **Lightweight**: ~1KB vs Redux's ~10KB
- **Simple API**: No boilerplate, direct state updates
- **TypeScript**: Excellent type inference
- **Separation**: UI state (panels, selections) separate from server state

### Why Zod for Validation?

- **Type Safety**: Generate TypeScript types from schemas
- **Runtime Safety**: Validate API responses and form inputs
- **Error Messages**: Detailed validation errors
- **Single Source of Truth**: One schema for client and server

### Why Mapbox GL JS?

- **Performance**: WebGL rendering for 20+ markers
- **GeoJSON Sources**: Efficient updates via `source.setData()`
- **Custom Layers**: Full control over styling and interactions
- **Throttling**: Client-side throttling (250ms) prevents render storms

## ⚡ Performance Optimizations

1. **Map Updates**: Throttled to 250ms, using `source.setData()` instead of React re-renders
2. **Code Splitting**: Dynamic imports for Mapbox (`ssr: false`)
3. **Image Optimization**: `next/image` with `priority` for LCP
4. **Parallel Fetching**: `Promise.all` for analytics data
5. **Memoization**: `useMemo` for derived state (distances, durations)
6. **Stable Handlers**: `useCallback` to prevent unnecessary re-renders
7. **Suspense Streaming**: Progressive loading with skeleton states

## ♿ Accessibility

- **Semantic HTML**: `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`
- **ARIA Labels**: `aria-label`, `aria-current="page"`, `aria-expanded`
- **Keyboard Navigation**: Focus rings, tab order, keyboard shortcuts
- **Screen Reader Support**: Descriptive labels, hidden decorative icons (`aria-hidden="true"`)
- **Color Contrast**: WCAG AA compliant status colors
- **Focus Management**: Visible focus indicators (`focus-visible`)

## 🧪 Testing

The project includes unit tests using Vitest and component stories using Storybook.

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Coverage

Current test coverage includes:
- Store logic (drone-store, mission-store)
- Utility functions (logger, formatters)
- Touch gesture hooks

### Storybook

Component stories are available for visual testing and documentation:

```bash
npm run storybook
```

Stories are located in `tooling/stories/stories/` and cover:
- Analytics charts
- Command panels
- Drone cards
- UI components

## 🐛 Known Limitations

1. **Mock Data**: All data is in-memory (no database) - uses `globalThis` stores for persistence across HMR
2. **No Authentication**: No user accounts or permissions
3. **No Real Telemetry**: Simulated movement and battery drain via `services/mock-data.ts`
4. **No WebSocket**: Polling-based updates (not real-time streaming) - uses React Query with adaptive polling
5. **No Image Upload**: Placeholder images only
6. **Mission Execution**: Mission planning and simulation only (no actual flight control)
7. **Error Recovery**: Basic retry logic with exponential backoff in React Query
8. **Table Virtualization Accessibility**: Large tables (50+ rows) use `react-window` virtualization for performance. The header remains accessible, but screen reader users may need to scroll to access rows not currently visible in the viewport. Small tables (<50 rows) use standard HTML tables for full accessibility.

## ⏱️ Time Breakdown

- **Phase 1 (Foundation)**: ~4 hours
  - Project setup, types, mock APIs, layout, providers
- **Phase 2 (Fleet Page)**: ~3 hours
  - Grid/list views, search, filters, polling
- **Phase 3 (Map Page)**: ~5 hours
  - Mapbox integration, telemetry polling, throttling, tooltips
- **Phase 4 (Mission Planning)**: ~4 hours
  - Map interaction, drag & drop, validation, Server Actions
- **Phase 5 (Analytics)**: ~3 hours
  - Charts, aggregation, time ranges, Suspense streaming
- **Phase 6 (Drone Detail)**: ~4 hours
  - Profile, telemetry, commands, mission history, gallery
- **Phase 7 (Missions List)**: ~2 hours
  - Table, filters, pagination, Server Components
- **Phase 8 (QA & Polish)**: ~3 hours
  - Error boundaries, accessibility, design system, README

**Total**: ~28 hours

## 🎓 Challenges Faced

1. **Mapbox Rendering**: Initial black screen due to missing container dimensions
   - **Solution**: Explicit height/width via Tailwind and inline styles, `requestAnimationFrame` retry loop

2. **Telemetry Validation**: Zod errors for `gpsQuality` out of bounds
   - **Solution**: Clamped values in `generateTelemetry` to `[0, 100]`

3. **Mission Visibility**: New missions not appearing in list after creation
   - **Solution**: Shared in-memory store (`lib/mission-store.ts`) accessed by both Server Actions and API routes

4. **Validation UX**: Errors showing immediately, too intrusive
   - **Solution**: `hasAttemptedSave` state, errors only shown after save attempt

5. **Server Component Types**: `params` and `searchParams` are `Promise` in Next.js 14
   - **Solution**: Made page components `async` and `await` params

6. **Map Performance**: Render storms with 20+ drones updating every second
   - **Solution**: Throttled updates (250ms), `source.setData()` instead of React re-renders

## 🚀 Future Enhancements

1. **Real Backend**: Replace mock APIs with PostgreSQL/Prisma or REST API
2. **WebSocket**: Real-time telemetry streaming instead of polling
3. **Authentication**: NextAuth.js with role-based access control
4. **Mission Execution**: Actual flight control integration
5. **Image Upload**: S3/Cloudinary integration for drone photos
6. **Advanced Analytics**: More charts, export to CSV/PDF
7. **Notifications**: Push notifications for mission status changes
8. **Mobile App**: React Native companion app
9. **E2E Testing**: Playwright for end-to-end tests
10. **CI/CD**: Enhanced GitHub Actions workflows
11. **Monitoring**: Enhanced Sentry integration, Vercel Analytics
12. **Documentation**: Expanded Storybook stories, API documentation

## 📚 Additional Documentation

- **Architecture**: See `docs/ARCHITECTURE.md` for detailed architecture decisions
- **Structure**: See `docs/STRUCTURE.md` for directory structure details
- **Codebase Documentation**: See `CODEBASE_DOCUMENTATION.md` for complete file-by-file documentation

## 🔒 Security

- Security headers configured in `middleware.ts` (CSP, XSS protection, HSTS)
- Environment variables for sensitive data (Mapbox token)
- No secrets in codebase
- Input validation with Zod schemas
- Type-safe API client prevents injection attacks

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write tests for new features
- Update documentation
- Follow the existing code style

## 🙏 Acknowledgments

- **Next.js** team for the excellent App Router
- **Mapbox** for powerful mapping capabilities
- **TanStack** for React Query
- **Vercel** for hosting and deployment
- All open-source contributors

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.
