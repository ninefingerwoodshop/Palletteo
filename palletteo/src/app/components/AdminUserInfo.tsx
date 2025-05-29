"use client";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminUserInfo() {
  const { user, signOut } = useAdminAuth();

  if (!user) return null;

  return (
    <div className="admin-user-info">
      <div className="user-avatar">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.name} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="user-details">
        <span className="user-name">{user.name}</span>
        <span className="user-email">{user.email}</span>
        <span className="user-role">
          {user.role === "super_admin" ? "Super Admin" : "Admin"}
        </span>
      </div>
      <button onClick={signOut} className="sign-out-button">
        Sign Out
      </button>
    </div>
  );
}
