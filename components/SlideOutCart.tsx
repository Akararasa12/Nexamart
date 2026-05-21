"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function SlideOutCart() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartCount,
    cartSubtotal,
    discountAmount,
    cartTotal,
    bundleTier
  } = useCart();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-md bg-white shadow-2xl h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-900" />
                <h2 className="font-serif text-lg text-neutral-900 font-semibold tracking-wide">
                  Tas Belanja ({cartCount})
                </h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <ShoppingBag className="w-12 h-12 text-neutral-200 mb-4" />
                  <p className="font-serif text-neutral-800 text-lg tracking-wide">
                    Tas Belanja Anda Kosong
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
                    Jelajahi ritual kosmetik White Clean kami dan temukan keajaiban kulit Anda.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-6 px-6 py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-full hover:bg-neutral-900 transition-all duration-200 shadow-sm uppercase tracking-widest cursor-pointer"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bundling Promotion Banner */}
                  {bundleTier < 6 && (
                    <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl text-center">
                      <p className="text-xs text-neutral-600 font-medium">
                        {bundleTier === 1 ? (
                          <>
                            Beli <span className="font-bold text-neutral-950">2 botol lagi</span> untuk hemat{" "}
                            <span className="font-bold text-neutral-950">15%</span>!
                          </>
                        ) : (
                          <>
                            Beli <span className="font-bold text-neutral-950">3 botol lagi</span> untuk hemat{" "}
                            <span className="font-bold text-neutral-950">25% (Hemat Terbesar)</span>!
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {cart.map((item) => {
                    const originalPrice = item.price;
                    const finalPrice = item.isSubscription ? originalPrice * 0.9 : originalPrice;

                    return (
                      <motion.div
                        layout
                        key={`${item.id}-${item.isSubscription}-${item.variantName}`}
                        className="flex gap-4 p-3 bg-white hover:bg-neutral-50/50 border border-neutral-100 rounded-xl transition-all duration-200"
                      >
                        <div className="relative w-20 h-20 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {/* Fallback product layout with letters or small box */}
                          <div className="text-neutral-300 font-serif text-xs uppercase text-center p-1 select-none">
                            {item.name.substring(0, 8)}
                          </div>
                          {item.variantHex && (
                            <span
                              className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white ring-1 ring-neutral-200"
                              style={{ backgroundColor: item.variantHex }}
                            />
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-serif font-bold text-sm text-neutral-900 tracking-tight leading-snug">
                                {item.name}
                              </h3>
                              <button
                                onClick={() => removeFromCart(item.id, item.isSubscription, item.variantName)}
                                className="text-neutral-300 hover:text-neutral-500 text-xs transition-colors p-1 cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-1">
                              {item.variantName && (
                                <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                                  Varian: {item.variantName}
                                </span>
                              )}
                              {item.isSubscription && (
                                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-100/50">
                                  Langganan ({item.subscriptionFrequency})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-end mt-2">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-neutral-200 rounded-full bg-white scale-90 origin-left">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.isSubscription,
                                    item.variantName,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold text-neutral-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.isSubscription,
                                    item.variantName,
                                    item.quantity + 1
                                  )
                                }
                                className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              {item.isSubscription && (
                                <span className="block text-[10px] line-through text-neutral-400">
                                  {formatRupiah(originalPrice * item.quantity)}
                                </span>
                              )}
                              <span className="text-sm font-semibold text-neutral-900">
                                {formatRupiah(finalPrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-100 p-6 space-y-4 bg-neutral-50/50">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Subtotal</span>
                    <span>{formatRupiah(cartSubtotal)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-red-600 font-medium">
                      <span>Diskon Bundling ({bundleTier === 3 ? "15%" : "25%"})</span>
                      <span>-{formatRupiah(discountAmount)}</span>
                    </div>
                  )}

                  <div className="h-px bg-neutral-100 my-1" />

                  <div className="flex justify-between items-baseline">
                    <span className="font-serif text-sm font-semibold text-neutral-800">Total Harga</span>
                    <span className="text-lg font-bold text-neutral-950">{formatRupiah(cartTotal)}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    *Belum termasuk ongkos kirim RajaOngkir (dihitung di halaman checkout).
                  </p>
                </div>

                <div className="grid gap-2">
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md group cursor-pointer"
                  >
                    Lanjut ke Pembayaran
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
                    <Lock className="w-3 h-3" />
                    <span>Pembayaran Amankan oleh Midtrans Gateway</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
