import { createContext, use } from "react";
import { AppState } from "./index";
import { ApiWithToken } from "../../lib/auth";

export const AppStateContext = createContext<AppState | undefined>(undefined);

export function useAppState(): AppState {
  const appState = use(AppStateContext);
  if (!appState) {
    throw new Error("useAppState invalid outside an AppStateProvider");
  }
  return appState;
}

export function useApiWithToken(): ApiWithToken {
  const appState = useAppState();
  if (appState.authState.kind !== "auth") {
    throw new Error("useApiWithToken called when user not logged in");
  }
  return {
    api: appState.api,
    jwt: appState.authState.auth.jwt,
    jwt_decoded: appState.authState.auth.jwt_decoded,
  };
}
