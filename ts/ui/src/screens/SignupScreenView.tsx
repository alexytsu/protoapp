import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface SignupScreenViewProps {
  email: string;
  onEmailChange: (value: string) => void;
  fullname: string;
  onFullnameChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLoginRedirect: () => void;
  error: string | null;
  isSubmitting?: boolean;
}

export const SignupScreenView: React.FC<SignupScreenViewProps> = ({
  email,
  onEmailChange,
  fullname,
  onFullnameChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  onSubmit,
  onLoginRedirect,
  error,
  isSubmitting = false,
}) => {
  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6">Create an Account</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              type="text"
              id="fullname"
              value={fullname}
              onChange={(e) => onFullnameChange(e.target.value)}
              required
              placeholder="Your Name"
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </Button>

          <div className="text-center mt-4">
            Already have an account?{" "}
            <button type="button" onClick={onLoginRedirect} className="text-blue-600 hover:underline">
              Log in
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
