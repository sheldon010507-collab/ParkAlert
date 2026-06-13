# ParkAlert

ParkAlert is an Expo + React Native parking reminder app. It helps a driver save their parked car location, monitors distance from that point, and shows an alert when the user moves beyond the configured radius.

## What Is In This Repo

- Expo app targeting iOS, Android, and web.
- Supabase Auth and database integration.
- Google Maps support for native and web map views.
- Offline-aware parking state storage.
- Jest tests for core parking-alert behavior and error logging.
- Vercel configuration for the Expo web build.

## Requirements

- Node.js 20 or newer.
- npm.
- Expo CLI through `npx expo`.
- A Supabase project.
- A Google Maps API key for web/native map rendering.

## Environment Variables

Create a local `.env` file from the example and fill in real project values:

```bash
cp .env.example .env
```

Required public client variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

Only use a Supabase anon or publishable frontend key in this app. Never put a Supabase `service_role` key in Expo, Vercel public variables, or any browser/mobile client bundle.

## Local Development

```bash
npm install
npm start
```

Useful commands:

```bash
npm run typecheck
npm test -- --runInBand
npm run build:web
```

## Vercel Deployment

The Vercel build command runs `scripts/write-expo-env.js` before `expo export -p web` so the Expo web bundle receives the required public environment values.

Set these variables in Vercel for Production, Preview, and Development:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

Then deploy with Vercel or push to the connected GitHub repository.

## Supabase Setup

Apply migrations in `supabase/migrations` to your Supabase project. The latest hardening migration enables RLS, tightens public grants, and adds policies for user-owned parking data, profiles, parking sessions, and alert logs.

If you create new tables in the exposed `public` schema, enable RLS and add explicit policies before using them from the app.

## Current Product Notes

- Parking alerts trigger at 150 meters by default.
- Alert cooldown is 15 minutes.
- Alert expiry options are 30, 45, or 60 minutes.
- The app keeps a local fallback parking location so the reminder remains useful during temporary network loss.

## Security Notes

- `.env` and Vercel local files are ignored by Git.
- CI uses placeholder public values only to verify typecheck, tests, and web build.
- Supabase RLS policies should be reviewed after every schema change.
