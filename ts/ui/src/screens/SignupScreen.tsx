import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { SignupScreenView } from "./SignupScreenView";

interface SignupScreenProps {
  accessToken: string | null;
  onSignup: (email: string, fullname: string, password: string) => Promise<boolean>;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ accessToken, onSignup }) => {
  const [email, setEmail] = useState<string>("");
  const [fullname, setFullname] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      if (password.length < 5) {
        setError("Password must be at least 5 characters long");
        setIsSubmitting(false);
        return;
      }

      const success = await onSignup(email, fullname, password);

      if (!success) {
        setIsSubmitting(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  // If user is logged in (after successful signup), redirect to messages
  if (accessToken) {
    return <Navigate to="/messages" replace />;
  }

  return (
    <SignupScreenView
      email={email}
      onEmailChange={setEmail}
      fullname={fullname}
      onFullnameChange={setFullname}
      password={password}
      onPasswordChange={setPassword}
      confirmPassword={confirmPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSignupSubmit}
      onLoginRedirect={handleLoginRedirect}
      error={error}
      isSubmitting={isSubmitting}
    />
  );
};
