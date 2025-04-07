import { useAppState } from "@/hooks/use-app-state";
import { Redirect } from "raviger";

export function Landing() {
  const appState = useAppState();

  // Once we know whether we are logged in or not,
  // redirect to the the appropriate page
  switch (appState.authState.kind) {
    case "loading":
      return <div />;
    case "auth":
      return <Redirect to="/messages" />;
    default:
      return <Redirect to="/login" />;
  }
}
