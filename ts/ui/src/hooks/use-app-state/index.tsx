import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Service } from "../../service";
import { FetchHttp } from "../../service/fetch-http";
import { Auth, expiry_secs, JwtClaims } from "../../lib/auth";
import { jwtDecode } from "jwt-decode";

import { LoginResp, makeRefreshReq } from "@/adl-gen/protoapp/apis/ui";
import { AppStateContext } from "./context";

const protoappApi = new Service(new FetchHttp(), "/api");

export interface AppState {
  api: Service;
  authState: AuthState;
  setAuthStateFromLogin(resp: LoginResp): void;
  logout(): Promise<void>;
}

export type AuthState =
  | { kind: "loading" }
  | { kind: "noauth" }
  | { kind: "auth"; auth: Auth }
  | { kind: "authfailed" };

export function AppStateProvider(props: { children?: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ kind: "loading" });

  const setAuthStateFromLogin = useCallback(
    function (resp: LoginResp) {
      switch (resp.kind) {
        case "tokens": {
          const jwt = resp.value.access_jwt;
          const jwt_decoded = jwtDecode<JwtClaims>(jwt);
          console.log("jwt", jwt_decoded);
          const auth = { jwt, jwt_decoded };
          setAuthState({ kind: "auth", auth });
          break;
        }
        case "invalid_credentials": {
          setAuthState({ kind: "authfailed" });
          break;
        }
      }
    },
    [setAuthState],
  );

  const logout = useCallback(async () => {
    await protoappApi.logout({});
    console.log(`logout`);
    setAuthState({ kind: "noauth" });
  }, [setAuthState]);

  async function refresh() {
    console.log("Refreshing JWT");
    const resp = await protoappApi.refresh(makeRefreshReq({}));
    switch (resp.kind) {
      case "invalid_refresh_token":
        setAuthState({ kind: "noauth" });
        break;
      case "access_token": {
        const jwt = resp.value;
        const jwt_decoded = jwtDecode<JwtClaims>(jwt);
        console.log("jwt", jwt_decoded);
        const auth = { jwt, jwt_decoded };
        setAuthState({ kind: "auth", auth });
        break;
      }
    }
  }

  const renewJwt = useCallback(async () => {
    if (authState.kind === "auth") {
      const claims = authState.auth.jwt_decoded;
      if (expiry_secs(claims) < 60) {
        await refresh();
      }
    }
  }, [authState]);

  // Attempt to refresh a token on page load, relying on the refreshToken cookie
  useEffect(() => {
    void refresh();
  }, []);

  // Refresh the token whenever we have less than 30 seconds to expire
  useEffect(() => {
    const interval = setInterval(renewJwt, 10 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, [renewJwt]);

  const apiManager = useMemo(() => {
    return {
      api: protoappApi,
      authState,
      setAuthStateFromLogin,
      logout,
    };
  }, [authState, setAuthStateFromLogin, logout]);

  return <AppStateContext value={apiManager}>{props.children}</AppStateContext>;
}
