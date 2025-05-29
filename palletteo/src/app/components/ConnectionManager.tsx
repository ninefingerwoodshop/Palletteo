"use client";
import { useFirebaseConnection } from "../hooks/useFirebaseConnection";
import { useState } from "react";

export default function ConnectionManager() {
  const {
    currentConnection,
    user,
    disconnect,
    switchConnection,
    getAllConnections,
  } = useFirebaseConnection();
  const [showManager, setShowManager] = useState(false);

  const connections = getAllConnections();

  if (!currentConnection) return null;

  return (
    <div className="connection-manager">
      <button
        onClick={() => setShowManager(!showManager)}
        className="connection-status"
      >
        🔗 Connected: {currentConnection.config.projectId}
        {user && <span className="user-indicator"> ({user.email})</span>}
      </button>

      {showManager && (
        <div className="connection-dropdown">
          <div className="current-connection">
            <h4>Current Connection</h4>
            <div className="connection-info">
              <strong>{currentConnection.config.projectId}</strong>
              <small>{currentConnection.config.authDomain}</small>
            </div>
          </div>

          {connections.length > 1 && (
            <div className="other-connections">
              <h4>Switch Connection</h4>
              {connections
                .filter((id) => !currentConnection.app.name.includes(id))
                .map((connectionId) => (
                  <button
                    key={connectionId}
                    onClick={() => switchConnection(connectionId)}
                    className="connection-option"
                  >
                    {connectionId}
                  </button>
                ))}
            </div>
          )}

          <div className="connection-actions">
            <button
              onClick={() => disconnect(currentConnection.app.name)}
              className="disconnect-button"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
