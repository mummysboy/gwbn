import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
  title: "Admin Dashboard - Golden West Business News",
  description: "Administrative dashboard for Golden West Business News",
};

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
