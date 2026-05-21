# SkyVoyage ✈️

A premium real-time flight booking PWA built with Next.js, Supabase, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase (PostgreSQL with RLS)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand (with persist middleware)
- **UI Components:** Radix UI

## Features

- Real-time seat selection with live availability
- Animated booking flow (Search → Seats → Passengers → Confirm)
- Authentication with Supabase Auth
- My Bookings dashboard with cancellation & rescheduling
- Thread-safe seat reservation using database row locking
- Automatic cancellation prevention within 2 hours of departure
- Dark aviation-themed UI with glassmorphism
- Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or pnpm)
- A Supabase account and project

### Local Setup

1. **Clone the repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   *Note: This project was originally set up with pnpm, but npm works fine too.*

3. **Set up Supabase:**

   a. Create a new Supabase project at [supabase.com](https://supabase.com)
   
   b. Run the migrations in order:
      - Go to SQL Editor in your Supabase dashboard
      - Copy and execute each file in `supabase/migrations/` in order:
        1. `000_airports.sql` - Creates airports reference table (optional but recommended)
        2. `001_schema.sql` - Creates tables and RLS policies
        3. `002_rpc.sql` - Creates RPC functions for seat reservation and cancellation
        4. `003_trigger.sql` - Creates trigger to prevent late cancellations
        5. `004_seed.sql` - **Comprehensive seed data:**
           - 30 routes covering all combinations between 6 cities
           - 3 flights per day for next 30 days per route
           - ~2,700 total flights with full seat maps
           - Cities: DEL, BOM, BLR, HYD, CCU, MAA
           - **Note:** This will take 2-3 minutes to complete due to seat generation
   
   c. Create test user via Supabase Auth Dashboard:
      - Go to Authentication → Users → Add User
      - Email: `test@skyvoyage.com`
      - Password: `Test@123456`
      - Confirm email automatically

4. **Configure environment variables:**
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env.local
   
   # On Mac/Linux:
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   Find these in: Supabase Dashboard → Settings → API

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Project Configuration

### Database Schema

The application uses the following tables:
- **flights** - Flight schedules with origin, destination, times, and pricing (~2,700 flights)
- **seats** - Seat inventory per flight with class and availability (~162,000 seats)
- **bookings** - User bookings with PNR codes and status
- **passengers** - Passenger details linked to bookings
- **reschedules** - Reschedule history with fee tracking
- **airports_reference** - Airport codes and names for search (optional)

### Seed Data Coverage

The seed data includes:
- **6 Cities:** Delhi (DEL), Mumbai (BOM), Bangalore (BLR), Hyderabad (HYD), Kolkata (CCU), Chennai (MAA)
- **30 Routes:** All possible combinations between the 6 cities
- **3 Flights per Day:** Morning (6 AM), Afternoon (2 PM), Evening (8 PM)
- **30 Days:** Flights available for the next month
- **Total:** ~2,700 flights with complete seat maps (first, business, economy)

This ensures testers can search for any route on any date and find available flights!

### RPC Functions

- **reserve_seat(p_seat_id, p_user_id)** - Thread-safe seat reservation with row locking
- **cancel_booking(p_booking_id)** - Cancellation with 2-hour departure check

### Database Triggers

- **prevent_late_cancellation** - Automatically prevents booking cancellation within 2 hours of departure

### Row Level Security (RLS)

All tables have RLS enabled:
- **flights & seats** - Public read access
- **bookings, passengers, reschedules** - Users can only access their own data (filtered by `auth.uid()`)

## Zustand Store Structure

The application uses two separate Zustand stores:

### Flight Store (`lib/stores/flight-store.ts`)

Manages the booking flow state:
- Search query parameters
- Selected flight and seats
- Current booking step
- Passenger form data

**Partialize Strategy:**
- ✅ Persists: search query, selected flight, selected seats, booking step
- ❌ Excludes: `passport_no` from passenger forms (security - sensitive data not stored in localStorage)

**Key Features:**
- Optimistic seat selection (marks seat selected immediately, confirms after Supabase)
- `resetStore()` action triggered on cancellation and logout

### User Store (`lib/stores/user-store.ts`)

Manages user session and cached data:
- Supabase session token
- Cached bookings list

**Partialize Strategy:**
- ✅ Persists: session token only
- ❌ Excludes: cached bookings (fetched fresh on each load)

## Test Credentials

Use these credentials to test the application:

- **Email:** `test@skyvoyage.com`
- **Password:** `Test@123456`

## Project Structure

```
app/                  # Next.js App Router pages
  auth/               # Login & signup pages
  flights/            # Search results & seat selection
  bookings/           # My bookings dashboard
components/           # Reusable UI components
  bookings/           # Booking dashboard components
  flights/            # Flight card components
  ui/                 # Radix UI components
lib/                  # Core utilities
  stores/             # Zustand stores (flight-store, user-store)
  supabase/           # Supabase client configuration
  types.ts            # TypeScript type definitions
supabase/
  migrations/         # Database migrations (run in order)
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## What Would Be Improved With More Time

### PWA Enhancements
- **Service Worker** - Offline support and caching strategy
- **Web App Manifest** - Better PWA scoring with proper icons and theme colors
- **Push Notifications** - Flight status updates and reminders
- **Install Prompt** - Custom A2HS (Add to Home Screen) experience

### Payment Integration
- **Stripe/Razorpay Integration** - Real payment processing
- **Payment Status Tracking** - Pending → Confirmed flow
- **Refund Handling** - Automated refunds for cancellations
- **Invoice Generation** - PDF receipts and tax invoices

### Additional Features
- **Email Notifications** - Booking confirmations, reminders, status updates
- **SMS Notifications** - OTP verification and flight alerts
- **Multi-language Support** - i18n for global users
- **Currency Conversion** - Dynamic pricing based on user location
- **Flight Status Tracking** - Real-time delay/gate information
- **Loyalty Program** - Points and rewards system
- **Admin Dashboard** - Flight management and analytics

### Performance Optimizations
- **Image Optimization** - WebP format, lazy loading
- **Code Splitting** - Route-based chunking
- **CDN Integration** - Static asset delivery
- **Database Indexing** - Query performance tuning
- **Caching Strategy** - Redis for frequently accessed data

### Testing & Quality
- **Unit Tests** - Jest/Vitest for components
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Playwright for user flows
- **Accessibility Audit** - WCAG 2.1 AA compliance
- **Performance Monitoring** - Sentry error tracking

## Environment Variables

See `.env.example` for required environment variables.

## License

MIT
