// src/app/components/UserManagement.tsx
"use client";
import { useState, useEffect } from "react";
import { userService, UserRecord } from "../lib/user-service";

export default function UserManagement() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "admins" | "users">("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await userService.getAllUsers();
      // Sort by creation date, newest first
      usersData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (
    email: string,
    isCurrentlyAdmin: boolean
  ) => {
    const action = isCurrentlyAdmin ? "remove admin status from" : "make admin";

    if (!confirm(`Are you sure you want to ${action} ${email}?`)) {
      return;
    }

    try {
      let success;
      if (isCurrentlyAdmin) {
        success = await userService.removeAdminStatus(email);
      } else {
        success = await userService.makeUserAdmin(email);
      }

      if (success) {
        await loadUsers();
        alert(
          `Successfully ${
            isCurrentlyAdmin ? "removed admin status" : "made user admin"
          }`
        );
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "admins") return user.isAdmin;
    if (filter === "users") return !user.isAdmin;
    return true;
  });

  if (loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management__header">
        <h2>User Management</h2>
        <p>Manage all registered users and admin permissions</p>
      </div>

      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {users.filter((u) => u.isAdmin).length}
          </div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {users.filter((u) => !u.isAdmin).length}
          </div>
          <div className="stat-label">Regular Users</div>
        </div>
      </div>

      <div className="user-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All Users ({users.length})
        </button>
        <button
          className={filter === "admins" ? "active" : ""}
          onClick={() => setFilter("admins")}
        >
          Admins ({users.filter((u) => u.isAdmin).length})
        </button>
        <button
          className={filter === "users" ? "active" : ""}
          onClick={() => setFilter("users")}
        >
          Regular Users ({users.filter((u) => !u.isAdmin).length})
        </button>
      </div>

      <div className="users-table">
        <div className="table-header">
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Registered</span>
          <span>Last Login</span>
          <span>Actions</span>
        </div>

        {filteredUsers.map((user) => (
          <div key={user.email} className="table-row">
            <div className="user-info">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="user-avatar"
                />
              )}
              <span className="user-name">{user.name}</span>
            </div>

            <span className="user-email">{user.email}</span>

            <span className={`user-status ${user.isAdmin ? "admin" : "user"}`}>
              {user.isAdmin ? (
                <span className="admin-badge">Admin</span>
              ) : (
                <span className="user-badge">User</span>
              )}
            </span>

            <span className="user-date">
              {user.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown"}
            </span>

            <span className="user-date">
              {user.lastLoginAt?.toDate?.()?.toLocaleDateString() || "Never"}
            </span>

            <div className="user-actions">
              <button
                onClick={() => handleToggleAdmin(user.email, user.isAdmin)}
                className={user.isAdmin ? "btn-warning" : "btn-primary"}
              >
                {user.isAdmin ? "Remove Admin" : "Make Admin"}
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No {filter === "all" ? "" : filter} users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
