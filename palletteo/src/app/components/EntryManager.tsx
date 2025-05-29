"use client";
import { useState, useEffect } from "react";
import { useEntries, Entry } from "../hooks/useEntries";
import EntryEditor from "./EntryEditor";

export default function EntryManager() {
  const {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
  } = useEntries();

  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredEntries = searchEntries(
    searchQuery,
    selectedTags,
    selectedCategory
  );

  // Get all unique categories and tags for filters
  const allCategories = [...new Set(entries.map((entry) => entry.category))];
  const allTags = [...new Set(entries.flatMap((entry) => entry.tags))];

  const handleCreateNew = () => {
    setEditingEntry(null);
    setShowEditor(true);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setShowEditor(true);
  };

  const handleSaveEntry = async (entryData: any) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, entryData);
      } else {
        await createEntry(entryData);
      }
      setShowEditor(false);
      setEditingEntry(null);
    } catch (err) {
      console.error("Failed to save entry:", err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry(id);
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setEditingEntry(null);
  };

  if (showEditor) {
    return (
      <EntryEditor
        entry={editingEntry || undefined}
        onSave={handleSaveEntry}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="entry-manager">
      <div className="entry-manager__header">
        <h1>Style Guide Entries</h1>
        <button onClick={handleCreateNew} className="btn-primary">
          Create New Entry
        </button>
      </div>

      {/* Search and Filters */}
      <div className="entry-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="tag-filters">
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`tag-filter ${
                  selectedTags.includes(tag) ? "active" : ""
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entry List */}
      <div className="entry-list">
        {loading ? (
          <div className="loading">Loading entries...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : filteredEntries.length === 0 ? (
          <div className="empty-state">
            <h3>No entries found</h3>
            <p>
              {entries.length === 0
                ? "Create your first style guide entry!"
                : "Try adjusting your search or filters."}
            </p>
            {entries.length === 0 && (
              <button onClick={handleCreateNew} className="btn-primary">
                Create First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="entries-grid">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="entry-card">
                <div className="entry-card__header">
                  <h3>{entry.title}</h3>
                  <div className="entry-actions">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="entry-meta">
                  <span className="category-badge">{entry.category}</span>
                  <span className="date">
                    {entry.updatedAt.toLocaleDateString()}
                  </span>
                </div>

                <div className="entry-preview">
                  {entry.content.substring(0, 150)}
                  {entry.content.length > 150 && "..."}
                </div>

                <div className="entry-tags">
                  {entry.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="tag-small">
                      {tag}
                    </span>
                  ))}
                  {entry.tags.length > 5 && (
                    <span className="tag-small more">
                      +{entry.tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
