export type DatabaseType =
  | "firebase"
  | "supabase"
  | "mongodb"
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "airtable"
  | "notion";

export interface DatabaseConfig {
  type: DatabaseType;
  name: string;
  config: any; // Specific to each database type
  isActive: boolean;
  createdAt: number;
  lastUsed: number;
}

export interface DatabaseConnection {
  id: string;
  type: DatabaseType;
  name: string;
  isConnected: boolean;
  client: any; // Database-specific client
  config: any;
}

// Generic database operations interface
export interface DatabaseAdapter {
  connect(config: any): Promise<boolean>;
  disconnect(): Promise<void>;

  // Palette operations
  createPalette(palette: Palette): Promise<string>;
  getPalette(id: string): Promise<Palette | null>;
  getAllPalettes(): Promise<Palette[]>;
  updatePalette(id: string, updates: Partial<Palette>): Promise<boolean>;
  deletePalette(id: string): Promise<boolean>;

  // Collection operations
  createCollection(collection: Collection): Promise<string>;
  getCollection(id: string): Promise<Collection | null>;
  getAllCollections(): Promise<Collection[]>;
  updateCollection(id: string, updates: Partial<Collection>): Promise<boolean>;
  deleteCollection(id: string): Promise<boolean>;

  // User operations (if needed)
  createUser?(user: User): Promise<string>;
  getUser?(id: string): Promise<User | null>;
  updateUser?(id: string, updates: Partial<User>): Promise<boolean>;
}

// Data models
export interface Palette {
  id: string;
  name: string;
  description?: string;
  colors: Color[];
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  isPublic: boolean;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  rgb?: string;
  hsl?: string;
  description?: string;
  tags?: string[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  paletteIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  isPublic: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLoginAt?: Date;
}
