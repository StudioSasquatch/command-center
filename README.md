# Command Center

**Kirby Holdings Mission Control**

Live at: https://hq.kirbyholdings.ltd

## Overview

A cinematic dashboard for tracking all of Jeremy's ventures, projects, and life priorities. Built by Noctis Aurelius.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Custom CSS
- **Animations**: Framer Motion
- **Fonts**: Orbitron (display), Syne (UI), JetBrains Mono (data)
- **Hosting**: Vercel
- **Domain**: hq.kirbyholdings.ltd

## Architecture

### Data Flow

```
Jeremy briefs Noctis
        ↓
Noctis updates src/lib/data.ts
        ↓
Git commit + Vercel deploy
        ↓
Dashboard reflects changes (~30s)
```

### File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── inbox/      # Inbox capture API
│   │   └── projects/   # Projects API
│   ├── project/[id]/   # Project detail pages
│   ├── globals.css     # Theme and styles
│   ├── layout.tsx      # Root layout + PWA config
│   └── page.tsx        # Main dashboard
├── components/
│   ├── Header.tsx
│   ├── QuickStats.tsx
│   ├── ProjectCard.tsx
│   ├── ActivityFeed.tsx
│   ├── CalendarWidget.tsx
│   └── InboxCapture.tsx
├── lib/
│   ├── data.ts         # ← NOCTIS UPDATES THIS
│   └── notify.ts       # Notification templates
└── types/
    └── index.ts
```

## Data File (src/lib/data.ts)

This is the single source of truth. Noctis updates this file when Jeremy provides briefings.

### Sections

- `projects` - Active ventures with status, progress, metrics
- `lifeProjects` - Protected personal time (golf, cards, gaming)
- `recentActivity` - Activity feed entries
- `quickStats` - Dashboard header stats
- `inboxItems` - Pending items to process
- `calendarEvents` - Upcoming events (synced from Google Calendar)

## Deployment

### Manual Deploy
```bash
cd command-center
vercel --prod
```

### Auto Deploy (GitHub)
Push to main branch → Vercel auto-deploys

## PWA

The dashboard is installable as a Progressive Web App:

1. Open https://hq.kirbyholdings.ltd on mobile
2. Tap "Add to Home Screen"
3. Access like a native app

## Future Enhancements

- [ ] Real-time sync via WebSocket
- [ ] Google Calendar integration (gog CLI)
- [ ] Telegram bot for quick updates
- [ ] Voice briefings via Noctis

---

Built with 🏛️ by Noctis Aurelius
