"use client";
import { useState } from "react";

export default function RightNav() {
  const [selectedColor, setSelectedColor] = useState("#4f46e5");

  return (
    <aside className="right-nav">
      <div className="right-nav__header">
        <h2>Tools</h2>
      </div>

      <div className="tool-section">
        <h3>Color Picker</h3>
        <div className="color-picker-section">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="color-input"
          />
          <div className="color-info">
            <div
              className="color-display"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="color-values">
              <span className="color-hex">{selectedColor.toUpperCase()}</span>
              <small className="color-label">HEX</small>
            </div>
          </div>
        </div>
      </div>

      <div className="tool-section">
        <h3>Quick Actions</h3>
        <div className="quick-tools">
          <button className="tool-button">Generate Palette</button>
          <button className="tool-button">Extract from Image</button>
          <button className="tool-button">Color Harmony</button>
        </div>
      </div>

      <div className="tool-section">
        <h3>Export</h3>
        <div className="export-options">
          <button className="export-button">Export as CSS</button>
          <button className="export-button">Export as JSON</button>
          <button className="export-button">Export as PNG</button>
        </div>
      </div>
    </aside>
  );
}
