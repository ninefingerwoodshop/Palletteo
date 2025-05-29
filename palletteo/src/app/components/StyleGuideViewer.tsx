"use client";
import { useState, useEffect } from "react";

export default function StyleGuideViewer() {
  const [palettes, setPalettes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="style-guide-viewer">
      <div className="viewer-header">
        <h1>Style Guide</h1>
        <p>Brand colors and design system</p>

        <div className="category-filters">
          {["All", "Brand", "UI", "Accent", "Neutral"].map((category) => (
            <button
              key={category}
              className={`filter-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="palette-showcase">
        <div className="palette-section">
          <h2>Primary Colors</h2>
          <div className="color-showcase">
            <div
              className="showcase-color"
              style={{ backgroundColor: "#4F46E5" }}
            >
              <div className="color-info-overlay">
                <span className="color-name">Primary</span>
                <span className="color-value">#4F46E5</span>
              </div>
            </div>
            <div
              className="showcase-color"
              style={{ backgroundColor: "#06B6D4" }}
            >
              <div className="color-info-overlay">
                <span className="color-name">Secondary</span>
                <span className="color-value">#06B6D4</span>
              </div>
            </div>
          </div>
        </div>

        <div className="palette-section">
          <h2>Status Colors</h2>
          <div className="color-showcase">
            <div
              className="showcase-color"
              style={{ backgroundColor: "#10B981" }}
            >
              <div className="color-info-overlay">
                <span className="color-name">Success</span>
                <span className="color-value">#10B981</span>
              </div>
            </div>
            <div
              className="showcase-color"
              style={{ backgroundColor: "#F59E0B" }}
            >
              <div className="color-info-overlay">
                <span className="color-name">Warning</span>
                <span className="color-value">#F59E0B</span>
              </div>
            </div>
            <div
              className="showcase-color"
              style={{ backgroundColor: "#EF4444" }}
            >
              <div className="color-info-overlay">
                <span className="color-name">Error</span>
                <span className="color-value">#EF4444</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="export-section">
        <h2>Export Design Tokens</h2>
        <div className="export-options">
          <button className="export-btn">📋 Copy CSS Variables</button>
          <button className="export-btn">📄 Download JSON</button>
          <button className="export-btn">🎨 Export Figma</button>
        </div>
      </div>
    </div>
  );
}
