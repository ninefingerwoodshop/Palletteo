"use client";
import { useState } from "react";

export default function LeftNav() {
  const [activeSection, setActiveSection] = useState("recent");

  // Mock data - replace with your state management later
  const recentPalettes = [
    { id: 1, name: "Ocean Blues", colors: ["#003f5c", "#2f4b7c", "#665191"] },
    { id: 2, name: "Sunset Warm", colors: ["#ff6b6b", "#ffa500", "#ffff00"] },
    { id: 3, name: "Forest Green", colors: ["#2d5a27", "#6b8e23", "#9acd32"] },
  ];

  const collections = [
    { id: 1, name: "Web Design", count: 12 },
    { id: 2, name: "Brand Colors", count: 8 },
    { id: 3, name: "Nature Inspired", count: 15 },
  ];

  return (
    <nav className="left-nav">
      <div className="left-nav__header">
        <h2>Library</h2>
      </div>

      <div className="nav-sections">
        <button
          className={`nav-section ${
            activeSection === "recent" ? "active" : ""
          }`}
          onClick={() => setActiveSection("recent")}
        >
          Recent Palettes
        </button>
        <button
          className={`nav-section ${
            activeSection === "collections" ? "active" : ""
          }`}
          onClick={() => setActiveSection("collections")}
        >
          Collections
        </button>
        <button
          className={`nav-section ${
            activeSection === "favorites" ? "active" : ""
          }`}
          onClick={() => setActiveSection("favorites")}
        >
          Favorites
        </button>
      </div>

      <div className="nav-content">
        {activeSection === "recent" && (
          <div className="palette-list">
            {recentPalettes.map((palette) => (
              <div key={palette.id} className="palette-item">
                <div className="palette-colors">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="palette-name">{palette.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeSection === "collections" && (
          <div className="collection-list">
            {collections.map((collection) => (
              <div key={collection.id} className="collection-item">
                <span className="collection-name">{collection.name}</span>
                <span className="collection-count">{collection.count}</span>
              </div>
            ))}
          </div>
        )}

        {activeSection === "favorites" && (
          <div className="empty-state">
            <p>No favorites yet</p>
            <small>Star palettes to see them here</small>
          </div>
        )}
      </div>
    </nav>
  );
}
