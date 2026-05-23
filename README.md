# SkyVoyage

SkyVoyage is a premium flight management PWA built with Next.js, Supabase, Tailwind CSS, Framer Motion, and Zustand. It combines a polished travel booking experience with live seat selection, authenticated bookings, passenger management, and a modern aviation-inspired interface.

## Overview

This project is designed to simulate a high-end airline booking platform with a strong focus on:

- Real-time seat selection and booking flow
- Supabase authentication and database-backed records
- Smooth, animated UI interactions
- Mobile-first, responsive design
- Persisted booking state with Zustand
- Clean separation between flight search, seat selection, passenger entry, and confirmation

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase Auth + PostgreSQL
- Tailwind CSS
- Framer Motion
- Zustand
- Radix UI components
- Lucide icons
- date-fns

## Core Features

- Flight search and route discovery
- Live seat selection and booking state management
- Passenger details form for multiple travelers
- Booking confirmation with PNR generation
- Bookings dashboard with cancellation and rescheduling actions
- Profile and authentication flows
- Aviation-themed UI with glassmorphism-style panels
- PWA-friendly structure for a more app-like experience

## Project Structure

```text
app/
  auth/
  bookings/
  flights/
  profile/
components/
  bookings/
  flights/
  ui/
lib/
  stores/
  supabase/
supabase/
  migrations/
public/
styles/
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- pnpm, npm, or yarn
- A Supabase project

### 1. Install Dependencies

```bash
pnpm install
```

If you prefer npm:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root and add your Supabase details:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Set Up Supabase

Run the SQL migrations in `supabase/migrations/` in order.

Recommended order:

1. `000_schema.sql` - Core tables and indexes
2. `001_rls.sql` - Row level security policies
3. `002_rpc.sql` - RPC functions and triggers
4. `003_seed.sql` - Seed data for airports, airlines, aircraft, and flights

If your Supabase project uses additional migration files, apply those as part of the same setup.

### 4. Start the App

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Demo Login

Use these test credentials to sign in during local testing:

- Username: `test@gmail.com`
- Password: `test1234`

## Useful Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the app for production
- `pnpm start` - Run the production build
- `pnpm lint` - Run lint checks

If you use npm, the equivalent commands are:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Notes

- Seat and booking state is managed locally in Zustand and synchronized with Supabase on booking actions.
- Passenger and booking data are stored in the database and tied to the authenticated user.
- The application expects the Supabase schema and policies to be applied before trying the booking flow.
- If you change the database schema, update the matching types in `lib/types.ts` and any affected queries.

## Environment Example

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

## Support Files

- `README.md` - Project overview and setup
- `QUICK_TEST_GUIDE.md` - Fast manual testing checklist
- `IMPLEMENTATION_SUMMARY.md` - Feature summary
- `COMPREHENSIVE_SEED_DATA_SUMMARY.md` - Seed data details
- `SEED_DATA_COMPLETE.md` - Seed data completion notes

## License

MIT
