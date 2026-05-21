"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Sparkles, BookOpen, Mail, User, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useCart();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Sparkles },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Contact", href: "/contact", icon: Mail },
    { name: "Profile", href: "/profile", icon: User }
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none md:hidden">
      <nav className="pointer-events-auto flex items-center justify-between gap-1 px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-neutral-200/50 rounded-full shadow-[0_12px_45px_rgba(0,0,0,0.06)] w-full max-w-md transition-all duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors duration-200"
            >
              {isActive && (
                <motion.span
                  layoutId="active-nav-bg-mobile"
                  className="absolute inset-0 bg-neutral-100 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? "text-neutral-900" : "text-neutral-400"}`} />
              <span className="sr-only">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-dot-mobile"
                  className="absolute -bottom-1 w-1 h-1 bg-neutral-900 rounded-full"
                />
              )}
            </Link>
          );
        })}

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-neutral-200" />

        {/* Cart Icon Trigger */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center justify-center p-2.5 bg-neutral-950 text-white rounded-full hover:bg-neutral-900 transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="sr-only">Cart</span>
          
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 border border-white text-[9px] font-sans font-bold text-white shadow-sm"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>
    </div>
  );
}
