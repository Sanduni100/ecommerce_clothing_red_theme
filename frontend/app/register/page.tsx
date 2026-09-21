"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(name, email, password);
      toast.success(`Welcome to Lumine, ${user.name.split(" ")[0]}!`);
      router.push("/shop");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl mb-1">Create your account</h1>
      <p className="text-sm text-muted mb-8">Join Lumine for a faster checkout and order tracking.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }}
        />
        <input
          required type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }}
        />
        <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" placeholder="Password (min. 6 characters)" />
        <button
          type="submit" disabled={loading}
          className="w-full rounded-full py-3 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
      </p>
    </div>
  );
}
