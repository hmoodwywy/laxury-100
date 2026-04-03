# Admin Dashboard Setup Guide

This guide will help you set up the web-based admin dashboard for Luxury Auto Wash.

## Prerequisites

- Node.js 18+
- Supabase credentials (from .env file)

## Create New Next.js Project

```bash
# In a separate directory
npx create-next-app@latest luxury-auto-wash-dashboard
cd luxury-auto-wash-dashboard

# When prompted, select:
# ✅ TypeScript
# ✅ ESLint
# ✅ Tailwind CSS
# ✅ App Router
# ❌ Turbopack
# ✅ Import alias (@/*)
```

## Install Dependencies

```bash
npm install @supabase/supabase-js
npm install @supabase/ssr
npm install lucide-react
npm install recharts
npm install date-fns
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-toast
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Dashboard Features to Implement

### Pages Structure

```
/app
  /dashboard
    /page.tsx           # Overview & Analytics
    /customers
      /page.tsx         # Customer list
    /employees
      /page.tsx         # Employee management
    /plans
      /page.tsx         # Loyalty plan management
    /subscriptions
      /page.tsx         # Subscription management
    /logs
      /page.tsx         # Activity logs
    /layout.tsx         # Dashboard layout with sidebar
  /login
    /page.tsx           # Admin login
```

### Key Components

1. **Sidebar Navigation**
   - Dashboard
   - Customers
   - Employees
   - Plans
   - Subscriptions
   - Activity Logs
   - Settings

2. **Overview Dashboard**
   - Total customers count
   - Active subscriptions count
   - Washes today count
   - Revenue charts
   - Recent activity

3. **Customer Management**
   - List all customers
   - View customer details
   - Manage subscriptions
   - View loyalty cards
   - Activity history

4. **Employee Management**
   - Add/remove employees
   - View employee activity
   - Performance metrics

5. **Loyalty Plan Management**
   - Create/edit plans
   - Set required washes
   - Configure rewards
   - Activate/deactivate plans

6. **Subscription Management**
   - Activate subscriptions
   - Cancel subscriptions
   - View subscription history
   - Bulk operations

7. **Activity Logs**
   - Filter by date
   - Filter by action type
   - Export to CSV
   - Real-time updates

## Authentication

Use Supabase Auth for admin login:

```typescript
// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

Protect routes with middleware to check for admin role.

## Analytics Implementation

Use Recharts for visualizations:

```typescript
import { LineChart, BarChart, PieChart } from 'recharts'
```

Query Supabase for aggregated data:
- Daily wash counts
- Monthly revenue
- Customer growth
- Reward redemption rates

## Real-time Updates

Subscribe to database changes:

```typescript
const channel = supabase
  .channel('dashboard-updates')
  .on('postgres_changes',
    { event: '*', schema: 'public' },
    (payload) => {
      // Update dashboard data
    }
  )
  .subscribe()
```

## UI/UX Guidelines

### Design System
- Use shadcn/ui components for consistency
- Dark theme with gold accents
- Responsive grid layouts
- Data tables with sorting/filtering

### Color Palette
- Background: #000000, #1a1a1a
- Primary: #FFD700 (Gold)
- Success: #4CAF50
- Error: #ff3b30
- Text: #ffffff, #999999

### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Monospace: JetBrains Mono (for IDs)

## API Integration

All dashboard operations should use the Supabase client with RLS policies. Admin users have full access through RLS policies.

### Example: Fetch Customers

```typescript
const { data: customers, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'customer')
  .order('created_at', { ascending: false })
```

### Example: Activate Subscription

```typescript
const response = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-subscription`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      userId,
      action: 'activate',
    }),
  }
)
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment Variables in Vercel
Add the same environment variables from `.env.local` in the Vercel dashboard.

## Security Considerations

1. **Admin Only Access**
   - Verify user role is 'admin' on every request
   - Use middleware to protect routes

2. **Secure API Calls**
   - Always use authenticated requests
   - Validate user permissions server-side

3. **Input Validation**
   - Sanitize all user inputs
   - Validate data before database operations

## Testing the Dashboard

1. Create an admin user in Supabase:
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

2. Log in with admin credentials
3. Test all CRUD operations
4. Verify real-time updates
5. Check responsive design on different devices

## Support

For shadcn/ui components: https://ui.shadcn.com/
For Supabase queries: https://supabase.com/docs
For Next.js: https://nextjs.org/docs
