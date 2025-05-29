import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserRecord } from "./types";

class UserService {
  private readonly USERS_COLLECTION = "users";

  // Add user to database when they register
  async createUser(
    email: string,
    name: string,
    photoURL?: string
  ): Promise<boolean> {
    try {
      const userRecord: Omit<UserRecord, "id"> = {
        email,
        name,
        isAdmin: false, // Everyone starts as non-admin
        role: "admin", // Default role when they become admin
        createdAt: serverTimestamp() as Timestamp,
        photoURL,
      };

      await setDoc(doc(db, this.USERS_COLLECTION, email), userRecord);
      console.log("✅ User created:", email);
      return true;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      return false;
    }
  }

  // Check if user is admin
  async isUserAdmin(email: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, email));

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserRecord;
        return userData.isAdmin === true;
      }

      return false;
    } catch (error) {
      console.error("Error checking if user is admin:", error);
      return false;
    }
  }

  // Get user details
  async getUser(email: string): Promise<UserRecord | null> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, email));

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserRecord;
      }

      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  // Make user admin (manual promotion)
  async makeUserAdmin(
    email: string,
    role: "admin" | "super_admin" = "admin"
  ): Promise<boolean> {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, email), {
        isAdmin: true,
        role,
        promotedAt: serverTimestamp(),
      });

      console.log("✅ User promoted to admin:", email);
      return true;
    } catch (error) {
      console.error("❌ Error promoting user to admin:", error);
      return false;
    }
  }

  // Remove admin status
  async removeAdminStatus(email: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, email), {
        isAdmin: false,
        demotedAt: serverTimestamp(),
      });

      console.log("✅ Admin status removed:", email);
      return true;
    } catch (error) {
      console.error("❌ Error removing admin status:", error);
      return false;
    }
  }

  // Update last login
  async updateLastLogin(email: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.USERS_COLLECTION, email), {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  // Get all users (for admin management)
  async getAllUsers(): Promise<UserRecord[]> {
    try {
      const usersSnapshot = await getDocs(
        collection(db, this.USERS_COLLECTION)
      );
      return usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserRecord[];
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  // Initialize first admin (run once)
  async initializeFirstAdmin(email: string, name: string): Promise<boolean> {
    try {
      // Check if any admins exist
      const users = await this.getAllUsers();
      const hasAdmin = users.some((user) => user.isAdmin);

      if (!hasAdmin) {
        // Create first user as super admin
        const userRecord: Omit<UserRecord, "id"> = {
          email,
          name,
          isAdmin: true,
          role: "super_admin",
          createdAt: serverTimestamp() as Timestamp,
        };

        await setDoc(doc(db, this.USERS_COLLECTION, email), userRecord);
        console.log("✅ First super admin initialized:", email);
        return true;
      } else {
        console.log("⚠️ Admin already exists, skipping initialization");
        return false;
      }
    } catch (error) {
      console.error("❌ Error initializing first admin:", error);
      return false;
    }
  }
}

export const userService = new UserService();
