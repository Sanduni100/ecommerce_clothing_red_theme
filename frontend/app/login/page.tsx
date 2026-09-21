"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      router.push(user.role === "admin" ? "/admin" : "/shop");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not sign in"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl mb-1">Welcome back</h1>
      <p className="text-sm text-muted mb-8">Sign in to continue shopping.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }}
        />
        <PasswordInput value={password} onChange={setPassword} />
        <button
          type="submit" disabled={loading}
          className="w-full rounded-full py-3 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-muted mt-6">
        New to Lumine?{" "}
        <Link href="/register" style={{ color: "var(--accent)" }}>Create an account</Link>
      </p>
    </div>
  );
}
