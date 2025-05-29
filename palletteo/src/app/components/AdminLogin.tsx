"use client";
import { useState } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";

type AuthMode = "signin" | "signup";

export default function AdminLogin() {
  const { signInWithEmail, registerWithEmail, loading, error } = useAdminAuth();

  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    if (authMode === "signup") {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }
      if (!displayName.trim()) {
        setLocalError("Display name is required");
        return;
      }

      const result = await registerWithEmail(
        email,
        password,
        displayName.trim()
      );

      if (!result.success) {
        // Show success message even if they're not admin yet
        setSuccessMessage(
          "Account created successfully! If you're not automatically signed in, you may need admin approval."
        );
        setAuthMode("signin");
        resetForm();
      }
    } else {
      await signInWithEmail(email, password);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setConfirmPassword("");
    setLocalError("");
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
    setSuccessMessage("");
  };

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <div className="admin-login__header">
          <h1>Admin Panel</h1>
          <p>Palletteo Administration</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${authMode === "signin" ? "active" : ""}`}
            onClick={() => switchMode("signin")}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${authMode === "signup" ? "active" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="admin-login__form">
          {authMode === "signup" && (
            <div className="form-group">
              <label htmlFor="displayName">Full Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {authMode === "signup" && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
          )}

          {(error || localError) && (
            <div className="error">{localError || error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-login__button"
          >
            {loading
              ? "Processing..."
              : authMode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className="admin-login__footer">
          <small>
            {authMode === "signin"
              ? "Access restricted to administrators only"
              : "New accounts require admin approval for admin access"}
          </small>
        </div>
      </div>
    </div>
  );
}
