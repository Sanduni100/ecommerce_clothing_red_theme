"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "var(--accent)" }} />
      <h1 className="font-display text-2xl mb-2">Thank you for your order!</h1>
      <p className="text-sm text-muted mb-6">
        {orderId ? `Order #${orderId} has been placed successfully.` : "Your order has been placed successfully."} A confirmation email is on its way.
      </p>
      <Link href="/shop" className="inline-block rounded-full px-6 py-3 text-sm text-white" style={{ background: "var(--accent)" }}>
        Continue shopping
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
