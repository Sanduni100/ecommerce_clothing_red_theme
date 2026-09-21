"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import api, { apiErrorMessage } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/format";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function CheckoutForm() {
  const { items, total, refresh } = useCart();
  const { currency } = useCurrency();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [shipping, setShipping] = useState({ name: "", address: "", city: "", phone: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!shipping.name || !shipping.address || !shipping.city || !shipping.phone) {
      toast.error("Please fill in all shipping details");
      return;
    }
    setPlacing(true);
    try {
      const { data: intent } = await api.post("/orders/create-payment-intent", {
        amount: Math.round(total * 100),
      });
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card details are missing");
      const result = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: { card, billing_details: { name: shipping.name } },
      });
      if (result.error) {
        toast.error(result.error.message || "Payment failed. Please check your card details.");
        setPlacing(false);
        return;
      }
      const { data: order } = await api.post("/orders", {
        items: items.map((i) => ({
          product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity, size: i.size, color: i.color,
        })),
        total,
        payment_intent_id: result.paymentIntent?.id,
        shipping,
      });
      await refresh();
      toast.success("Order placed successfully!");
      router.push(`/checkout/success?order=${order.id}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Checkout failed. Please try again."));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-5">
        <h2 className="font-display text-xl mb-2">Shipping details</h2>
        <input required placeholder="Full name" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
          className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
        <input required placeholder="Address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
          className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
            className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          <input required placeholder="Phone" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
            className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
        </div>

        <h2 className="font-display text-xl mb-2 pt-4">Payment</h2>
        <div className="rounded-lg border px-3 py-3.5" style={{ borderColor: "var(--border)" }}>
          <CardElement options={{ style: { base: { fontSize: "14px", color: "var(--text)" } } }} />
        </div>
        <p className="text-xs text-muted">Use test card 4242 4242 4242 4242, any future date and any CVC in test mode.</p>
      </div>

      <div className="card rounded-xl2 p-6 h-fit">
        <h3 className="font-display text-lg mb-4">Order total</h3>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm mb-2">
            <span className="text-muted truncate pr-2">{i.name} × {i.quantity}</span>
            <span>{formatPrice(i.price * i.quantity, currency)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold mt-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <span>Total</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
        <button
          type="submit"
          disabled={!stripe || placing || items.length === 0}
          className="w-full mt-5 rounded-full py-3 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {placing ? "Processing…" : `Pay ${formatPrice(total, currency)}`}
        </button>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl mb-8">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
