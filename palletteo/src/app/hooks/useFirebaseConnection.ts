import { useState, useEffect } from "react";
import {
  firebaseManager,
  UserFirebaseConnection,
  FirebaseConfig,
} from "../lib/firebase-manager";
import { User } from "firebase/auth";

export const useFirebaseConnection = () => {
  const [currentConnection, setCurrentConnection] =
    useState<UserFirebaseConnection | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to Firebase
  const connectToFirebase = async (
    connectionId: string,
    config: FirebaseConfig
  ) => {
    setLoading(true);
    setError(null);

    try {
      const connection = await firebaseManager.connectToFirebase(
        connectionId,
        config
      );
      setCurrentConnection(connection);

      // Listen for auth state changes
      connection.auth.onAuthStateChanged((user) => {
        setUser(user);
      });

      return connection;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Disconnect from Firebase
  const disconnect = async (connectionId: string) => {
    try {
      await firebaseManager.disconnectFromFirebase(connectionId);
      if (currentConnection?.app.name.includes(connectionId)) {
        setCurrentConnection(null);
        setUser(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Switch connection
  const switchConnection = (connectionId: string) => {
    const success = firebaseManager.switchConnection(connectionId);
    if (success) {
      const connection = firebaseManager.getCurrentConnection();
      setCurrentConnection(connection);

      // Update user state for new connection
      if (connection) {
        connection.auth.onAuthStateChanged((user) => {
          setUser(user);
        });
      }
    }
    return success;
  };

  // Get current connection on mount
  useEffect(() => {
    const connection = firebaseManager.getCurrentConnection();
    if (connection) {
      setCurrentConnection(connection);
      connection.auth.onAuthStateChanged((user) => {
        setUser(user);
      });
    }
  }, []);

  return {
    currentConnection,
    user,
    loading,
    error,
    connectToFirebase,
    disconnect,
    switchConnection,
    getAllConnections: () => firebaseManager.getAllConnectionIds(),
    isConnected: !!currentConnection?.isConnected,
  };
};
