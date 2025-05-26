import React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface LoginScreenViewProps {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginScreenView: React.FC<LoginScreenViewProps> = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" value={email} onChange={(e) => onEmailChange(e.target.value)} required />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-2">
            Login
          </Button>

          <div className="text-center mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
