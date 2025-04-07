import { navigate } from "raviger";
import { useAppState } from "./use-app-state";
import { loginUrl } from "../navigation";

export function useLogout() {
  const appState = useAppState();
  return () =>
    appState.logout().then(() => {
      navigate(loginUrl());
    });
}
