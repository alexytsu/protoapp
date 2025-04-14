import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div>
      <h2 className="text-2xl font-bold">Login</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 items-start max-w-sm">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Email: </Label>
          <Input type="email" id="email" value={email} onChange={(e) => onEmailChange(e.target.value)} required />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="password">Password: </Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
};
