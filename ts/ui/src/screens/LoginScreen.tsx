import React, { useState } from "react";
import { Navigate } from "react-router-dom";

import { LoginScreenView } from "./LoginScreenView";

interface LoginScreenProps {
  accessToken: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ accessToken, onLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  if (accessToken) {
    return <Navigate to="/messages" replace />;
  }

  return (
    <LoginScreenView
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      onSubmit={handleLoginSubmit}
    />
  );
};
