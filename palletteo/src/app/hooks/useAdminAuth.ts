// src/app/hooks/useAdminAuth.ts (FIXED)
import { useState, useEffect, useCallback } from "react";
import { adminAuth } from "../lib/admin-auth";
import { AdminUser } from "../lib/types";

export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the extendSession function to prevent it from changing on every render
  const extendSession = useCallback(() => {
    adminAuth.extendSession();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let activityListeners: (() => void)[] = [];

    const setupAuth = async () => {
      try {
        // Check current user on mount
        const currentUser = adminAuth.getCurrentUser();
        setUser(currentUser);
        setLoading(false);

        // Listen for auth state changes
        unsubscribe = adminAuth.onAuthStateChanged((user) => {
          setUser(user);
          setLoading(false);
        });

        // Setup activity listeners for session extension
        const handleActivity = () => {
          if (adminAuth.getCurrentUser()) {
            adminAuth.extendSession();
          }
        };

        const events = ["click", "keypress", "scroll", "mousemove"];
        events.forEach((event) => {
          window.addEventListener(event, handleActivity, { passive: true });
          activityListeners.push(() =>
            window.removeEventListener(event, handleActivity)
          );
        });
      } catch (err) {
        console.error("Auth setup error:", err);
        setError("Failed to initialize authentication");
        setLoading(false);
      }
    };

    setupAuth();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      activityListeners.forEach((cleanup) => cleanup());
    };
  }, []); // Empty dependency array - this effect should only run once

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await adminAuth.signInWithEmail(email, password);

        if (result.success && result.user) {
          setUser(result.user);
        } else {
          setError(result.error || "Sign-in failed");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await adminAuth.registerWithEmail(
          email,
          password,
          displayName
        );

        if (result.success && result.user) {
          setUser(result.user);
          return { success: true };
        } else {
          setError(result.error || "Registration failed");
          return { success: false, error: result.error };
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await adminAuth.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Sign-out failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeSystem = useCallback(async () => {
    return await adminAuth.initializeSystem();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signInWithEmail,
    registerWithEmail,
    signOut,
    extendSession,
    initializeSystem,
  };
};
