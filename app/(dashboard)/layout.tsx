import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UserProvider } from "@/lib/contexts/user-context";
import { ThemeProvider } from "@/components/theme-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </UserProvider>
    </ThemeProvider>
  );
}
