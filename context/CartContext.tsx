"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number; // base price
  quantity: number;
  image: string;
  variantName?: string; // e.g. "Rosewood", "Vanilla"
  variantHex?: string;
  isSubscription: boolean;
  subscriptionFrequency?: string; // "30 days", "60 days", "90 days"
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string, isSubscription: boolean, variantName?: string) => void;
  updateQuantity: (id: string, isSubscription: boolean, variantName: string | undefined, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  discountAmount: number;
  cartTotal: number;
  bundleTier: number; // 1, 3, 6
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("nexamart_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem("nexamart_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prevCart) => {
      // Find if item with same ID, subscription status, and variant already exists
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.isSubscription === newItem.isSubscription &&
          item.variantName === newItem.variantName
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prevCart, { ...newItem, quantity }];
    });
    setCartOpen(true); // Auto-open cart drawer on add
  };

  const removeFromCart = (id: string, isSubscription: boolean, variantName?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.id === id && item.isSubscription === isSubscription && item.variantName === variantName)
      )
    );
  };

  const updateQuantity = (
    id: string,
    isSubscription: boolean,
    variantName: string | undefined,
    qty: number
  ) => {
    if (qty <= 0) {
      removeFromCart(id, isSubscription, variantName);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.isSubscription === isSubscription && item.variantName === variantName
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Base subtotal (taking subscription 10% discount into account)
  const cartSubtotal = cart.reduce((sum, item) => {
    const pricePerUnit = item.isSubscription ? item.price * 0.9 : item.price;
    return sum + pricePerUnit * item.quantity;
  }, 0);

  // Goli bundling logic:
  // If total quantity of items in cart is:
  // - 3 to 5 items: 15% discount on the subtotal
  // - 6 or more items: 25% discount on the subtotal
  let discountPercentage = 0;
  let bundleTier = 1;
  
  if (cartCount >= 6) {
    discountPercentage = 25;
    bundleTier = 6;
  } else if (cartCount >= 3) {
    discountPercentage = 15;
    bundleTier = 3;
  }

  const discountAmount = Math.round(cartSubtotal * (discountPercentage / 100));
  const cartTotal = cartSubtotal - discountAmount;

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        discountAmount,
        cartTotal,
        bundleTier
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
