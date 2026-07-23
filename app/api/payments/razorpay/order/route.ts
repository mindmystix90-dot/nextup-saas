import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/services/commerce.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, userName, userEmail, packageId, packageName, courseId, amount, couponCode } = body;

    if (!uid || !amount || !packageName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (uid, amount, packageName)' },
        { status: 400 }
      );
    }

    // Create internal order record with public ID format ORD-YYMMDD-XXXX
    const order = await createOrder({
      uid,
      userName: userName || 'Learner',
      userEmail: userEmail || 'user@example.com',
      packageId: packageId || 'pro',
      packageName,
      courseId: courseId || '',
      amount: Number(amount),
      couponCode,
    });

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_nextup_mock';

    // Simulated / standard Razorpay order ID structure
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      razorpayOrderId,
      amount: order.totalAmount * 100, // Amount in paise for Razorpay
      currency: 'INR',
      key: keyId,
      order,
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
