import * as API from "@protoapp/adl/protoapp/apis/ui";
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AdlRequestError } from "@/service/service-base";
import { Service } from "@/service";
import { FetchHttp } from "@/service/fetch-http";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { LoginScreen } from "@/screens/LoginScreen";
import { MessagesScreen } from "@/screens/MessagesScreen";

const service = new Service(new FetchHttp(), "/api");

// Wrapper component for protected routes
const ProtectedRoute: React.FC<{ accessToken: string | null; children: React.ReactNode }> = ({
  accessToken,
  children,
}) => {
  if (!accessToken) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  // User is logged in, render the requested component
  return <>{children}</>;
};

const App: React.FC = () => {
  // Auth state
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    // Optionally load token from storage on initial load
    return localStorage.getItem("protoapp_access_token");
  });

  // Messages state
  const [messages, setMessages] = useState<API.Message[]>([]); // ADL defined API.Message

  // Persist token to local storage
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("protoapp_access_token", accessToken);
    } else {
      localStorage.removeItem("protoapp_access_token");
    }
  }, [accessToken]);

  const handleLogoutImmediate = useCallback(() => {
    setAccessToken(null);
    setMessages([]);
    // No need to clear email/password/newMessage here
  }, []);

  const handleApiError = useCallback(
    (err: unknown) => {
      console.error(`API call failed`, err);
      if (err instanceof AdlRequestError && err.respStatus === 401 && accessToken) {
        handleLogoutImmediate(); // Force logout on 401
      }
      // Potentially add user feedback here (e.g., toast notification)
    },
    [accessToken, handleLogoutImmediate],
  );

  const fetchUserInfo = useCallback(async () => {
    if (!accessToken) return;
    try {
      await service.whoAmI(accessToken, null);
    } catch (err) {
      handleApiError(err);
    }
  }, [accessToken, handleApiError]);

  const fetchMessages = useCallback(async () => {
    if (!accessToken) return;
    try {
      const messageData = await service.recentMessages(accessToken, { page: { offset: 0, limit: 50 } });
      setMessages(messageData.items);
    } catch (err) {
      handleApiError(err);
    }
  }, [accessToken, handleApiError]);

  useEffect(() => {
    if (accessToken) {
      fetchUserInfo(); // Validate token / get user info
      fetchMessages(); // Fetch initial messages
    } else {
      setMessages([]); // Clear messages on logout
    }
  }, [accessToken, fetchMessages, fetchUserInfo]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await service.login({ email, password });
      if (response.kind === "tokens") {
        setAccessToken(response.value.access_jwt);
        // No need to clear email/password state here, LoginScreen handles its own state
      } else if (response.kind === "invalid_credentials") {
        // Add user feedback for invalid credentials
        alert("Invalid email or password.");
      }
    } catch (err) {
      handleApiError(err);
      alert("An error occurred during login. Please try again.");
    }
  };

  const handleLogout = useCallback(async () => {
    if (!accessToken) return; // Should not happen if called from MessagesScreen, but good practice
    try {
      await service.logout({});
    } catch (err) {
      handleApiError(err);
      // Still log out client-side even if API fails
    } finally {
      handleLogoutImmediate();
    }
  }, [accessToken, handleApiError, handleLogoutImmediate]);

  const handlePostMessage = async (message: string) => {
    if (!message.trim() || !accessToken) return;
    try {
      await service.newMessage(accessToken, { message: message });
      // No need to clear newMessage state here, MessagesScreen handles its own state
      await fetchMessages(); // Refresh messages after posting
    } catch (err) {
      handleApiError(err);
      alert("Failed to post message. Please try again.");
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="protoapp-theme">
      <Router>
        <div className="container mx-auto flex flex-col min-h-screen gap-8 p-4">
          <header className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Protoapp</h1>
            <ModeToggle />
          </header>

          <main className="flex-grow">
            <Routes>
              <Route path="/login" element={<LoginScreen accessToken={accessToken} onLogin={handleLogin} />} />

              <Route
                path="/messages"
                element={
                  <ProtectedRoute accessToken={accessToken}>
                    <MessagesScreen
                      messages={messages}
                      onPostMessage={handlePostMessage}
                      onRefreshMessages={fetchMessages}
                      onLogout={handleLogout}
                    />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/"
                element={accessToken ? <Navigate to="/messages" replace /> : <Navigate to="/login" replace />}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="mt-auto text-center text-sm text-muted-foreground py-4 border-t">
            Protoapp © {new Date().getFullYear()}
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
