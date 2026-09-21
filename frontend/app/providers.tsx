"use client";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import LiveChat from "@/components/LiveChat";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
            <CartDrawer />
            <LiveChat />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)" },
                success: { iconTheme: { primary: "#a00b24", secondary: "#fff" } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
