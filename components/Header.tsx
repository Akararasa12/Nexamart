"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Search, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useCart();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Belanja", href: "/products" },
    { name: "Jurnal", href: "/blog" },
    { name: "Hubungi Kami", href: "/contact" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/50 bg-white/80 backdrop-blur-md transition-all duration-300">
      {/* Upper Announcement Bar for Desktop */}
      <div className="hidden md:flex w-full bg-neutral-950 text-white text-[10px] uppercase tracking-widest justify-center items-center py-2 gap-1 font-sans font-semibold">
        <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
        Nikmati Diskon Bundling Hingga 25% + Gratis Ongkos Kirim Seluruh Indonesia
      </div>

      <div className="max-w-6xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="font-serif text-xl md:text-2xl font-light tracking-[0.15em] text-neutral-950 uppercase group-hover:opacity-80 transition-opacity">
            NEXAMART
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold uppercase tracking-widest transition-colors relative py-1 ${
                  isActive ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-900"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-950 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 md:gap-5">
          {/* Search Button */}
          <Link
            href="/products"
            className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
            title="Cari Produk"
          >
            <Search className="w-4 h-4 md:w-5 h-5" />
          </Link>

          {/* Profile Button */}
          <Link
            href="/profile"
            className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
            title="Profil Saya"
          >
            <User className="w-4 h-4 md:w-5 h-5" />
          </Link>

          {/* Shopping Cart Trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors relative cursor-pointer"
            title="Keranjang Belanja"
          >
            <ShoppingBag className="w-4 h-4 md:w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-neutral-950 text-white text-[8px] font-sans font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
