import { FirebaseConfig } from "./firebase-manager";

export interface SavedConnection {
  id: string;
  name: string;
  config: FirebaseConfig;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
}

class ConnectionStorage {
  private readonly STORAGE_KEY = "palletteo_saved_connections";

  saveConnection(
    connection: Omit<
      SavedConnection,
      "id" | "createdAt" | "lastUsed" | "isActive"
    >
  ): string {
    const connections = this.getAllConnections();
    const id = Date.now().toString();

    const newConnection: SavedConnection = {
      ...connection,
      id,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: connections.length === 0, // First connection is active
    };

    // Deactivate other connections if this is set as active
    const updatedConnections = connections.map((conn) => ({
      ...conn,
      isActive: false,
    }));

    updatedConnections.push(newConnection);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedConnections));
    return id;
  }

  getAllConnections(): SavedConnection[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getConnection(id: string): SavedConnection | null {
    const connections = this.getAllConnections();
    return connections.find((conn) => conn.id === id) || null;
  }

  updateConnection(id: string, updates: Partial<SavedConnection>): boolean {
    const connections = this.getAllConnections();
    const index = connections.findIndex((conn) => conn.id === id);

    if (index === -1) return false;

    connections[index] = { ...connections[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
    return true;
  }

  deleteConnection(id: string): boolean {
    const connections = this.getAllConnections();
    const filteredConnections = connections.filter((conn) => conn.id !== id);

    if (filteredConnections.length === connections.length) return false;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredConnections));
    return true;
  }

  setActiveConnection(id: string): boolean {
    const connections = this.getAllConnections();
    let found = false;

    const updatedConnections = connections.map((conn) => {
      if (conn.id === id) {
        found = true;
        return { ...conn, isActive: true, lastUsed: Date.now() };
      }
      return { ...conn, isActive: false };
    });

    if (found) {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(updatedConnections)
      );
    }

    return found;
  }

  getActiveConnection(): SavedConnection | null {
    const connections = this.getAllConnections();
    return connections.find((conn) => conn.isActive) || null;
  }
}

export const connectionStorage = new ConnectionStorage();
