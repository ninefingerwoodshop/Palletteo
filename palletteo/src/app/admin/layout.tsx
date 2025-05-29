import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - Palletteo",
  description: "Administrative interface for Palletteo",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
