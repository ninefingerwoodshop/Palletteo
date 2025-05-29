// src/app/components/AdminDashboard.tsx
"use client";
import { useState, useEffect } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth"; // Changed from useUnifiedAdminAuth
import { connectionStorage, SavedConnection } from "../lib/connection-storage";
import { useFirebaseConnection } from "../hooks/useFirebaseConnection";
import ConnectionEditor from "./ConnectionEditor";
import AdminUserInfo from "./AdminUserInfo";
import UserManagement from "./UserManagement"; // Add this import

type AdminView = "dashboard" | "connections" | "users" | "settings";

export default function AdminDashboard() {
  const { user, extendSession } = useAdminAuth(); // Changed hook
  const { currentConnection, getAllConnections } = useFirebaseConnection();
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>(
    []
  );
  const [editingConnection, setEditingConnection] =
    useState<SavedConnection | null>(null);

  useEffect(() => {
    loadConnections();

    const handleActivity = () => extendSession();
    const events = ["click", "keypress", "scroll", "mousemove"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [extendSession]);

  const loadConnections = () => {
    setSavedConnections(connectionStorage.getAllConnections());
  };

  const handleDeleteConnection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this connection?")) return;

    if (connectionStorage.deleteConnection(id)) {
      loadConnections();
      showNotification("Connection deleted successfully", "success");
    }
  };

  const handleSetActive = (id: string) => {
    if (connectionStorage.setActiveConnection(id)) {
      loadConnections();
      showNotification("Active connection updated", "success");
    }
  };

  const handleEditConnection = (connection: SavedConnection) => {
    setEditingConnection(connection);
    setActiveView("connections");
  };

  const handleConnectionSaved = () => {
    setEditingConnection(null);
    loadConnections();
  };

  const showNotification = (message: string, type: "success" | "error") => {
    // Simple console logging for now - you can enhance this later
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const renderDashboard = () => (
    <div className="admin-content">
      <div className="dashboard-header">
        <h2>Welcome back, {user?.name}!</h2>
        <p>Palletteo Admin Dashboard</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{savedConnections.length}</div>
          <div className="stat-label">Saved Connections</div>
          <div className="stat-trend">
            {
              savedConnections.filter(
                (c) => c.lastUsed > Date.now() - 7 * 24 * 60 * 60 * 1000
              ).length
            }{" "}
            active this week
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{currentConnection ? "1" : "0"}</div>
          <div className="stat-label">Active Connection</div>
          <div className="stat-trend">
            {currentConnection ? currentConnection.config.projectId : "None"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{getAllConnections().length}</div>
          <div className="stat-label">Live Connections</div>
          <div className="stat-trend">Currently connected</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">
            {Math.round((Date.now() - (user?.loginTime || 0)) / (1000 * 60))}m
          </div>
          <div className="stat-label">Session Duration</div>
          <div className="stat-trend">
            Expires:{" "}
            {user ? new Date(user.expiresAt).toLocaleTimeString() : "N/A"}
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-activity">
          <h3>Recent Connections</h3>
          <div className="connection-list">
            {savedConnections
              .sort((a, b) => b.lastUsed - a.lastUsed)
              .slice(0, 5)
              .map((connection) => (
                <div key={connection.id} className="connection-item">
                  <div className="connection-info">
                    <strong>{connection.name}</strong>
                    <small>{connection.config.projectId}</small>
                    <div className="connection-meta">
                      <span className="last-used">
                        Last used:{" "}
                        {new Date(connection.lastUsed).toLocaleDateString()}
                      </span>
                      {connection.isActive && (
                        <span className="active-badge">Active</span>
                      )}
                    </div>
                  </div>
                  <div className="connection-actions">
                    <button
                      onClick={() => handleSetActive(connection.id)}
                      disabled={connection.isActive}
                      className="btn-secondary"
                    >
                      {connection.isActive ? "Active" : "Set Active"}
                    </button>
                    <button
                      onClick={() => handleEditConnection(connection)}
                      className="btn-outline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}

            {savedConnections.length === 0 && (
              <div className="empty-state">
                <p>No connections found</p>
                <button
                  onClick={() => setActiveView("connections")}
                  className="btn-primary"
                >
                  Add Your First Connection
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="system-health">
          <h3>System Health</h3>
          <div className="health-indicators">
            <div className="health-item">
              <span className="health-dot success"></span>
              <span>Firebase Connection</span>
              <span className="health-status">Active</span>
            </div>
            <div className="health-item">
              <span className="health-dot success"></span>
              <span>Authentication</span>
              <span className="health-status">Healthy</span>
            </div>
            <div className="health-item">
              <span className="health-dot warning"></span>
              <span>Storage Usage</span>
              <span className="health-status">Monitoring</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConnections = () => (
    <div className="admin-content">
      <div className="admin-content__header">
        <h2>Firebase Connections</h2>
        <button
          onClick={() =>
            setEditingConnection({
              id: "",
              name: "",
              config: {
                apiKey: "",
                authDomain: "",
                projectId: "",
                storageBucket: "",
                messagingSenderId: "",
                appId: "",
              },
              createdAt: 0,
              lastUsed: 0,
              isActive: false,
            } as SavedConnection)
          }
          className="btn-primary"
        >
          Add New Connection
        </button>
      </div>

      <div className="connections-grid">
        {savedConnections.map((connection) => (
          <div key={connection.id} className="connection-card">
            <div className="connection-card__header">
              <h3>{connection.name}</h3>
              {connection.isActive && (
                <span className="active-badge">Active</span>
              )}
            </div>

            <div className="connection-card__details">
              <div className="detail-row">
                <span className="label">Project ID:</span>
                <span className="value">{connection.config.projectId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Auth Domain:</span>
                <span className="value">{connection.config.authDomain}</span>
              </div>
              <div className="detail-row">
                <span className="label">Last Used:</span>
                <span className="value">
                  {new Date(connection.lastUsed).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="connection-card__actions">
              <button
                onClick={() => handleSetActive(connection.id)}
                disabled={connection.isActive}
                className="btn-secondary"
              >
                {connection.isActive ? "Active" : "Set Active"}
              </button>
              <button
                onClick={() => handleEditConnection(connection)}
                className="btn-outline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteConnection(connection.id)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingConnection && (
        <ConnectionEditor
          connection={editingConnection}
          onSave={handleConnectionSaved}
          onCancel={() => setEditingConnection(null)}
        />
      )}
    </div>
  );

  const renderUsers = () => <UserManagement />;

  const renderSettings = () => (
    <div className="admin-content">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Admin Account</h3>
        <div className="admin-account-info">
          <div className="account-detail">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div className="account-detail">
            <label>Name:</label>
            <span>{user?.name}</span>
          </div>
          <div className="account-detail">
            <label>Role:</label>
            <span>
              {user?.role === "super_admin" ? "Super Admin" : "Admin"}
            </span>
          </div>
          <div className="account-detail">
            <label>Login Time:</label>
            <span>
              {user ? new Date(user.loginTime).toLocaleString() : "N/A"}
            </span>
          </div>
          <div className="account-detail">
            <label>Session Expires:</label>
            <span>
              {user ? new Date(user.expiresAt).toLocaleString() : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Application Settings</h3>
        <div className="setting-item">
          <label>Auto-save connections</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="setting-item">
          <label>Session timeout (hours)</label>
          <input type="number" defaultValue={8} min={1} max={24} />
        </div>
      </div>

      <div className="settings-section">
        <h3>Data Management</h3>
        <div className="setting-actions">
          <button className="btn-outline">Export Connections</button>
          <button className="btn-outline">Import Connections</button>
          <button
            className="btn-danger"
            onClick={() => {
              if (
                confirm("This will clear all saved connections. Are you sure?")
              ) {
                localStorage.removeItem("palletteo_saved_connections");
                loadConnections();
                showNotification("All connections cleared", "success");
              }
            }}
          >
            Clear All Data
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>System Information</h3>
        <div className="system-info">
          <div className="info-item">
            <label>Current Connection:</label>
            <span>{currentConnection?.config.projectId || "None"}</span>
          </div>
          <div className="info-item">
            <label>Total Connections:</label>
            <span>{savedConnections.length}</span>
          </div>
          <div className="info-item">
            <label>Active Sessions:</label>
            <span>{getAllConnections().length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header__left">
          <h1>Palletteo Admin</h1>
          <nav className="admin-nav">
            {[
              { key: "dashboard", label: "Dashboard" },
              { key: "connections", label: "Connections" },
              { key: "users", label: "Users" },
              { key: "settings", label: "Settings" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={activeView === key ? "active" : ""}
                onClick={() => setActiveView(key as AdminView)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="admin-header__right">
          <AdminUserInfo />
        </div>
      </header>

      <main className="admin-main">
        {activeView === "dashboard" && renderDashboard()}
        {activeView === "connections" && renderConnections()}
        {activeView === "users" && renderUsers()}
        {activeView === "settings" && renderSettings()}
      </main>
    </div>
  );
}
