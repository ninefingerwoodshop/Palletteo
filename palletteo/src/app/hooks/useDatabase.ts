import { useState, useEffect } from "react";
import { databaseManager } from "../lib/database/database-manager";
import { Palette, Collection } from "../lib/database/types";

export const useDatabase = () => {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adapter = databaseManager.getCurrentAdapter();

  // Load all palettes
  const loadPalettes = async () => {
    if (!adapter) return;

    setLoading(true);
    setError(null);

    try {
      const data = await adapter.getAllPalettes();
      setPalettes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load all collections
  const loadCollections = async () => {
    if (!adapter) return;

    setLoading(true);
    setError(null);

    try {
      const data = await adapter.getAllCollections();
      setCollections(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create palette
  const createPalette = async (
    palette: Omit<Palette, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!adapter) throw new Error("No database connection");

    const fullPalette: Palette = {
      ...palette,
      id: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await adapter.createPalette(fullPalette);
    await loadPalettes(); // Refresh list
    return id;
  };

  // Update palette
  const updatePalette = async (id: string, updates: Partial<Palette>) => {
    if (!adapter) throw new Error("No database connection");

    const success = await adapter.updatePalette(id, updates);
    if (success) {
      await loadPalettes(); // Refresh list
    }
    return success;
  };

  // Delete palette
  const deletePalette = async (id: string) => {
    if (!adapter) throw new Error("No database connection");

    const success = await adapter.deletePalette(id);
    if (success) {
      await loadPalettes(); // Refresh list
    }
    return success;
  };

  // Create collection
  const createCollection = async (
    collection: Omit<Collection, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!adapter) throw new Error("No database connection");

    const fullCollection: Collection = {
      ...collection,
      id: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const id = await adapter.createCollection(fullCollection);
    await loadCollections(); // Refresh list
    return id;
  };

  // Load data on mount
  useEffect(() => {
    if (adapter) {
      loadPalettes();
      loadCollections();
    }
  }, [adapter]);

  return {
    // Data
    palettes,
    collections,
    loading,
    error,

    // Actions
    loadPalettes,
    loadCollections,
    createPalette,
    updatePalette,
    deletePalette,
    createCollection,

    // Status
    isConnected: !!adapter,
  };
};
