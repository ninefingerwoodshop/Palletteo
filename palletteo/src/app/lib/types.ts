export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  isAdmin: boolean;
  role: "super_admin" | "admin";
  loginTime: number;
  expiresAt: number;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  role?: "super_admin" | "admin";
  createdAt: any; // Firestore Timestamp
  lastLoginAt?: any;
  photoURL?: string;
}
