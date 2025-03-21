import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state/context";

export function Landing() {
  const { authState } = useAppState();
  const isLoggedIn = authState.kind === "auth";

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to ProtoApp</h1>
      <p className="text-xl mb-8 text-center max-w-xl">
        A prototype application with authentication and API workbench
        capabilities.
      </p>

      <div className="flex gap-4">
        {isLoggedIn ? (
          <>
            <Button asChild className="px-6">
              <Link to="/messages">Messages</Link>
            </Button>
            <Button asChild variant="ghost" className="px-6">
              <Link to="/logout">Logout</Link>
            </Button>
          </>
        ) : (
          <Button asChild className="px-8">
            <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
