// src/app/lib/firebase-manager.ts (FIXED)
import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface UserFirebaseConnection {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  config: FirebaseConfig;
  isConnected: boolean;
}

class FirebaseManager {
  private connections: Map<string, UserFirebaseConnection> = new Map();
  private currentConnectionId: string | null = null;

  // Initialize a user's Firebase connection
  async connectToFirebase(
    connectionId: string,
    config: FirebaseConfig
  ): Promise<UserFirebaseConnection> {
    try {
      // Check if connection already exists
      if (this.connections.has(connectionId)) {
        return this.connections.get(connectionId)!;
      }

      // Create unique app name to avoid conflicts
      const appName = `palletteo-${connectionId}-${Date.now()}`;

      // Initialize Firebase app
      const app = initializeApp(config, appName);
      const auth = getAuth(app);
      const db = getFirestore(app);
      const storage = getStorage(app);

      const connection: UserFirebaseConnection = {
        app,
        auth,
        db,
        storage,
        config,
        isConnected: true,
      };

      // Store connection
      this.connections.set(connectionId, connection);
      this.currentConnectionId = connectionId;

      return connection;
    } catch (error) {
      console.error("Failed to connect to Firebase:", error);
      throw new Error(`Failed to connect to Firebase: ${error}`);
    }
  }

  // Get current active connection
  getCurrentConnection(): UserFirebaseConnection | null {
    if (!this.currentConnectionId) return null;
    return this.connections.get(this.currentConnectionId) || null;
  }

  // Switch between connections
  switchConnection(connectionId: string): boolean {
    if (this.connections.has(connectionId)) {
      this.currentConnectionId = connectionId;
      return true;
    }
    return false;
  }

  // Disconnect from a Firebase instance
  async disconnectFromFirebase(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Note: Firebase Web SDK doesn't have a direct way to delete apps
      // But we can remove our reference and clear auth state
      await connection.auth.signOut().catch(() => {});
      this.connections.delete(connectionId);

      if (this.currentConnectionId === connectionId) {
        this.currentConnectionId = null;
      }
    }
  }

  // Get all connection IDs
  getAllConnectionIds(): string[] {
    return Array.from(this.connections.keys());
  }

  // Validate Firebase config - UPDATED with correct storage bucket validation
  validateConfig(config: Partial<FirebaseConfig>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const required = [
      "apiKey",
      "authDomain",
      "projectId",
      "storageBucket",
      "messagingSenderId",
      "appId",
    ];

    for (const field of required) {
      if (!config[field as keyof FirebaseConfig]) {
        errors.push(`${field} is required`);
      }
    }

    // Validate format
    if (config.authDomain && !config.authDomain.includes(".firebaseapp.com")) {
      errors.push("authDomain should end with .firebaseapp.com");
    }

    // UPDATED: Firebase now uses both .appspot.com and .firebasestorage.app
    if (config.storageBucket) {
      const bucket = config.storageBucket;
      const validStorageFormats = [
        ".appspot.com", // Legacy format
        ".firebasestorage.app", // New format (like yours)
      ];

      const isValidStorage = validStorageFormats.some((format) =>
        bucket.includes(format)
      );

      if (!isValidStorage) {
        errors.push(
          "storageBucket should end with .appspot.com or .firebasestorage.app"
        );
      }
    }

    // Validate App ID format
    if (config.appId && !config.appId.match(/^\d+:\d+:web:[a-f0-9]+$/)) {
      errors.push("appId format appears invalid");
    }

    // Validate API Key format
    if (config.apiKey && !config.apiKey.startsWith("AIza")) {
      errors.push("apiKey format appears invalid");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Create singleton instance
export const firebaseManager = new FirebaseManager();
