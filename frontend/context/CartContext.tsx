"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api, { apiErrorMessage } from "@/lib/api";
import { useAuth } from "./AuthContext";

export type CartItem = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  image: string | null;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: number, quantity: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType>({
  items: [],
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  refresh: async () => {},
  total: 0,
  count: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    try {
      const { data } = await api.get("/cart");
      setItems(data.map((d: any) => ({ ...d, price: Number(d.price) })));
    } catch {
      // silent — cart just stays empty until next refresh
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  async function addToCart(productId: number, quantity: number, size?: string, color?: string) {
    if (!user) {
      toast.error("Please sign in to add items to your cart");
      return;
    }
    try {
      await api.post("/cart", { product_id: productId, quantity, size, color });
      await refresh();
      toast.success("Added to cart");
      setIsOpen(true);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not add to cart"));
    }
  }

  async function updateQuantity(id: number, quantity: number) {
    try {
      await api.put(`/cart/${id}`, { quantity });
      await refresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update quantity"));
    }
  }

  async function removeItem(id: number) {
    try {
      await api.delete(`/cart/${id}`);
      await refresh();
      toast.success("Item removed");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not remove item"));
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items, isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart, updateQuantity, removeItem, refresh, total, count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
