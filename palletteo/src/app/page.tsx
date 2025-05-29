"use client";
import { useState, useEffect } from "react";
import TopNav from "./components/TopNav";
import LeftNav from "./components/LeftNav";
import RightNav from "./components/RightNav";
import PaletteEditor from "./components/PaletteEditor";
import StyleGuideViewer from "./components/StyleGuideViewer";
import DatabaseConnectionForm from "./components/DatabaseConnectionForm";
import { databaseManager } from "./lib/database/database-manager";
import { DatabaseConnection } from "./lib/database/types";

export default function PalletteoApp() {
  const [activeView, setActiveView] = useState<"editor" | "viewer">("editor");
  const [currentConnection, setCurrentConnection] =
    useState<DatabaseConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database connection
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("🔍 Checking for existing database connections...");

        // Check for existing connection
        const existingConnection = databaseManager.getCurrentConnection();
        if (existingConnection) {
          console.log("✅ Found existing connection:", existingConnection.name);
          setCurrentConnection(existingConnection);
          setLoading(false);
          return;
        }

        // Check for saved connection config
        const activeConfig = databaseManager.getActiveConnectionConfig();
        if (activeConfig) {
          console.log("🔗 Connecting to saved database:", activeConfig.name);

          await databaseManager.connectToDatabase(activeConfig);
          const connection = databaseManager.getCurrentConnection();
          setCurrentConnection(connection);
        } else {
          console.log("⚠️ No saved database connections found");
        }
      } catch (err: any) {
        console.error("❌ Database initialization failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  const handleDatabaseConnected = () => {
    const connection = databaseManager.getCurrentConnection();
    setCurrentConnection(connection);
    setError(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Palletteo...</p>
        <small>Checking database connections</small>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="app-error">
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show database connection form if no connection
  if (!currentConnection) {
    return <DatabaseConnectionForm onConnected={handleDatabaseConnected} />;
  }

  // Show main application
  return (
    <div className="palletteo-app">
      <TopNav activeView={activeView} setActiveView={setActiveView} />

      <div className="app-layout">
        <LeftNav />

        <main className="main-content">
          <div className="connection-indicator">
            <span className="connection-status">
              📊 Connected to {currentConnection.name} ({currentConnection.type}
              )
            </span>
          </div>

          {activeView === "editor" ? <PaletteEditor /> : <StyleGuideViewer />}
        </main>

        <RightNav />
      </div>
    </div>
  );
}
