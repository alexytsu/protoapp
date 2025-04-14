import React from "react";
import * as API from "@protoapp/adl/protoapp/apis/ui";
import { LogOut, RefreshCw, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface MessagesScreenViewProps {
  messages: API.Message[];
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onPostSubmit: (e: React.FormEvent) => void;
  onRefreshMessages: () => void;
  onLogout: () => void;
}

export const MessagesScreenView: React.FC<MessagesScreenViewProps> = ({
  messages,
  newMessage,
  onNewMessageChange,
  onPostSubmit,
  onRefreshMessages,
  onLogout,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <Button variant="secondary" onClick={onLogout} className="self-start">
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Messages</h2>
          <Button variant="secondary" onClick={onRefreshMessages}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Messages
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <Card>
              <CardHeader>
                <p className="font-bold text-sm">No messages yet</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Post a new message to get started.</p>
              </CardContent>
            </Card>
          )}
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardHeader>
                <p className="font-bold text-sm">{msg.user_fullname || "Unknown User"}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{msg.message}</p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {new Date(msg.posted_at).toLocaleString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <form onSubmit={onPostSubmit} className="flex flex-col gap-4 items-start">
        <Textarea
          value={newMessage}
          onChange={(e) => onNewMessageChange(e.target.value)}
          placeholder="Enter your message..."
          required
          className="w-full"
        />
        <Button type="submit" disabled={!newMessage.trim()} className="self-start">
          <SendHorizontal className="mr-2 h-4 w-4" /> Post Message
        </Button>
      </form>
    </div>
  );
};
