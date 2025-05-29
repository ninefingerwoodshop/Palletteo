import {
  DatabaseAdapter,
  DatabaseConfig,
  DatabaseConnection,
  DatabaseType,
} from "./types";
import { FirebaseAdapter } from "./adapters/firebase-adapter";
import { SupabaseAdapter } from "./adapters/supabase-adapter";

class DatabaseManager {
  private connections: Map<string, DatabaseConnection> = new Map();
  private currentConnectionId: string | null = null;
  private readonly STORAGE_KEY = "palletteo_database_connections";

  // Create adapter based on database type
  private createAdapter(type: DatabaseType): DatabaseAdapter {
    switch (type) {
      case "firebase":
        return new FirebaseAdapter();
      case "supabase":
        return new SupabaseAdapter();
      // Add more adapters as needed
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  // Connect to a database
  async connectToDatabase(config: DatabaseConfig): Promise<string> {
    try {
      const adapter = this.createAdapter(config.type);
      const connected = await adapter.connect(config.config);

      if (!connected) {
        throw new Error(`Failed to connect to ${config.type} database`);
      }

      const connectionId = Date.now().toString();
      const connection: DatabaseConnection = {
        id: connectionId,
        type: config.type,
        name: config.name,
        isConnected: true,
        client: adapter,
        config: config.config,
      };

      this.connections.set(connectionId, connection);
      this.currentConnectionId = connectionId;
      this.saveConnection(config);

      console.log(`✅ Connected to ${config.type} database: ${config.name}`);
      return connectionId;
    } catch (error) {
      console.error(`❌ Database connection failed:`, error);
      throw error;
    }
  }

  // Get current active connection
  getCurrentConnection(): DatabaseConnection | null {
    if (!this.currentConnectionId) return null;
    return this.connections.get(this.currentConnectionId) || null;
  }

  // Get current adapter for database operations
  getCurrentAdapter(): DatabaseAdapter | null {
    const connection = this.getCurrentConnection();
    return connection?.client || null;
  }

  // Switch between connections
  switchConnection(connectionId: string): boolean {
    if (this.connections.has(connectionId)) {
      this.currentConnectionId = connectionId;
      return true;
    }
    return false;
  }

  // Disconnect from database
  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      await connection.client.disconnect();
      this.connections.delete(connectionId);

      if (this.currentConnectionId === connectionId) {
        this.currentConnectionId = null;
      }
    }
  }

  // Save connection config to localStorage
  private saveConnection(config: DatabaseConfig): void {
    const savedConnections = this.getSavedConnections();
    const existingIndex = savedConnections.findIndex(
      (c) => c.name === config.name
    );

    if (existingIndex >= 0) {
      savedConnections[existingIndex] = { ...config, lastUsed: Date.now() };
    } else {
      savedConnections.push({ ...config, lastUsed: Date.now() });
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedConnections));
  }

  // Get saved connections
  getSavedConnections(): DatabaseConfig[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Set active connection
  setActiveConnection(name: string): boolean {
    const savedConnections = this.getSavedConnections();
    const updated = savedConnections.map((conn) => ({
      ...conn,
      isActive: conn.name === name,
      lastUsed: conn.name === name ? Date.now() : conn.lastUsed,
    }));

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    return true;
  }

  // Get active connection config
  getActiveConnectionConfig(): DatabaseConfig | null {
    const connections = this.getSavedConnections();
    return connections.find((c) => c.isActive) || null;
  }

  // Test connection without saving
  async testConnection(type: DatabaseType, config: any): Promise<boolean> {
    try {
      const adapter = this.createAdapter(type);
      const result = await adapter.connect(config);
      await adapter.disconnect();
      return result;
    } catch {
      return false;
    }
  }
}

export const databaseManager = new DatabaseManager();
