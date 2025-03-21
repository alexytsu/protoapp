import { useAppState } from "@/hooks/use-app-state/context";
import { Link } from "react-router";

export interface RequireLoginProps {
  children?: React.ReactNode;
}

export function RequireLogin({ children }: RequireLoginProps) {
  const app = useAppState();

  if (app.authState.kind !== "auth") {
    return (
      <div className="container max-w-sm mx-auto my-8">
        <div className="my-4">
          You need to{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            login
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
