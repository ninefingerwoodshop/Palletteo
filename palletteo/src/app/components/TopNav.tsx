// src/app/components/TopNav.tsx (Updated for main app)
"use client";
import Link from "next/link";

interface TopNavProps {
  activeView: "editor" | "viewer" | "entries";
  setActiveView: (view: "editor" | "viewer" | "entries") => void;
}

export default function TopNav({ activeView, setActiveView }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav__left">
        <h1 className="top-nav__title">Palletteo</h1>
        <nav className="top-nav__tabs">
          <button
            className={`nav-tab ${activeView === "editor" ? "active" : ""}`}
            onClick={() => setActiveView("editor")}
          >
            Editor
          </button>
          <button
            className={`nav-tab ${activeView === "entries" ? "active" : ""}`}
            onClick={() => setActiveView("entries")}
          >
            Entries
          </button>
          <button
            className={`nav-tab ${activeView === "viewer" ? "active" : ""}`}
            onClick={() => setActiveView("viewer")}
          >
            Style Guide
          </button>
        </nav>
      </div>

      <div className="top-nav__actions">
        <button className="top-nav__button">Export</button>
        <button className="top-nav__button secondary">Save</button>
        <Link href="/admin">
          <button className="top-nav__button secondary">Admin</button>
        </Link>
      </div>
    </header>
  );
}
