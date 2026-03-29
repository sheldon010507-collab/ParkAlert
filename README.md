# ParkAlert

A mobile app for reporting parking warden sightings and receiving real-time alerts when wardens are detected near your parked car.

## Features

- **Interactive Map** - Report warden sightings with type (Council/Private/Police), direction, and movement
- **Mark My Car** - Save your parked car location with 100m alert radius
- **Real-time Alerts** - Get notified when wardens are detected near your car
- **Cross-platform** - Works on Web and iOS
- **Settings** - Manage notifications, sound, and vibration preferences

## Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Maps**: Leaflet (Web), react-native-maps (iOS)
- **UI**: Material Design 3

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/sheldon010507-collab/ParkAlert.git
cd ParkAlert
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file with your Supabase credentials
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

4. Run the app
```bash
# Web
npm run web

# iOS
npm run ios
```

### Database Setup

Run the SQL migrations in Supabase SQL Editor:
```sql
-- See supabase/migrations/001_initial_schema.sql
-- See supabase/migrations/002_fix_profiles.sql
```

## Security Configuration

### Google Maps API Key

**IMPORTANT**: Restrict your Google Maps API key to prevent unauthorized use:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your API key
4. Under "Application restrictions", select "HTTP referrers"
5. Add your domains:
   - `localhost:*` (for development)
   - `your-domain.com/*` (for production)
6. Under "API restrictions", select "Maps JavaScript API"

### Supabase Configuration

1. Enable Row Level Security (RLS) on all tables
2. The migration files include RLS policies
3. Never expose service_role key in client code

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── common/     # Shared components (Button, Dialog, etc.)
│   ├── alerts/     # Alert-related components
│   ├── map/        # Map components
│   └── error/      # Error boundary
├── screens/        # App screens
│   ├── auth/       # Login, Register
│   ├── map/        # Main map screen
│   ├── report/     # Report sighting
│   ├── parked/     # Mark parking
│   └── settings/   # User settings
├── hooks/          # Custom React hooks
├── services/       # API services
├── contexts/       # React contexts
├── theme/          # Colors and typography
├── types/          # TypeScript types
└── constants/      # App constants
```

## Features Implemented

- ✅ Authentication (Login/Register/Logout)
- ✅ Password strength validation
- ✅ Real-time warden sightings
- ✅ Mark parked car location
- ✅ Alert notifications (sound + vibration)
- ✅ Error boundaries
- ✅ Loading states
- ✅ Settings screen
- ✅ Connection status indicator
- ✅ Automatic reconnection

## License

MIT
