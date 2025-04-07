import { Landing } from "./pages/landing";
import { RequireLogin } from "./components/RequireLogin";
import { Login } from "./pages/login";
import { ApiWorkbench } from "./pages/api-workbench";

export const ROUTES = {
  "/": () => <Landing />,
  "/login": () => <Login />,
  "/api-workbench": () => (
    <RequireLogin>
      <ApiWorkbench />
    </RequireLogin>
  ),
};

export function landingUrl(): string {
  return "/";
}

export function loginUrl(): string {
  return "/login";
}
export function workbenchUrl(): string {
  return "/api-workbench";
}
