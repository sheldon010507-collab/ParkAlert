# ParkAlert

A mobile app for reporting parking warden sightings and receiving real-time alerts when wardens are detected near your parked car.

## Features

- **Interactive Map** - Report warden sightings with type (Council/Private/Police), direction, and movement
- **Mark My Car** - Save your parked car location with 100m alert radius
- **Real-time Alerts** - Get notified when wardens are detected near your car
- **Cross-platform** - Works on Web and iOS

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

Run the SQL migration in Supabase SQL Editor:
```sql
-- See supabase/migrations/001_initial_schema.sql
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # App screens
├── hooks/          # Custom React hooks
├── services/       # API services
├── contexts/       # React contexts
├── theme/          # Colors and typography
├── types/          # TypeScript types
└── constants/      # App constants
```

## License

MIT
