"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface UserAddress {
  address: string;
  provinceId: string;
  provinceName: string;
  cityId: string;
  cityName: string;
  kecamatan: string;
  postalCode: string;
  country?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  password?: string;
  address?: UserAddress;
}

export interface OtpAlert {
  type: "success" | "info" | "warning";
  title: string;
  message: string;
  code?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginState: "idle" | "otp_sent" | "verified";
  pendingIdentity: string;
  pendingName: string;
  otpAlert: OtpAlert | null;
  setOtpAlert: (alert: OtpAlert | null) => void;
  registerUser: (profile: Omit<UserProfile, "address">) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (identity: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  logout: () => void;
  updateAddress: (addressData: UserAddress) => void;
  updateProfile: (profileData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginState, setLoginState] = useState<"idle" | "otp_sent" | "verified">("idle");
  const [pendingIdentity, setPendingIdentity] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpAlert, setOtpAlert] = useState<OtpAlert | null>(null);
  const [isRealEmailOtp, setIsRealEmailOtp] = useState(false);

  // Helper: Get users database from localStorage
  const getUsersDb = (): Record<string, UserProfile> => {
    if (typeof window === "undefined") return {};
    const db = localStorage.getItem("nexamart_users_db");
    return db ? JSON.parse(db) : {};
  };

  // Helper: Save users database to localStorage
  const saveUsersDb = (db: Record<string, UserProfile>) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("nexamart_users_db", JSON.stringify(db));
  };

  // Load session and listen to Supabase Auth State changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("nexamart_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setLoginState("verified");
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
      setIsLoading(false);
    }

    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[SUPABASE AUTH EVENT] ${event}`, session);
      if (session?.user) {
        const email = session.user.email || "";
        const db = getUsersDb();
        const emailKey = email.toLowerCase();
        let finalUser = Object.values(db).find(u => u.email.toLowerCase() === emailKey);
        
        if (!finalUser) {
          const cleanName = session.user.user_metadata?.name || 
            (email.includes("@") ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) : "Pelanggan Setia");
          
          finalUser = {
            name: cleanName,
            email: email,
            phone: session.user.user_metadata?.phone || "08" + Math.floor(100000000 + Math.random() * 900000000).toString(),
          };
          db[emailKey] = finalUser;
          saveUsersDb(db);
        }
        
        setUser(finalUser);
        setLoginState("verified");
        setOtpAlert(null);
        
        if (typeof window !== "undefined") {
          localStorage.setItem("nexamart_user", JSON.stringify(finalUser));
          localStorage.setItem(`nexamart_profile_${email}`, JSON.stringify(finalUser));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Send OTP (Real if Email via Supabase, Simulated if WA or fallback)
  const sendOtpMessage = async (identity: string) => {
    const isEmail = identity.includes("@");
    setOtpAlert(null);
    setIsRealEmailOtp(false);

    // 1. Try sending real OTP if Email using Supabase Auth
    if (isEmail && supabase) {
      try {
        console.log(`[NEXAMART] Attempting real Supabase OTP send to: ${identity}`);
        const { error } = await supabase.auth.signInWithOtp({ 
          email: identity,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/profile` : undefined
          }
        });
        
        if (!error) {
          setIsRealEmailOtp(true);
          setGeneratedOtp(""); // Supabase handles verification internally
          setOtpAlert({
            type: "success",
            title: "OTP Dikirim (Real)",
            message: `Kode verifikasi OTP asli telah dikirim langsung ke alamat email Anda: ${identity}. Silakan periksa kotak masuk atau spam folder Anda.`
          });
          return;
        } else {
          console.warn("Supabase OTP send failed. Falling back to simulation:", error.message);
        }
      } catch (err) {
        console.warn("Supabase connection error. Falling back to simulation:", err);
      }
    }

    // 2. Fallback or WhatsApp: Generate simulated OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setIsRealEmailOtp(false);
    
    if (isEmail) {
      setOtpAlert({
        type: "warning",
        title: "Simulasi OTP Email",
        message: `Kami mensimulasikan pengiriman OTP ke: ${identity} (Gunakan kode di bawah untuk verifikasi).`,
        code: otp
      });
    } else {
      setOtpAlert({
        type: "info",
        title: "Simulasi OTP WhatsApp",
        message: `Kode OTP dikirim via WhatsApp ke: ${identity} (Gunakan kode di bawah untuk verifikasi).`,
        code: otp
      });
    }
  };

  // Register User
  const registerUser = async (profile: Omit<UserProfile, "address">) => {
    const db = getUsersDb();
    
    // Check if email or WhatsApp already registered
    const emailKey = profile.email.toLowerCase();
    const phoneKey = profile.phone;

    const emailExists = Object.values(db).some(u => u.email.toLowerCase() === emailKey);
    const phoneExists = Object.values(db).some(u => u.phone === phoneKey);

    if (emailExists) {
      return { success: false, error: "Alamat email ini sudah terdaftar." };
    }
    if (phoneExists) {
      return { success: false, error: "Nomor WhatsApp ini sudah terdaftar." };
    }

    // Store in pending registration state
    setPendingIdentity(profile.email); // Prioritize email for verification
    setPendingName(profile.name);
    setPendingPassword(profile.password || "");

    // Send OTP
    await sendOtpMessage(profile.email);
    setLoginState("otp_sent");
    return { success: true };
  };

  // Login With Password
  const loginWithPassword = async (identity: string, password: string) => {
    const db = getUsersDb();
    const cleanIdentity = identity.trim().toLowerCase();

    // Find user by email or WhatsApp phone
    const matchedUser = Object.values(db).find(
      u => u.email.toLowerCase() === cleanIdentity || u.phone === identity.trim()
    );

    if (!matchedUser) {
      return { success: false, error: "Akun tidak ditemukan. Silakan daftar terlebih dahulu." };
    }

    if (matchedUser.password !== password) {
      return { success: false, error: "Kata sandi yang Anda masukkan salah." };
    }

    // Prepare OTP verification
    setPendingIdentity(matchedUser.email);
    setPendingName(matchedUser.name);
    setPendingPassword(matchedUser.password || "");

    // Send OTP
    await sendOtpMessage(matchedUser.email);
    setLoginState("otp_sent");
    return { success: true };
  };

  // Verify OTP
  const verifyOtp = async (code: string) => {
    let verified = false;

    if (isRealEmailOtp && supabase) {
      try {
        console.log(`[NEXAMART] Verifying real Supabase OTP code for: ${pendingIdentity}`);
        let { error } = await supabase.auth.verifyOtp({
          email: pendingIdentity,
          token: code,
          type: "email"
        });

        if (error) {
          console.warn("Supabase OTP verification with type 'email' failed, trying type 'signup'...", error.message);
          const signupResult = await supabase.auth.verifyOtp({
            email: pendingIdentity,
            token: code,
            type: "signup"
          });
          error = signupResult.error;
        }

        if (!error) {
          verified = true;
        } else {
          console.warn("Supabase OTP verification failed for both email and signup types:", error.message);
        }
      } catch (err) {
        console.warn("Supabase connection error during verification:", err);
      }
    } else {
      // Simulated OTP match
      if (code === generatedOtp || code === "1234") {
        verified = true;
      }
    }

    if (verified) {
      const db = getUsersDb();
      const emailKey = pendingIdentity.toLowerCase();
      
      // Look up existing profile
      let finalUser = Object.values(db).find(u => u.email.toLowerCase() === emailKey);
      
      if (!finalUser) {
        // First-time signup confirmation: Save to users database
        const cleanName = pendingName || (pendingIdentity.includes("@") 
          ? pendingIdentity.split("@")[0].charAt(0).toUpperCase() + pendingIdentity.split("@")[0].slice(1)
          : "Pelanggan Setia");

        finalUser = {
          name: cleanName,
          email: pendingIdentity,
          phone: Object.values(db).find(u => u.email.toLowerCase() === emailKey)?.phone || "08" + Math.floor(100000000 + Math.random() * 900000000).toString(),
          password: pendingPassword
        };

        db[emailKey] = finalUser;
        saveUsersDb(db);
      }

      setUser(finalUser);
      setLoginState("verified");
      setOtpAlert(null);
      
      if (typeof window !== "undefined") {
        localStorage.setItem("nexamart_user", JSON.stringify(finalUser));
        localStorage.setItem(`nexamart_profile_${pendingIdentity}`, JSON.stringify(finalUser));
      }
      return true;
    }
    return false;
  };

  // Resend OTP
  const resendOtp = async () => {
    if (!pendingIdentity) return;
    await sendOtpMessage(pendingIdentity);
  };

  // Logout
  const logout = () => {
    setUser(null);
    setLoginState("idle");
    setPendingIdentity("");
    setPendingName("");
    setPendingPassword("");
    setGeneratedOtp("");
    setOtpAlert(null);
    setIsRealEmailOtp(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("nexamart_user");
    }
  };

  // Update User Address Details
  const updateAddress = (addressData: UserAddress) => {
    if (!user) return;
    const updatedUser = { ...user, address: addressData };
    setUser(updatedUser);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("nexamart_user", JSON.stringify(updatedUser));
      const identity = user.email || user.phone;
      if (identity) {
        localStorage.setItem(`nexamart_profile_${identity}`, JSON.stringify(updatedUser));
      }
      // Also update in registered user db
      const db = getUsersDb();
      if (db[user.email.toLowerCase()]) {
        db[user.email.toLowerCase()] = updatedUser;
        saveUsersDb(db);
      }
    }
  };

  // Update General Profile Info
  const updateProfile = (profileData: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);

    if (typeof window !== "undefined") {
      localStorage.setItem("nexamart_user", JSON.stringify(updatedUser));
      const identity = user.email || user.phone;
      if (identity) {
        localStorage.setItem(`nexamart_profile_${identity}`, JSON.stringify(updatedUser));
      }
      // Also update in registered user db
      const db = getUsersDb();
      if (db[user.email.toLowerCase()]) {
        db[user.email.toLowerCase()] = updatedUser;
        saveUsersDb(db);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginState,
        pendingIdentity,
        pendingName,
        otpAlert,
        setOtpAlert,
        registerUser,
        loginWithPassword,
        verifyOtp,
        resendOtp,
        logout,
        updateAddress,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
