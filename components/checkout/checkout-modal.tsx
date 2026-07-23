'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Tag,
  ArrowRight,
  Sparkles,
  Receipt,
  Building2,
  QrCode,
  Copy,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { validateCoupon } from '@/services/coupons.service';
import { createOrder } from '@/services/commerce.service';
import type { Order } from '@/types';
import { toast } from 'sonner';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    type?: 'membership' | 'course';
  };
}

export function CheckoutModal({ isOpen, onClose, item }: CheckoutModalProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'bank_transfer' | 'qr'>('upi');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

  const basePrice = Math.max(0, item.price - discountAmount);
  const taxAmount = Math.round(basePrice * 0.18);
  const finalTotal = basePrice + taxAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const coupon = await validateCoupon(couponCode.trim());
      if (coupon) {
        let disc = 0;
        if (coupon.discountType === 'percentage') {
          disc = Math.round((item.price * coupon.discountValue) / 100);
        } else {
          disc = coupon.discountValue;
        }
        setDiscountAmount(disc);
        setAppliedCoupon(coupon.code);
        toast.success(`Coupon "${coupon.code}" applied! Savings: ₹${disc}`);
      } else {
        toast.error('Invalid or expired coupon code');
      }
    } catch {
      toast.error('Failed to validate coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleSubmitManualPayment = async () => {
    if (!user) {
      toast.error('Please log in to complete your purchase.');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!paymentRef.trim()) {
      toast.error('Please enter your UTR / Payment Transaction Reference Number.');
      return;
    }

    setProcessing(true);
    try {
      const order = await createOrder({
        uid: user.uid,
        userName: user.name || 'Student',
        userEmail: user.email,
        packageId: item.id,
        packageName: item.name,
        courseId: item.type === 'course' ? item.id : undefined,
        amount: finalTotal,
        couponCode: appliedCoupon || undefined,
        paymentMethod: selectedMethod,
        paymentProofRef: paymentRef.trim(),
        paymentProofNotes: paymentNotes.trim(),
      });

      setSubmittedOrder(order);
      toast.success('Payment proof submitted successfully! Pending admin verification.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit payment proof.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setSubmittedOrder(null);
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    setPaymentRef('');
    setPaymentNotes('');
    onClose();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-6">
        {submittedOrder ? (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
              <Clock className="h-10 w-10 animate-pulse" />
            </div>
            <div>
              <Badge className="bg-warning/10 text-warning border-transparent mb-2">Pending Admin Approval</Badge>
              <DialogTitle className="font-display text-2xl font-bold">Payment Proof Submitted!</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Your payment reference <span className="font-mono font-semibold text-foreground">{paymentRef}</span> for <span className="font-semibold text-foreground">{item.name}</span> has been received.
              </DialogDescription>
            </div>

            <div className="bg-secondary/40 rounded-2xl p-4 text-left text-xs space-y-2 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-semibold">{submittedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Ref (UTR):</span>
                <span className="font-mono font-semibold">{paymentRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Method:</span>
                <span className="uppercase font-semibold">{selectedMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold text-sm text-primary">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 text-left flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Admin will verify your payment proof within 1-2 hours and unlock your membership access automatically.</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="w-full font-semibold"
                onClick={() => {
                  handleClose();
                  router.push('/dashboard/orders');
                }}
              >
                <Receipt className="mr-2 h-4 w-4" /> View My Orders
              </Button>
              <Button
                className="w-full bg-brand-gradient font-semibold"
                onClick={() => {
                  handleClose();
                  router.push('/dashboard');
                }}
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <DialogTitle className="font-display text-xl font-bold">Manual Checkout</DialogTitle>
              </div>
              <DialogDescription>
                Transfer payment using UPI or Bank Transfer, then submit your transaction UTR reference.
              </DialogDescription>
            </DialogHeader>

            {/* Summary Box */}
            <div className="rounded-2xl bg-secondary/50 p-4 border border-border space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base">{item.name}</h4>
                  {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
                </div>
                <Badge variant="secondary">Manual Approval</Badge>
              </div>

              {/* Price calculation */}
              <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border">
                  <span>Total Payable</span>
                  <span className="text-primary text-base">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" /> Promo or Coupon Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-xl p-2.5 text-xs">
                  <span className="font-semibold text-success flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Coupon &apos;{appliedCoupon}&apos; Applied!
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={handleRemoveCoupon}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon (e.g. NEXTUP20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                  >
                    {isValidatingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            {/* Payment Transfer Instructions */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground">Select Payment Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI / GPay', icon: Sparkles },
                  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
                  { id: 'qr', label: 'QR Scan', icon: QrCode },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs gap-1.5 transition-all ${
                        selectedMethod === m.id
                          ? 'border-primary bg-primary/5 font-semibold text-foreground'
                          : 'border-border text-muted-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${selectedMethod === m.id ? 'text-primary' : ''}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-2 border border-slate-800">
                {selectedMethod === 'upi' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">UPI ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">nextup@upi</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-300" onClick={() => copyToClipboard('nextup@upi', 'UPI ID')}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">Pay using GPay, PhonePe, Paytm, or any UPI app to <span className="font-semibold text-white">nextup@upi</span>.</p>
                  </div>
                )}

                {selectedMethod === 'bank_transfer' && (
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between"><span className="text-slate-400">Bank:</span><span>HDFC Bank</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Account Name:</span><span>NextUp Technologies Ltd</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Account No:</span><span>50200012345678</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">IFSC Code:</span><span>HDFC0001234</span></div>
                  </div>
                )}

                {selectedMethod === 'qr' && (
                  <div className="text-center space-y-2 py-1">
                    <div className="bg-white p-3 inline-block rounded-xl mx-auto text-slate-900 font-mono text-[10px] font-bold">
                      [ NEXTUP ACADEMY UPI QR CODE ]
                    </div>
                    <p className="text-[11px] text-slate-400">Scan QR code in any Banking/UPI App & pay ₹{finalTotal.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Proof Input */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Payment Transaction Reference / UTR Number *</label>
                <Input
                  placeholder="e.g. 421893120194 or UPI Ref ID"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Additional Notes (Optional)</label>
                <Textarea
                  placeholder="e.g. Paid via GPay from Rajesh Kumar"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="mt-1 text-xs min-h-[60px]"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <Button
                onClick={handleSubmitManualPayment}
                disabled={processing || !paymentRef.trim()}
                className="w-full bg-brand-gradient font-bold h-11 text-sm shadow-premium"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting Payment Proof...
                  </span>
                ) : (
                  <span>Submit Payment Proof for Approval</span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span>Verified Manual Approval · Fast 1-2 Hour Activation</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
