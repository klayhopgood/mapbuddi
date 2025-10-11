# URGENT: Clerk Key Mismatch Fix

## The Problem

Error: `Unable to find a signing key in JWKS that matches the kid`

This means your **frontend** and **backend** are using **different Clerk instances**. You're likely using:
- Frontend: Production Clerk keys (`ins_33uF3WpVO6R68gLX5JFPin4Rldc`)
- Backend: Different Clerk instance (`ins_33MZZYixOsTUIv0RqWyeNR0HzR1`)

## The Solution

Go to your **Vercel Dashboard** (or wherever you host production) and update ALL Clerk environment variables to match your **production Clerk instance**.

### Step 1: Get Your Production Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your **PRODUCTION** application
3. Go to **API Keys** section
4. Copy these keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_...`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_...`)

### Step 2: Update Production Environment Variables

In your Vercel Dashboard (or hosting platform):

```env
# CRITICAL: Both must be from the SAME Clerk instance
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_KEY_HERE
```

### Step 3: Redeploy

After updating the keys:
1. **Redeploy** your production application
2. **Clear browser cookies** (important!)
3. Try signing in again

## Common Mistakes

❌ **Don't Mix Keys**: Using `pk_live_` with a `sk_test_` or vice versa
❌ **Don't Use Test Keys in Production**: Make sure both keys are `_live_` keys
❌ **Don't Use Keys from Different Clerk Apps**: Both keys must be from the same Clerk application

## How to Verify You're Using the Right Keys

Your Clerk keys should have matching instance IDs:
- Publishable key: `pk_live_Y2xlcmsuW...` → decodes to show instance ID
- Secret key: `sk_live_XYZ...` → should be from same instance

The `kid` in the JWT should match the instance ID of your secret key.

## Quick Check

Run this in your production environment:
```bash
# Check which Clerk instance your keys belong to
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY
```

Both should be:
- From the **same** Clerk application
- **Production keys** (`_live_` not `_test_`)
- For the instance you're actually using

## After Fix

Once keys are updated and redeployed:
1. Sign out completely
2. Clear browser cookies
3. Try signing in with email/password
4. Try signing in with Google

## Need Help?

If issue persists:
1. Double-check Clerk Dashboard → API Keys
2. Verify you're looking at the **production** environment
3. Contact Clerk support (support@clerk.com) with your instance ID

