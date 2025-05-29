// src/app/lib/database/adapters/firebase-adapter.ts (FIXED)
import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { DatabaseAdapter, Palette, Collection, User } from "../types";

export class FirebaseAdapter implements DatabaseAdapter {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;

  async connect(config: any): Promise<boolean> {
    try {
      // Create unique app name to avoid conflicts
      const appName = `palletteo-db-${Date.now()}`;
      this.app = initializeApp(config, appName);
      this.db = getFirestore(this.app);

      // Test connection by trying to read palettes collection (more realistic)
      // This will either succeed or fail gracefully based on security rules
      try {
        await getDocs(collection(this.db, "palettes"));
        console.log(
          "✅ Firebase connection successful - palettes collection accessible"
        );
      } catch (error: any) {
        // Check if it's a permission error or missing collection (both are OK for initial setup)
        if (error.code === "permission-denied") {
          console.log(
            "⚠️ Firebase connected but permission-denied on palettes collection"
          );
          console.log(
            "This is normal - you may need to authenticate first or update security rules"
          );
          // Still consider connection successful as Firebase is reachable
        } else if (error.code === "not-found") {
          console.log(
            "⚠️ Firebase connected but palettes collection not found - will be created on first use"
          );
          // Still successful - collection will be auto-created
        } else {
          throw error; // Re-throw unexpected errors
        }
      }

      return true;
    } catch (error: any) {
      console.error("Firebase connection failed:", error);

      // Provide helpful error messages
      if (error.code === "auth/invalid-api-key") {
        throw new Error(
          "Invalid Firebase API key. Please check your configuration."
        );
      } else if (error.code === "auth/project-not-found") {
        throw new Error(
          "Firebase project not found. Please check your Project ID."
        );
      } else if (error.message.includes("app/duplicate-app")) {
        throw new Error(
          "Firebase app already initialized. Please refresh and try again."
        );
      } else {
        throw new Error(`Firebase connection failed: ${error.message}`);
      }
    }
  }

  async disconnect(): Promise<void> {
    this.app = null;
    this.db = null;
  }

  // Palette operations
  async createPalette(palette: Palette): Promise<string> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      const docRef = await addDoc(collection(this.db, "palettes"), {
        name: palette.name,
        description: palette.description || "",
        colors: palette.colors,
        tags: palette.tags || [],
        category: palette.category || "Uncategorized",
        isPublic: palette.isPublic || false,
        createdBy: palette.createdBy || "anonymous",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Palette created with ID:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("❌ Create palette failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      }
      throw new Error(`Failed to create palette: ${error.message}`);
    }
  }

  async getPalette(id: string): Promise<Palette | null> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      const docSnap = await getDoc(doc(this.db, "palettes", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          description: data.description,
          colors: data.colors || [],
          tags: data.tags || [],
          category: data.category || "Uncategorized",
          isPublic: data.isPublic || false,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Palette;
      }
      return null;
    } catch (error: any) {
      console.error("❌ Get palette failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      }
      throw new Error(`Failed to get palette: ${error.message}`);
    }
  }

  async getAllPalettes(): Promise<Palette[]> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      const querySnapshot = await getDocs(collection(this.db, "palettes"));
      const palettes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          colors: data.colors || [],
          tags: data.tags || [],
          category: data.category || "Uncategorized",
          isPublic: data.isPublic || false,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Palette;
      });

      console.log(`✅ Loaded ${palettes.length} palettes from Firebase`);
      return palettes;
    } catch (error: any) {
      console.error("❌ Get all palettes failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      }
      throw new Error(`Failed to load palettes: ${error.message}`);
    }
  }

  async updatePalette(id: string, updates: Partial<Palette>): Promise<boolean> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(doc(this.db, "palettes", id), updateData);
      console.log("✅ Palette updated:", id);
      return true;
    } catch (error: any) {
      console.error("❌ Update palette failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      } else if (error.code === "not-found") {
        throw new Error("Palette not found.");
      }
      return false;
    }
  }

  async deletePalette(id: string): Promise<boolean> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      await deleteDoc(doc(this.db, "palettes", id));
      console.log("✅ Palette deleted:", id);
      return true;
    } catch (error: any) {
      console.error("❌ Delete palette failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      } else if (error.code === "not-found") {
        throw new Error("Palette not found.");
      }
      return false;
    }
  }

  // Collection operations
  async createCollection(collection_data: Collection): Promise<string> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      const docRef = await addDoc(collection(this.db, "collections"), {
        name: collection_data.name,
        description: collection_data.description || "",
        paletteIds: collection_data.paletteIds || [],
        isPublic: collection_data.isPublic || false,
        createdBy: collection_data.createdBy || "anonymous",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Collection created with ID:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("❌ Create collection failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      }
      throw new Error(`Failed to create collection: ${error.message}`);
    }
  }

  async getCollection(id: string): Promise<Collection | null> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      const docSnap = await getDoc(doc(this.db, "collections", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          description: data.description,
          paletteIds: data.paletteIds || [],
          isPublic: data.isPublic || false,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Collection;
      }
      return null;
    } catch (error: any) {
      console.error("❌ Get collection failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      }
      throw new Error(`Failed to get collection: ${error.message}`);
    }
  }

  async getAllCollections(): Promise<Collection[]> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      const querySnapshot = await getDocs(collection(this.db, "collections"));
      const collections = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          paletteIds: data.paletteIds || [],
          isPublic: data.isPublic || false,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Collection;
      });

      console.log(`✅ Loaded ${collections.length} collections from Firebase`);
      return collections;
    } catch (error: any) {
      console.error("❌ Get all collections failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      }
      throw new Error(`Failed to load collections: ${error.message}`);
    }
  }

  async updateCollection(
    id: string,
    updates: Partial<Collection>
  ): Promise<boolean> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(doc(this.db, "collections", id), updateData);
      console.log("✅ Collection updated:", id);
      return true;
    } catch (error: any) {
      console.error("❌ Update collection failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      } else if (error.code === "not-found") {
        throw new Error("Collection not found.");
      }
      return false;
    }
  }

  async deleteCollection(id: string): Promise<boolean> {
    if (!this.db) throw new Error("Not connected to Firebase");

    try {
      await deleteDoc(doc(this.db, "collections", id));
      console.log("✅ Collection deleted:", id);
      return true;
    } catch (error: any) {
      console.error("❌ Delete collection failed:", error);

      if (error.code === "permission-denied") {
        throw new Error(
          "Permission denied. You may need to sign in or check Firestore security rules."
        );
      } else if (error.code === "not-found") {
        throw new Error("Collection not found.");
      }
      return false;
    }
  }
}
