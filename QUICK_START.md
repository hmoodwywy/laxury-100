# Quick Start Guide

Get up and running with Luxury Auto Wash in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Verify Environment

Check that `.env` contains:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

## Step 3: Start the App

```bash
npm run dev
```

## Step 4: Create Test Users

You'll need to create users with different roles to test all features.

### Create a Customer Account
1. Open the app
2. Click "Sign Up"
3. Fill in the registration form
4. This creates a customer account by default

### Create an Employee Account

After registering, run this SQL in Supabase SQL Editor:

```sql
-- Update an existing user to be an employee
UPDATE users
SET role = 'employee'
WHERE email = 'employee@test.com';
```

### Create an Admin Account

```sql
-- Update an existing user to be an admin
UPDATE users
SET role = 'admin'
WHERE email = 'admin@test.com';
```

### Activate a Subscription

```sql
-- Activate subscription for a test user
INSERT INTO subscriptions (user_id, status, start_date)
SELECT id, 'active', now()
FROM users
WHERE email = 'customer@test.com';

-- Update user subscription status
UPDATE users
SET subscription_status = 'active'
WHERE email = 'customer@test.com';
```

## Step 5: Test Customer Flow

1. **Log in as customer**
2. **View your QR code** on the home screen
3. **Note your user ID** (visible in URL or profile)

## Step 6: Test Employee Flow

1. **Log in as employee** (different device or browser)
2. **Go to Scanner tab**
3. **Grant camera permission**
4. **Scan the customer QR code**
5. **Add a wash**
6. **See real-time update** on customer device

## Step 7: Test Reward Redemption

1. **As employee**, add washes until customer reaches required count
2. **Customer will see** "Reward Available" on loyalty card
3. **Scan customer QR** again as employee
4. **Redeem the reward**
5. **New loyalty card** is automatically created

## Features to Test

### Customer Features
- ✅ Sign up / Sign in
- ✅ View QR code
- ✅ Track loyalty progress
- ✅ View activity history
- ✅ See real-time updates
- ✅ Check subscription status

### Employee Features
- ✅ Scan customer QR codes
- ✅ Add washes
- ✅ Redeem rewards
- ✅ View activity logs

### Real-time Features
- ✅ Loyalty card updates instantly
- ✅ Activity logs appear immediately
- ✅ No refresh needed

## Troubleshooting

### Camera Permission Denied
- Go to device settings
- Enable camera for Expo Go
- Restart the app

### QR Code Won't Scan
- Ensure good lighting
- Hold steady
- Try adjusting distance

### User Not Found After Scan
- Verify subscription is active
- Check user exists in database
- Ensure QR code is valid

### Loyalty Card Not Showing
- Verify subscription is active
- Check that loyalty plans exist
- Refresh the app

## Default Test Data

The database includes three loyalty plans:
- **Silver**: 5 washes → free wash
- **Gold**: 10 washes → free wash
- **Platinum**: 15 washes → free wash

New users automatically get assigned to the Silver plan.

## Next Steps

1. **Customize loyalty plans** in Supabase dashboard
2. **Add real customers** via registration
3. **Set up admin dashboard** (see DASHBOARD_SETUP.md)
4. **Configure production deployment**

## Support

- **Technical Issues**: Check README.md
- **Database Issues**: Use Supabase dashboard
- **Feature Requests**: Contact development team

## Production Checklist

Before going live:
- [ ] Test all user flows
- [ ] Verify real-time updates work
- [ ] Test on iOS and Android
- [ ] Set up proper error tracking
- [ ] Configure production environment
- [ ] Train employees on scanner usage
- [ ] Prepare customer onboarding materials
- [ ] Set up admin dashboard
- [ ] Test backup and recovery procedures
- [ ] Configure monitoring and alerts

Enjoy using Luxury Auto Wash!
