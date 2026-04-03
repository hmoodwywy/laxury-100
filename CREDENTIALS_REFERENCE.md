# Credentials & Quick Reference

## Supabase Configuration

Your Supabase project is already configured and ready to use.

### Database Connection
- **URL**: Available in `.env` file
- **Anon Key**: Available in `.env` file

### Access Supabase Dashboard
1. Go to https://supabase.com
2. Sign in to your account
3. Select your project

## Edge Functions

All edge functions are deployed and accessible:

### Base URL
```
${SUPABASE_URL}/functions/v1/
```

### Available Functions
- `add-wash`
- `redeem-reward`
- `manage-subscription`

## Creating Test Users

### 1. Create Users via App
Register through the mobile app registration screen. This creates customers by default.

### 2. Change User Roles
Run these SQL commands in Supabase SQL Editor:

```sql
-- Make user an employee
UPDATE users
SET role = 'employee'
WHERE email = 'employee@test.com';

-- Make user an admin
UPDATE users
SET role = 'admin'
WHERE email = 'admin@test.com';
```

### 3. Activate Subscription

```sql
-- Activate subscription for a user
INSERT INTO subscriptions (user_id, status, start_date)
SELECT id, 'active', now()
FROM users
WHERE email = 'customer@test.com'
ON CONFLICT DO NOTHING;

-- Update user status
UPDATE users
SET subscription_status = 'active'
WHERE email = 'customer@test.com';
```

## Testing Credentials Template

Create these test accounts for full testing:

### Customer Account
```
Email: customer@test.com
Password: Test123456
Role: customer (default)
Subscription: active (must set via SQL)
```

### Employee Account
```
Email: employee@test.com
Password: Test123456
Role: employee (must set via SQL)
Subscription: inactive
```

### Admin Account
```
Email: admin@test.com
Password: Test123456
Role: admin (must set via SQL)
Subscription: inactive
```

## Business Information

### Contact Details
- **Phone**: 0548383525
- **Email**: luxuryautowash.sa@gmail.com

### Social Media
- **TikTok**: https://www.tiktok.com/@luxuryautowash.sa
- **Snapchat**: https://snapchat.com/t/KqGqXCJn

### Location
- **Google Maps**: https://maps.app.goo.gl/qNCvDd9XRjU56reT8

## Database Tables

Quick reference for table names:
- `users`
- `loyalty_plans`
- `loyalty_cards`
- `wash_logs`
- `subscriptions`

## Default Loyalty Plans

Pre-configured in database:
1. **Silver Member**: 5 washes → free wash
2. **Gold Member**: 10 washes → free wash
3. **Platinum Member**: 15 washes → free wash

## Common SQL Queries

### View All Customers
```sql
SELECT * FROM users WHERE role = 'customer';
```

### View Active Subscriptions
```sql
SELECT u.name, u.email, s.status, s.start_date
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'active';
```

### View Loyalty Card Progress
```sql
SELECT u.name, lc.current_washes, lp.required_washes, lc.reward_available
FROM users u
JOIN loyalty_cards lc ON u.id = lc.user_id
JOIN loyalty_plans lp ON lc.plan_id = lp.id
WHERE lc.completed = false;
```

### View Today's Activity
```sql
SELECT u.name, wl.action, wl.created_at
FROM wash_logs wl
JOIN users u ON wl.user_id = u.id
WHERE DATE(wl.created_at) = CURRENT_DATE
ORDER BY wl.created_at DESC;
```

### Count Washes by Employee
```sql
SELECT u.name as employee, COUNT(*) as total_washes
FROM wash_logs wl
JOIN users u ON wl.employee_id = u.id
WHERE wl.action = 'wash_added'
GROUP BY u.name
ORDER BY total_washes DESC;
```

## API Testing

### Test Add Wash (with curl)
```bash
curl -X POST \
  ${SUPABASE_URL}/functions/v1/add-wash \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "employeeId": "employee-uuid-here"
  }'
```

### Test Redeem Reward
```bash
curl -X POST \
  ${SUPABASE_URL}/functions/v1/redeem-reward \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "employeeId": "employee-uuid-here"
  }'
```

## Mobile App Commands

### Start Development Server
```bash
npm run dev
```

### Type Check
```bash
npm run typecheck
```

### Lint
```bash
npm run lint
```

## Troubleshooting

### Reset User Password
```sql
-- This requires Supabase Dashboard access
-- Go to Authentication > Users > Select user > Reset Password
```

### Clear User's Loyalty Card
```sql
UPDATE loyalty_cards
SET completed = true
WHERE user_id = 'user-uuid-here' AND completed = false;
```

### View User's Complete Profile
```sql
SELECT
  u.*,
  s.status as subscription_status,
  lc.current_washes,
  lp.name as loyalty_plan,
  lp.required_washes
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN loyalty_cards lc ON u.id = lc.user_id AND lc.completed = false
LEFT JOIN loyalty_plans lp ON lc.plan_id = lp.id
WHERE u.email = 'email@test.com';
```

## Security Notes

- **Never commit** `.env` file to version control
- **Change default passwords** before production
- **Rotate API keys** periodically
- **Monitor access logs** in Supabase
- **Enable 2FA** for admin accounts

## Need Help?

1. Check `README.md` for system overview
2. See `QUICK_START.md` for setup instructions
3. Review `SYSTEM_OVERVIEW.md` for technical details
4. Visit Supabase docs: https://supabase.com/docs
5. Visit Expo docs: https://docs.expo.dev

## Production Deployment

When ready for production:
1. Update environment variables
2. Configure production API keys
3. Set up proper monitoring
4. Enable error tracking
5. Configure backup procedures
6. Test thoroughly with real data
7. Train your team
8. Prepare launch materials

---

**Security Warning**: Keep this file secure and do not share publicly. Contains sensitive project information.
