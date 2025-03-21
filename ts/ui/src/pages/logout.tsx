import { useEffect } from "react";
import { useAppState } from "@/hooks/use-app-state/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router";

export function Logout() {
  const appState = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    void appState.logout();
  }, [appState]);

  useEffect(() => {
    setTimeout(() => {
      void navigate("/login");
    }, 1500);
  }, [navigate]);

  return (
    <div className="container max-w-sm mx-auto my-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Logout</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You have been logged out successfully.</p>
        </CardContent>
      </Card>
    </div>
  );
}
