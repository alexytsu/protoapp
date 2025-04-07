import { useAppState } from "@/hooks/use-app-state";
import { Redirect } from "raviger";
import { loginUrl } from "../navigation";
import { workbenchUrl } from "../navigation";

export function Landing() {
  const appState = useAppState();

  // Once we know whether we are logged in or not,
  // redirect to the the appropriate page
  switch (appState.authState.kind) {
    case "loading":
      return <div />;
    case "auth":
      return <Redirect to={workbenchUrl()} />;
    default:
      return <Redirect to={loginUrl()} />;
  }
}
