"use client";
import { useState, useEffect } from "react";

interface Color {
  id: string;
  hex: string;
  name: string;
  description?: string;
}

interface Palette {
  id: string;
  name: string;
  colors: Color[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function PaletteEditor() {
  const [currentPalette, setCurrentPalette] = useState<Palette>({
    id: Date.now().toString(),
    name: "New Palette",
    colors: [
      { id: "1", hex: "#4F46E5", name: "Primary" },
      { id: "2", hex: "#06B6D4", name: "Secondary" },
      { id: "3", hex: "#10B981", name: "Success" },
      { id: "4", hex: "#F59E0B", name: "Warning" },
      { id: "5", hex: "#EF4444", name: "Error" },
    ],
    category: "Brand",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [selectedColor, setSelectedColor] = useState<Color | null>(null);

  const addColor = () => {
    const newColor: Color = {
      id: Date.now().toString(),
      hex: "#000000",
      name: `Color ${currentPalette.colors.length + 1}`,
    };

    setCurrentPalette((prev) => ({
      ...prev,
      colors: [...prev.colors, newColor],
      updatedAt: new Date(),
    }));
  };

  const updateColor = (colorId: string, updates: Partial<Color>) => {
    setCurrentPalette((prev) => ({
      ...prev,
      colors: prev.colors.map((color) =>
        color.id === colorId ? { ...color, ...updates } : color
      ),
      updatedAt: new Date(),
    }));
  };

  const removeColor = (colorId: string) => {
    setCurrentPalette((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color.id !== colorId),
      updatedAt: new Date(),
    }));
  };

  return (
    <div className="palette-editor">
      <div className="editor-header">
        <input
          type="text"
          value={currentPalette.name}
          onChange={(e) =>
            setCurrentPalette((prev) => ({
              ...prev,
              name: e.target.value,
              updatedAt: new Date(),
            }))
          }
          className="palette-name-input"
        />

        <div className="editor-actions">
          <button onClick={addColor} className="btn-primary">
            Add Color
          </button>
          <button className="btn-secondary">Save Palette</button>
          <button className="btn-outline">Export</button>
        </div>
      </div>

      <div className="color-grid">
        {currentPalette.colors.map((color) => (
          <div
            key={color.id}
            className={`color-card ${
              selectedColor?.id === color.id ? "selected" : ""
            }`}
            onClick={() => setSelectedColor(color)}
          >
            <div
              className="color-swatch"
              style={{ backgroundColor: color.hex }}
            />

            <div className="color-info">
              <input
                type="text"
                value={color.name}
                onChange={(e) =>
                  updateColor(color.id, { name: e.target.value })
                }
                className="color-name"
              />

              <div className="color-hex">
                <input
                  type="color"
                  value={color.hex}
                  onChange={(e) =>
                    updateColor(color.id, { hex: e.target.value })
                  }
                />
                <span>{color.hex.toUpperCase()}</span>
              </div>

              <button
                onClick={() => removeColor(color.id)}
                className="remove-color"
                title="Remove color"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedColor && (
        <div className="color-details">
          <h3>Color Details</h3>
          <div
            className="color-preview"
            style={{ backgroundColor: selectedColor.hex }}
          >
            <span className="color-contrast-text">Sample Text</span>
          </div>

          <div className="color-values">
            <div>HEX: {selectedColor.hex}</div>
            <div>RGB: {hexToRgb(selectedColor.hex)}</div>
            <div>HSL: {hexToHsl(selectedColor.hex)}</div>
          </div>

          <textarea
            placeholder="Color description or usage notes..."
            value={selectedColor.description || ""}
            onChange={(e) =>
              updateColor(selectedColor.id, { description: e.target.value })
            }
            className="color-description"
          />
        </div>
      )}
    </div>
  );
}

// Helper functions
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "";

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `${r}, ${g}, ${b}`;
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%`;
}
