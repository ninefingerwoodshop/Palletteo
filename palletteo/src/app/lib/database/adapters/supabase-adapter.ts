import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DatabaseAdapter, Palette, Collection } from "../types";

export class SupabaseAdapter implements DatabaseAdapter {
  private client: SupabaseClient | null = null;

  async connect(config: { url: string; anonKey: string }): Promise<boolean> {
    try {
      this.client = createClient(config.url, config.anonKey);

      // Test connection
      const { error } = await this.client
        .from("palettes")
        .select("count")
        .limit(1);
      if (
        error &&
        !error.message.includes('relation "palettes" does not exist')
      ) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Supabase connection failed:", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
  }

  async createPalette(palette: Palette): Promise<string> {
    if (!this.client) throw new Error("Not connected to database");

    const { data, error } = await this.client
      .from("palettes")
      .insert([
        {
          ...palette,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getPalette(id: string): Promise<Palette | null> {
    if (!this.client) throw new Error("Not connected to database");

    const { data, error } = await this.client
      .from("palettes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data as Palette;
  }

  async getAllPalettes(): Promise<Palette[]> {
    if (!this.client) throw new Error("Not connected to database");

    const { data, error } = await this.client
      .from("palettes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Palette[];
  }

  async updatePalette(id: string, updates: Partial<Palette>): Promise<boolean> {
    if (!this.client) throw new Error("Not connected to database");

    const { error } = await this.client
      .from("palettes")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return !error;
  }

  async deletePalette(id: string): Promise<boolean> {
    if (!this.client) throw new Error("Not connected to database");

    const { error } = await this.client.from("palettes").delete().eq("id", id);

    return !error;
  }

  // Similar implementations for collections...
  async createCollection(collection: Collection): Promise<string> {
    if (!this.client) throw new Error("Not connected to database");

    const { data, error } = await this.client
      .from("collections")
      .insert([
        {
          ...collection,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async getCollection(id: string): Promise<Collection | null> {
    if (!this.client) throw new Error("Not connected to database");

    const { data, error } = await this.client
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data as Collection;
  }

  async getAllCollections(): Promise<Collection[]> {
    if (!this.client) throw new Error("Not connected to database");

    const { data, error } = await this.client
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Collection[];
  }

  async updateCollection(
    id: string,
    updates: Partial<Collection>
  ): Promise<boolean> {
    if (!this.client) throw new Error("Not connected to database");

    const { error } = await this.client
      .from("collections")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return !error;
  }

  async deleteCollection(id: string): Promise<boolean> {
    if (!this.client) throw new Error("Not connected to database");

    const { error } = await this.client
      .from("collections")
      .delete()
      .eq("id", id);

    return !error;
  }
}
