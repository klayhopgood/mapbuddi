import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Please provide a valid discount code' },
        { status: 400 }
      );
    }

    // Retrieve the coupon from Stripe
    const coupon = await stripe.coupons.retrieve(code.trim());

    // Check if coupon is valid and active
    if (!coupon.valid) {
      return NextResponse.json({
        valid: false,
        message: 'This discount code is no longer valid'
      });
    }

    // Check if coupon has expired
    if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({
        valid: false,
        message: 'This discount code has expired'
      });
    }

    // Check if coupon has reached its redemption limit
    if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
      return NextResponse.json({
        valid: false,
        message: 'This discount code has reached its usage limit'
      });
    }

    // Format the discount information
    const discount = {
      amount: coupon.amount_off || coupon.percent_off || 0,
      type: coupon.amount_off ? 'fixed' as const : 'percentage' as const,
    };

    // Create success message
    let message = 'Discount code applied!';
    if (discount.type === 'percentage') {
      message = `${discount.amount}% discount applied!`;
    } else {
      message = `$${(discount.amount / 100).toFixed(2)} discount applied!`;
    }

    return NextResponse.json({
      valid: true,
      message,
      discount,
      coupon: {
        id: coupon.id,
        name: coupon.name,
        duration: coupon.duration,
        duration_in_months: coupon.duration_in_months,
      }
    });

  } catch (error: any) {
    console.error('Discount validation error:', error);

    // Handle specific Stripe errors
    if (error.type === 'invalid_request_error' && error.code === 'resource_missing') {
      return NextResponse.json({
        valid: false,
        message: 'Discount code not found'
      });
    }

    return NextResponse.json(
      { valid: false, message: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
