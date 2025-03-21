import { Routes, Route } from "react-router";
import { AppStateProvider } from "./hooks/use-app-state";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login";
import { Logout } from "./pages/logout";
import { Messages } from "./pages/messages";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";

function App() {
  return (
    <AppStateProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/messages"
          element={
            <ProtectedLayout>
              <Messages />
            </ProtectedLayout>
          }
        />
      </Routes>
    </AppStateProvider>
  );
}

export default App;
