// src/app/components/DatabaseConnectionForm.tsx
"use client";
import { useState } from "react";
import { databaseManager } from "../lib/database/database-manager";
import { DatabaseType, DatabaseConfig } from "../lib/database/types";

interface DatabaseConnectionFormProps {
  onConnected: () => void;
}

export default function DatabaseConnectionForm({
  onConnected,
}: DatabaseConnectionFormProps) {
  const [selectedType, setSelectedType] = useState<DatabaseType>("firebase");
  const [connectionName, setConnectionName] = useState("");
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const databaseTypes = [
    { type: "firebase" as DatabaseType, name: "Firebase", icon: "🔥" },
    { type: "supabase" as DatabaseType, name: "Supabase", icon: "⚡" },
    { type: "mongodb" as DatabaseType, name: "MongoDB", icon: "🍃" },
    { type: "postgresql" as DatabaseType, name: "PostgreSQL", icon: "🐘" },
    { type: "mysql" as DatabaseType, name: "MySQL", icon: "🐬" },
    { type: "sqlite" as DatabaseType, name: "SQLite", icon: "🗃️" },
    { type: "airtable" as DatabaseType, name: "Airtable", icon: "📊" },
    { type: "notion" as DatabaseType, name: "Notion", icon: "📝" },
  ];

  const handleTypeChange = (type: DatabaseType) => {
    setSelectedType(type);
    setConfig({});
    setError(null);
  };

  const testConnection = async () => {
    if (!connectionName.trim()) {
      setError("Connection name is required");
      return;
    }

    setTesting(true);
    setError(null);

    try {
      const success = await databaseManager.testConnection(
        selectedType,
        config
      );
      if (success) {
        alert("Connection test successful!");
      } else {
        setError("Connection test failed. Please check your configuration.");
      }
    } catch (err: any) {
      setError(`Connection test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!connectionName.trim()) {
      setError("Connection name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dbConfig: DatabaseConfig = {
        type: selectedType,
        name: connectionName,
        config,
        isActive: true,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };

      await databaseManager.connectToDatabase(dbConfig);
      onConnected();
    } catch (err: any) {
      setError(`Connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderConfigForm = () => {
    switch (selectedType) {
      case "firebase":
        return (
          <div className="config-form">
            <h3>Firebase Configuration</h3>
            <div className="form-row">
              <div className="form-group">
                <label>API Key</label>
                <input
                  type="text"
                  value={config.apiKey || ""}
                  onChange={(e) =>
                    setConfig({ ...config, apiKey: e.target.value })
                  }
                  placeholder="AIzaSy..."
                />
              </div>
              <div className="form-group">
                <label>Project ID</label>
                <input
                  type="text"
                  value={config.projectId || ""}
                  onChange={(e) =>
                    setConfig({ ...config, projectId: e.target.value })
                  }
                  placeholder="your-project"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Auth Domain</label>
              <input
                type="text"
                value={config.authDomain || ""}
                onChange={(e) =>
                  setConfig({ ...config, authDomain: e.target.value })
                }
                placeholder="your-project.firebaseapp.com"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Storage Bucket</label>
                <input
                  type="text"
                  value={config.storageBucket || ""}
                  onChange={(e) =>
                    setConfig({ ...config, storageBucket: e.target.value })
                  }
                  placeholder="your-project.firebasestorage.app"
                />
              </div>
              <div className="form-group">
                <label>Messaging Sender ID</label>
                <input
                  type="text"
                  value={config.messagingSenderId || ""}
                  onChange={(e) =>
                    setConfig({ ...config, messagingSenderId: e.target.value })
                  }
                  placeholder="123456789"
                />
              </div>
            </div>
            <div className="form-group">
              <label>App ID</label>
              <input
                type="text"
                value={config.appId || ""}
                onChange={(e) =>
                  setConfig({ ...config, appId: e.target.value })
                }
                placeholder="1:123456789:web:abcdef"
              />
            </div>
          </div>
        );

      case "supabase":
        return (
          <div className="config-form">
            <h3>Supabase Configuration</h3>
            <div className="form-group">
              <label>Project URL</label>
              <input
                type="url"
                value={config.url || ""}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div className="form-group">
              <label>Anon Key</label>
              <input
                type="text"
                value={config.anonKey || ""}
                onChange={(e) =>
                  setConfig({ ...config, anonKey: e.target.value })
                }
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
            </div>
          </div>
        );

      case "mongodb":
        return (
          <div className="config-form">
            <h3>MongoDB Configuration</h3>
            <div className="form-group">
              <label>Connection String</label>
              <input
                type="text"
                value={config.connectionString || ""}
                onChange={(e) =>
                  setConfig({ ...config, connectionString: e.target.value })
                }
                placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
              />
            </div>
            <div className="form-group">
              <label>Database Name</label>
              <input
                type="text"
                value={config.database || ""}
                onChange={(e) =>
                  setConfig({ ...config, database: e.target.value })
                }
                placeholder="palletteo"
              />
            </div>
          </div>
        );

      case "postgresql":
        return (
          <div className="config-form">
            <h3>PostgreSQL Configuration</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Host</label>
                <input
                  type="text"
                  value={config.host || ""}
                  onChange={(e) =>
                    setConfig({ ...config, host: e.target.value })
                  }
                  placeholder="localhost"
                />
              </div>
              <div className="form-group">
                <label>Port</label>
                <input
                  type="number"
                  value={config.port || 5432}
                  onChange={(e) =>
                    setConfig({ ...config, port: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Database</label>
                <input
                  type="text"
                  value={config.database || ""}
                  onChange={(e) =>
                    setConfig({ ...config, database: e.target.value })
                  }
                  placeholder="palletteo"
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={config.username || ""}
                  onChange={(e) =>
                    setConfig({ ...config, username: e.target.value })
                  }
                  placeholder="postgres"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={config.password || ""}
                onChange={(e) =>
                  setConfig({ ...config, password: e.target.value })
                }
              />
            </div>
          </div>
        );

      case "airtable":
        return (
          <div className="config-form">
            <h3>Airtable Configuration</h3>
            <div className="form-group">
              <label>API Key</label>
              <input
                type="text"
                value={config.apiKey || ""}
                onChange={(e) =>
                  setConfig({ ...config, apiKey: e.target.value })
                }
                placeholder="keyXXXXXXXXXXXXXX"
              />
            </div>
            <div className="form-group">
              <label>Base ID</label>
              <input
                type="text"
                value={config.baseId || ""}
                onChange={(e) =>
                  setConfig({ ...config, baseId: e.target.value })
                }
                placeholder="appXXXXXXXXXXXXXX"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="config-form">
            <div className="coming-soon">
              <h3>
                {databaseTypes.find((db) => db.type === selectedType)?.name}{" "}
                Support
              </h3>
              <p>
                🚧 Coming soon! This database type will be supported in a future
                update.
              </p>
              <p>For now, try Firebase or Supabase for the best experience.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="database-connection-form">
      <div className="form-header">
        <h1>Connect Your Database</h1>
        <p>Choose any database to store your color palettes and style guides</p>
      </div>

      <div className="database-type-selector">
        <h2>Select Database Type</h2>
        <div className="database-types">
          {databaseTypes.map(({ type, name, icon }) => (
            <button
              key={type}
              className={`database-type ${
                selectedType === type ? "selected" : ""
              } ${
                !["firebase", "supabase"].includes(type) ? "coming-soon" : ""
              }`}
              onClick={() => handleTypeChange(type)}
            >
              <span className="database-icon">{icon}</span>
              <span className="database-name">{name}</span>
              {!["firebase", "supabase"].includes(type) && (
                <span className="coming-soon-badge">Soon</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="connection-details">
        <div className="form-group">
          <label>Connection Name</label>
          <input
            type="text"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="My Database Connection"
          />
        </div>

        {renderConfigForm()}

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            onClick={testConnection}
            disabled={testing || loading}
            className="btn-secondary"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <button
            onClick={handleConnect}
            disabled={loading || testing}
            className="btn-primary"
          >
            {loading ? "Connecting..." : "Connect Database"}
          </button>
        </div>
      </div>

      <div className="database-info">
        <h3>Why Connect a Database?</h3>
        <ul>
          <li>Store unlimited color palettes</li>
          <li>Organize palettes into collections</li>
          <li>Share with your team</li>
          <li>Export design tokens</li>
          <li>Keep your data secure</li>
          <li>Sync across devices</li>
        </ul>
      </div>
    </div>
  );
}
