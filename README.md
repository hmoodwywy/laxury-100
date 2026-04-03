# Luxury Auto Wash - Production System

A complete full-stack luxury car wash management system with mobile app and admin capabilities.

## System Architecture

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **API**: Supabase Edge Functions
- **Real-time**: Supabase Realtime subscriptions

### Mobile App
- **Framework**: React Native (Expo SDK 52)
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Styling**: React Native StyleSheet

## Features

### For Customers
- QR code generation for easy check-in
- Real-time loyalty card tracking
- Activity history
- Subscription status monitoring
- Contact information and social links

### For Employees
- QR code scanner
- Add washes to customer accounts
- Redeem customer rewards
- Activity logs

### For Admins
- Full system access
- All employee capabilities
- User management (via Supabase dashboard)
- Subscription management

## Database Schema

### Tables

**users**
- User profiles with role-based access
- Roles: customer, employee, admin
- Subscription status tracking

**loyalty_plans**
- Configurable reward programs
- Multiple tier support (Silver, Gold, Platinum)

**loyalty_cards**
- User-specific loyalty tracking
- Progress monitoring
- Reward availability status

**wash_logs**
- Complete activity tracking
- Employee attribution
- Action types: wash_added, reward_redeemed

**subscriptions**
- Subscription management
- Status tracking
- Date-based management

## API Endpoints (Edge Functions)

### add-wash
- **Method**: POST
- **Auth**: Required
- **Purpose**: Add a wash to customer's loyalty card
- **Validates**: Active subscription, increments wash count, checks reward eligibility

### redeem-reward
- **Method**: POST
- **Auth**: Required
- **Purpose**: Redeem available rewards
- **Creates**: New loyalty card after redemption

### manage-subscription
- **Method**: POST
- **Auth**: Required
- **Actions**: activate, deactivate, cancel
- **Updates**: Subscription status and user subscription_status

## Security

### Row Level Security (RLS)
All tables have RLS enabled with role-based policies:

- **Customers**: Can only access their own data
- **Employees**: Can read customer data, add wash logs
- **Admins**: Full access to all data

### Authentication
- Secure email/password authentication
- JWT-based session management
- Auto-refresh tokens
- Role-based access control

## Project Structure

```
/app
  /(auth)
    login.tsx           # Login screen
    register.tsx        # Registration screen
  /(tabs)
    index.tsx           # Home screen with QR code
    scanner.tsx         # Employee QR scanner
    history.tsx         # Activity history
    profile.tsx         # User profile and settings
/components
  LoyaltyCardComponent.tsx  # Loyalty card UI
  LoadingScreen.tsx         # Loading state
/contexts
  AuthContext.tsx       # Authentication state
/services
  authService.ts        # Authentication operations
  loyaltyService.ts     # Loyalty card operations
  qrService.ts          # QR code generation/parsing
  subscriptionService.ts    # Subscription management
  washLogService.ts     # Activity logging
/lib
  supabase.ts           # Supabase client configuration
/types
  database.ts           # TypeScript types
/supabase/functions
  add-wash/             # Edge function for adding washes
  redeem-reward/        # Edge function for redeeming rewards
  manage-subscription/  # Edge function for subscription management
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- Supabase account (already configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env`

3. Start the development server:
```bash
npm run dev
```

### Testing the App

#### As a Customer:
1. Register a new account
2. View your QR code on the home screen
3. Show QR to employee for wash
4. Track your loyalty progress
5. Redeem rewards when available

#### As an Employee:
1. Log in with employee credentials
2. Use the Scanner tab
3. Scan customer QR codes
4. Add washes or redeem rewards

## Default Loyalty Plans

The system comes with three pre-configured plans:

- **Silver Member**: 5 washes → Free wash
- **Gold Member**: 10 washes → Free wash
- **Platinum Member**: 15 washes → Free wash

## Business Information

- **Phone**: 0548383525
- **Email**: luxuryautowash.sa@gmail.com
- **Location**: https://maps.app.goo.gl/qNCvDd9XRjU56reT8
- **TikTok**: https://www.tiktok.com/@luxuryautowash.sa
- **Snapchat**: https://snapchat.com/t/KqGqXCJn

## Real-time Sync

The app uses Supabase Realtime for instant updates:

- Loyalty card progress updates live
- Subscription status changes reflect immediately
- Activity logs appear in real-time
- No manual refresh needed

## Design Philosophy

The UI follows a luxury dark theme with:
- Black and dark gray backgrounds
- Gold (#FFD700) accent color
- Clean, minimal design
- Smooth animations
- Premium feel

## Deployment

### Mobile App
```bash
# Build for production
npm run build:web

# For iOS/Android, use Expo Application Services (EAS)
eas build --platform ios
eas build --platform android
```

### Backend
- Edge Functions are already deployed to Supabase
- Database is production-ready with proper indexes and RLS
- Authentication is configured and secure

## Production Checklist

- ✅ Database schema with proper relationships
- ✅ Row Level Security policies
- ✅ Edge Functions deployed and tested
- ✅ Authentication system
- ✅ Real-time subscriptions
- ✅ QR code system
- ✅ Customer mobile UI
- ✅ Employee mobile UI
- ✅ Activity logging
- ✅ TypeScript type safety
- ✅ Error handling
- ✅ Loading states

## Support

For issues or questions about the system, contact the development team or refer to the Supabase and Expo documentation.

## License

Proprietary - Luxury Auto Wash © 2026
