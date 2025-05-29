import { useState, useEffect } from "react";
import { databaseManager } from "../lib/database/database-manager";

export interface Entry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export const useEntries = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adapter = databaseManager.getCurrentAdapter();

  // Load all entries
  const loadEntries = async () => {
    if (!adapter) return;

    setLoading(true);
    setError(null);

    try {
      // We'll use a generic collection for entries
      const data = await adapter.getAllCollections(); // We can repurpose this or create a new method
      // For now, let's create a simple in-memory storage solution
      const entriesData = localStorage.getItem("palletteo_entries");
      const parsedEntries = entriesData ? JSON.parse(entriesData) : [];
      setEntries(
        parsedEntries.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
        }))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create entry
  const createEntry = async (
    entryData: Omit<Entry, "id" | "createdAt" | "updatedAt">
  ) => {
    setLoading(true);
    setError(null);

    try {
      const newEntry: Entry = {
        ...entryData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // For now, save to localStorage (you can integrate with your database later)
      const existingEntries = JSON.parse(
        localStorage.getItem("palletteo_entries") || "[]"
      );
      const updatedEntries = [...existingEntries, newEntry];
      localStorage.setItem("palletteo_entries", JSON.stringify(updatedEntries));

      await loadEntries(); // Refresh list
      return newEntry.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update entry
  const updateEntry = async (id: string, updates: Partial<Entry>) => {
    setLoading(true);
    setError(null);

    try {
      const existingEntries = JSON.parse(
        localStorage.getItem("palletteo_entries") || "[]"
      );
      const updatedEntries = existingEntries.map((entry: Entry) =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      );
      localStorage.setItem("palletteo_entries", JSON.stringify(updatedEntries));

      await loadEntries(); // Refresh list
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete entry
  const deleteEntry = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const existingEntries = JSON.parse(
        localStorage.getItem("palletteo_entries") || "[]"
      );
      const filteredEntries = existingEntries.filter(
        (entry: Entry) => entry.id !== id
      );
      localStorage.setItem(
        "palletteo_entries",
        JSON.stringify(filteredEntries)
      );

      await loadEntries(); // Refresh list
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Search entries
  const searchEntries = (query: string, tags?: string[], category?: string) => {
    return entries.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.title.toLowerCase().includes(query.toLowerCase()) ||
        entry.content.toLowerCase().includes(query.toLowerCase());

      const matchesTags =
        !tags?.length ||
        tags.some((tag) => entry.tags.includes(tag.toLowerCase()));

      const matchesCategory = !category || entry.category === category;

      return matchesQuery && matchesTags && matchesCategory;
    });
  };

  // Get entry by ID
  const getEntry = (id: string): Entry | null => {
    return entries.find((entry) => entry.id === id) || null;
  };

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, [adapter]);

  return {
    entries,
    loading,
    error,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
    getEntry,
    isConnected: !!adapter,
  };
};
