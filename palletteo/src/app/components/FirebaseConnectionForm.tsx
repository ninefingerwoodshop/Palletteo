"use client";
import { useState } from "react";
import { useFirebaseConnection } from "../hooks/useFirebaseConnection";
import { firebaseManager, FirebaseConfig } from "../lib/firebase-manager";

export default function FirebaseConnectionForm() {
  const { connectToFirebase, loading, error } = useFirebaseConnection();
  const [showForm, setShowForm] = useState(false);
  const [connectionName, setConnectionName] = useState("");
  const [config, setConfig] = useState<Partial<FirebaseConfig>>({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof FirebaseConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]); // Clear validation errors when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate config
    const validation = firebaseManager.validateConfig(config);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (!connectionName.trim()) {
      setValidationErrors(["Connection name is required"]);
      return;
    }

    try {
      await connectToFirebase(connectionName, config as FirebaseConfig);
      setShowForm(false);
      setConnectionName("");
      setConfig({
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: "",
      });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const loadSampleConfig = () => {
    setConfig({
      apiKey: "AIzaSyD...",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef123456",
      measurementId: "G-XXXXXXXXXX",
    });
  };

  if (!showForm) {
    return (
      <div className="firebase-connection-prompt">
        <h2>Connect Your Firebase Database</h2>
        <p>To use Palletteo, connect your own Firebase project database.</p>
        <button onClick={() => setShowForm(true)} className="connect-button">
          Connect Firebase Database
        </button>
      </div>
    );
  }

  return (
    <div className="firebase-connection-form">
      <div className="form-header">
        <h2>Connect Your Firebase Database</h2>
        <button onClick={() => setShowForm(false)} className="close-button">
          ×
        </button>
      </div>

      <div className="instructions">
        <h3>How to get your Firebase config:</h3>
        <ol>
          <li>
            Go to{" "}
            <a href="https://console.firebase.google.com" target="_blank">
              Firebase Console
            </a>
          </li>
          <li>Select your project (or create a new one)</li>
          <li>Go to Project Settings (gear icon)</li>
          <li>Scroll down to "Your apps" and click on the web app</li>
          <li>Copy the config object</li>
        </ol>
        <button onClick={loadSampleConfig} className="sample-button">
          Load Sample Config
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Connection Name</label>
          <input
            type="text"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="My Firebase Project"
            required
          />
        </div>

        <div className="form-group">
          <label>API Key</label>
          <input
            type="text"
            value={config.apiKey}
            onChange={(e) => handleInputChange("apiKey", e.target.value)}
            placeholder="AIzaSyD..."
            required
          />
        </div>

        <div className="form-group">
          <label>Auth Domain</label>
          <input
            type="text"
            value={config.authDomain}
            onChange={(e) => handleInputChange("authDomain", e.target.value)}
            placeholder="your-project.firebaseapp.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Project ID</label>
          <input
            type="text"
            value={config.projectId}
            onChange={(e) => handleInputChange("projectId", e.target.value)}
            placeholder="your-project"
            required
          />
        </div>

        <div className="form-group">
          <label>Storage Bucket</label>
          <input
            type="text"
            value={config.storageBucket}
            onChange={(e) => handleInputChange("storageBucket", e.target.value)}
            placeholder="your-project.appspot.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Messaging Sender ID</label>
          <input
            type="text"
            value={config.messagingSenderId}
            onChange={(e) =>
              handleInputChange("messagingSenderId", e.target.value)
            }
            placeholder="123456789"
            required
          />
        </div>

        <div className="form-group">
          <label>App ID</label>
          <input
            type="text"
            value={config.appId}
            onChange={(e) => handleInputChange("appId", e.target.value)}
            placeholder="1:123456789:web:abcdef123456"
            required
          />
        </div>

        <div className="form-group">
          <label>Measurement ID (Optional)</label>
          <input
            type="text"
            value={config.measurementId}
            onChange={(e) => handleInputChange("measurementId", e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />
        </div>

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            {validationErrors.map((error, index) => (
              <div key={index} className="error">
                {error}
              </div>
            ))}
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Connecting..." : "Connect Database"}
          </button>
        </div>
      </form>
    </div>
  );
}
