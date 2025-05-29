"use client";
import { useState } from "react";
import { SavedConnection, connectionStorage } from "../lib/connection-storage";
import { firebaseManager, FirebaseConfig } from "../lib/firebase-manager";

interface ConnectionEditorProps {
  connection: SavedConnection;
  onSave: () => void;
  onCancel: () => void;
}

export default function ConnectionEditor({
  connection,
  onSave,
  onCancel,
}: ConnectionEditorProps) {
  const [name, setName] = useState(connection.name);
  const [config, setConfig] = useState<FirebaseConfig>(connection.config);
  const [errors, setErrors] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const isEditing = !!connection.id;

  const handleConfigChange = (field: keyof FirebaseConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
    setTestResult(null);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const validation = firebaseManager.validateConfig(config);
      if (!validation.valid) {
        setTestResult({
          success: false,
          message: validation.errors.join(", "),
        });
        return;
      }

      // Try to initialize Firebase with this config
      const testId = `test-${Date.now()}`;
      await firebaseManager.connectToFirebase(testId, config);
      await firebaseManager.disconnectFromFirebase(testId);

      setTestResult({ success: true, message: "Connection successful!" });
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const validation = firebaseManager.validateConfig(config);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    if (!name.trim()) {
      setErrors(["Connection name is required"]);
      return;
    }

    if (isEditing) {
      connectionStorage.updateConnection(connection.id, {
        name: name.trim(),
        config,
      });
    } else {
      connectionStorage.saveConnection({
        name: name.trim(),
        config,
      });
    }

    onSave();
  };

  return (
    <div className="connection-editor-overlay">
      <div className="connection-editor">
        <div className="connection-editor__header">
          <h3>{isEditing ? "Edit Connection" : "Add New Connection"}</h3>
          <button onClick={onCancel} className="close-button">
            ×
          </button>
        </div>

        <div className="connection-editor__body">
          <div className="form-group">
            <label>Connection Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Firebase Project"
            />
          </div>

          <div className="config-section">
            <h4>Firebase Configuration</h4>

            <div className="form-row">
              <div className="form-group">
                <label>API Key</label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                  placeholder="AIzaSyD..."
                />
              </div>
              <div className="form-group">
                <label>Project ID</label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={(e) =>
                    handleConfigChange("projectId", e.target.value)
                  }
                  placeholder="your-project"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Auth Domain</label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) =>
                  handleConfigChange("authDomain", e.target.value)
                }
                placeholder="your-project.firebaseapp.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Storage Bucket</label>
                <input
                  type="text"
                  value={config.storageBucket}
                  onChange={(e) =>
                    handleConfigChange("storageBucket", e.target.value)
                  }
                  placeholder="your-project.appspot.com"
                />
              </div>
              <div className="form-group">
                <label>Messaging Sender ID</label>
                <input
                  type="text"
                  value={config.messagingSenderId}
                  onChange={(e) =>
                    handleConfigChange("messagingSenderId", e.target.value)
                  }
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="form-group">
              <label>App ID</label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => handleConfigChange("appId", e.target.value)}
                placeholder="1:123456789:web:abcdef123456"
              />
            </div>

            <div className="form-group">
              <label>Measurement ID (Optional)</label>
              <input
                type="text"
                value={config.measurementId || ""}
                onChange={(e) =>
                  handleConfigChange("measurementId", e.target.value)
                }
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="validation-errors">
              {errors.map((error, index) => (
                <div key={index} className="error">
                  {error}
                </div>
              ))}
            </div>
          )}

          {testResult && (
            <div
              className={`test-result ${
                testResult.success ? "success" : "error"
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>

        <div className="connection-editor__footer">
          <button
            onClick={testConnection}
            disabled={testing}
            className="btn-outline"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <div className="footer-actions">
            <button onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              {isEditing ? "Update" : "Save"} Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
