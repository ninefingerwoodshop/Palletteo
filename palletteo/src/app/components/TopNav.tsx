"use client";
import Link from "next/link";

interface TopNavProps {
  activeView?: "editor" | "viewer";
  setActiveView?: (view: "editor" | "viewer") => void;
}

export default function TopNav({
  activeView = "editor",
  setActiveView,
}: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav__left">
        <h1 className="top-nav__title">Palletteo</h1>
        <p className="top-nav__subtitle">Style Guide & Color Palette Manager</p>
      </div>

      <div className="top-nav__center">
        {setActiveView && (
          <div className="view-switcher">
            <button
              className={`view-btn ${activeView === "editor" ? "active" : ""}`}
              onClick={() => setActiveView("editor")}
            >
              🎨 Editor
            </button>
            <button
              className={`view-btn ${activeView === "viewer" ? "active" : ""}`}
              onClick={() => setActiveView("viewer")}
            >
              👁️ Style Guide
            </button>
          </div>
        )}
      </div>

      <div className="top-nav__actions">
        <button className="top-nav__button">Export</button>
        <button className="top-nav__button secondary">Share</button>
        <Link href="/admin">
          <button className="top-nav__button secondary">⚙️ Admin</button>
        </Link>
      </div>
    </header>
  );
}
