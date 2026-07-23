import { NextRequest, NextResponse } from 'next/server';
import { approveManualPayment } from '@/services/commerce.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    // Approve payment: update order, create payment & invoice, grant access, write activity & audit log
    const result = await approveManualPayment(orderId, 'system_gateway');

    return NextResponse.json({
      success: true,
      message: 'Payment verified and package activated successfully',
      order: result.order,
      payment: result.payment,
      invoice: result.invoice,
    });
  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
