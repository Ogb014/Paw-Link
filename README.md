# Paw Link

**Paw Link** is a premium dog-breeding marketplace and kennel management platform for breeders, buyers, and people seeking breeding services.

## Overview

Paw Link helps responsible breeders manage their kennels with comprehensive dog profiles, health records, vaccination tracking, breeding history, and litter management — while providing a public marketplace where buyers can discover dogs from trusted, verified breeders.

### Three user roles

- **Breeders** — Manage kennels, create unlimited dog profiles, track health and breeding records, publish a public storefront, and list dogs on the marketplace.
- **Buyers** — Browse the marketplace, search by breed and location, save searches with alerts, view health and lineage records, and send direct enquiries to breeders.
- **Service Seekers** — Find stud services and breeding providers, compare offerings, and manage enquiries.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite 5
- **Styling**: Tailwind CSS 3 with a custom design system
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Icons**: Lucide React
- **Fonts**: Inter (sans), Fraunces (display serif)

## Prerequisites

- Node.js 18+ and npm
- A Supabase project (URL and anon key)

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd paw-link
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example file and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |

   > Never commit the `.env` file. The service-role key must never appear in frontend code.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**

   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Navbar, footer, app shell
│   ├── landing/         # Landing page sections (hero, features, pricing, etc.)
│   ├── Logo.tsx
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx  # Supabase auth provider and hook
├── lib/
│   └── supabase.ts      # Supabase client singleton
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── DashboardPage.tsx
├── types/
│   └── database.ts      # TypeScript interfaces for database entities
├── App.tsx              # Router configuration
├── main.tsx             # App entry point
└── index.css            # Tailwind + design system styles
```

## Database Architecture

All tables have Row-Level Security (RLS) enabled with owner-scoped policies.

### Tables

| Table | Purpose | Owner column | RLS scope |
|-------|---------|-------------|-----------|
| `profiles` | User profile (name, role, avatar, bio) | `id` (= auth.users.id) | Users can read/update only their own profile |
| `kennels` | Breeder kennel operations | `owner_id` (default `auth.uid()`) | Owners have full CRUD on their kennels |
| `dogs` | Individual dog profiles within a kennel | — (scoped via `kennel_id`) | Scoped through kennel ownership |

### Planned tables (not yet created)

- `health_records` — vaccinations, medications, vet visits
- `breeding_records` — breeding pairings and outcomes
- `litters` — litter management from birth to adoption
- `marketplace_enquiries` — buyer-to-breeder messages
- `saved_searches` — buyer search alerts

## Design System

- **Colors**: 7 ramp system (primary green, secondary teal, accent amber, success, warning, error, neutral)
- **Typography**: Inter for body/UI, Fraunces for headings
- **Spacing**: 8px base grid
- **Components**: Reusable `.btn-primary`, `.btn-secondary`, `.card`, `.input-field` utility classes
- **Animations**: Subtle fade-in, slide-up, and shimmer keyframes

## What's Built (Foundation)

- [x] Project scaffold (Vite + React + TypeScript + Tailwind)
- [x] Premium design system with green/teal palette
- [x] Responsive public landing page (hero, features, role cards, marketplace preview, pricing, CTA)
- [x] Fixed navbar with scroll-aware styling and mobile menu
- [x] Footer with navigation and social links
- [x] Authentication screens (login, signup with role selection)
- [x] Auth context with Supabase session management
- [x] Protected route guard
- [x] Role-aware app shell with sidebar navigation
- [x] Dashboard placeholder with role-specific quick actions
- [x] Supabase client setup with environment variable validation
- [x] Database migrations: profiles, kennels, dogs with full RLS
- [x] README and .env.example

## What's Next

- Kennel management (create/edit kennel, public storefront pages)
- Dog CRUD with multi-photo upload and deletion
- Health records, vaccinations, medications, vet visits
- Breeding history and litter management
- Marketplace listings and search
- Saved searches and enquiry system
- Custom dog fields and dashboard themes

## Security Notes

- Supabase service-role keys are never used in frontend code
- All database tables use RLS with ownership checks via `auth.uid()`
- Owner columns default to `auth.uid()` so inserts work without explicit user IDs
- Child tables (dogs) are scoped through parent ownership (kennels)
- `.env` is gitignored and never committed
