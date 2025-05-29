"use client";
import { useState, useEffect } from "react";
import { userService } from "../lib/user-service";
import { UserRecord } from "../lib/types";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function UserManagement() {
  const { user: currentUser } = useAdminAuth();
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
      usersData.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
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

  const handleMakeSuperAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to make ${email} a Super Admin?`)) {
      return;
    }

    try {
      const success = await userService.makeUserAdmin(email, "super_admin");
      if (success) {
        await loadUsers();
        alert("Successfully promoted to Super Admin");
      } else {
        alert("Failed to promote user");
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("Error promoting user");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "admins") return user.isAdmin;
    if (filter === "users") return !user.isAdmin;
    return true;
  });

  const canManageUsers = currentUser?.role === "super_admin";

  if (loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management__header">
        <h2>User Management</h2>
        <p>Manage all registered users and admin permissions</p>
        {!canManageUsers && (
          <p className="warning">⚠️ Only Super Admins can manage users</p>
        )}
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
            {users.filter((u) => u.role === "super_admin").length}
          </div>
          <div className="stat-label">Super Admins</div>
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
          {canManageUsers && <span>Actions</span>}
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
              {user.role === "super_admin" ? (
                <span className="super-admin-badge">Super Admin</span>
              ) : user.isAdmin ? (
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

            {canManageUsers && user.email !== currentUser?.email && (
              <div className="user-actions">
                {!user.isAdmin ? (
                  <button
                    onClick={() => handleToggleAdmin(user.email, user.isAdmin)}
                    className="btn-primary"
                  >
                    Make Admin
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        handleToggleAdmin(user.email, user.isAdmin)
                      }
                      className="btn-warning"
                    >
                      Remove Admin
                    </button>
                    {user.role !== "super_admin" && (
                      <button
                        onClick={() => handleMakeSuperAdmin(user.email)}
                        className="btn-outline"
                      >
                        Make Super Admin
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
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
