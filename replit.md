# Rest Express - Full Stack Application

## Overview
This is a full-stack web application built with:
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI components with shadcn/ui styling

## Project Structure
```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components (Radix UI)
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and data
│   │   └── App.tsx      # Main app component
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage interface
│   └── vite.ts          # Vite dev server integration
├── shared/              # Shared TypeScript types
│   └── schema.ts        # Database schema
└── script/              # Build and utility scripts
```

## Setup Information
- **Date Imported**: December 08, 2025
- **Database**: PostgreSQL (Neon) - schema migrated
- **Development Port**: 5000 (both frontend and backend served from same port)
- **Backend**: Express server with Vite middleware in development

## Key Features
- User authentication schema ready (users table)
- Session management support (express-session, passport)
- WebSocket support (ws library)
- File parsing support (xlsx)
- Comprehensive UI component library

## Development
The server runs on port 5000 and serves both:
1. Backend API routes (prefix `/api`)
2. Frontend React app via Vite dev server

In development, Vite middleware is used for HMR (Hot Module Replacement).
The server is configured to bind to `0.0.0.0` with `allowedHosts: true` for Replit proxy compatibility.

## Production Build
- Frontend: Built with Vite to `dist/public`
- Backend: Bundled with esbuild to `dist/index.cjs`
- Run: `npm start` serves static frontend and backend API

## Database
- ORM: Drizzle
- Migrations: `npm run db:push`
- Schema: User authentication table configured

## Configuration
- Vite config: Configured for Replit environment with proxy support
- TypeScript: Strict mode enabled
- Path aliases: `@/` for client, `@shared/` for shared types

## GitHub Pages Deployment
This project can be deployed to GitHub Pages as a static site.

### Build for GitHub Pages
```bash
npm run build:gh-pages
```

This will build the static files to the `docs/` folder with:
- Relative paths for all assets (works with any base URL)
- 404.html for SPA routing support
- .nojekyll file to disable Jekyll processing

### GitHub Pages Setup
1. Push the project to GitHub
2. Go to repository Settings > Pages
3. Set Source to "Deploy from a branch"
4. Select "main" branch and "/docs" folder
5. Save and wait for deployment

The app will be available at: `https://<username>.github.io/<repo-name>/`

### Files in docs/
- index.html - Main entry point
- 404.html - SPA fallback for client-side routing
- assets/ - JavaScript and CSS bundles
- favicon.png - Site icon
- opengraph.jpg - Social sharing image
