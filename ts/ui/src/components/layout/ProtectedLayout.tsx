import { RequireLogin } from "@/components/auth/RequireLogin";
import { AppLayout } from "./AppLayout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <RequireLogin>
      <AppLayout>
        {children}
      </AppLayout>
    </RequireLogin>
  );
}