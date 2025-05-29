import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "./firebase";
import { AdminUser, UserRecord } from "./types";
import { userService } from "./user-service";

class AdminAuth {
  private readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  private readonly STORAGE_KEY = "palletteo_admin_user";

  // Email Sign-In
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("🔐 Starting email sign-in...");

      const result = await signInWithEmailAndPassword(auth, email, password);
      return await this.processFirebaseUser(result.user);
    } catch (error: any) {
      return this.handleAuthError(error, "Email sign-in failed");
    }
  }

  // Email Registration
  async registerWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResult> {
    try {
      console.log("🔐 Starting email registration...");

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Add user to database (starts as non-admin)
      await userService.createUser(
        email,
        displayName,
        result.user.photoURL || undefined
      );

      console.log("✅ User registered and added to database:", email);

      // Try to process as admin user
      return await this.processFirebaseUser(result.user);
    } catch (error: any) {
      return this.handleAuthError(error, "Registration failed");
    }
  }

  private async processFirebaseUser(user: User): Promise<AuthResult> {
    try {
      // Check if user is admin in database
      const isAdmin = await userService.isUserAdmin(user.email!);

      if (!isAdmin) {
        await this.signOut();
        return {
          success: false,
          error: `Access denied. ${user.email} is not an admin. Contact an administrator to get admin access.`,
        };
      }

      // Get user details from database
      const userRecord = await userService.getUser(user.email!);

      // Update last login
      await userService.updateLastLogin(user.email!);

      const adminUser: AdminUser = {
        uid: user.uid,
        email: user.email!,
        name: user.displayName || userRecord?.name || user.email!.split("@")[0],
        photoURL: user.photoURL || userRecord?.photoURL,
        isAdmin: true,
        role: userRecord?.role || "admin",
        loginTime: Date.now(),
        expiresAt: Date.now() + this.SESSION_DURATION,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(adminUser));
      console.log("✅ Admin session created:", adminUser);

      return { success: true, user: adminUser };
    } catch (error) {
      console.error("❌ Error processing Firebase user:", error);
      return {
        success: false,
        error: "Failed to verify admin status. Please try again.",
      };
    }
  }

  private handleAuthError(error: any, defaultMessage: string): AuthResult {
    const errorMessages: Record<string, string> = {
      "auth/user-not-found": "No account found with this email address.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "Account with this email already exists.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/invalid-email": "Invalid email address.",
    };

    return {
      success: false,
      error: errorMessages[error.code] || defaultMessage,
    };
  }

  async signOut(): Promise<void> {
    try {
      console.log("🚪 Signing out...");
      await signOut(auth);
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("✅ Sign-out successful");
    } catch (error) {
      console.error("❌ Sign-out failed:", error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  getCurrentUser(): AdminUser | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      if (!userData) return null;

      const user: AdminUser = JSON.parse(userData);
      if (Date.now() > user.expiresAt) {
        console.log("⏰ Admin session expired");
        this.signOut();
        return null;
      }

      return user;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser()?.isAdmin ?? false;
  }

  extendSession(): void {
    const user = this.getCurrentUser();
    if (user) {
      user.expiresAt = Date.now() + this.SESSION_DURATION;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      console.log("⏰ Admin session extended");
    }
  }

  onAuthStateChanged(callback: (user: AdminUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdmin = await userService.isUserAdmin(firebaseUser.email!);
        if (isAdmin) {
          callback(this.getCurrentUser());
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Initialize system (call this once to set up first admin)
  async initializeSystem(): Promise<boolean> {
    return await userService.initializeFirstAdmin(
      "james.gibbens@gmail.com", // Your email
      "James Gibbens" // Your name
    );
  }
}

interface AuthResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

export const adminAuth = new AdminAuth();
