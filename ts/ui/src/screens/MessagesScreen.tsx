import React, { useState } from "react";
import * as API from "@protoapp/adl/protoapp/apis/ui";

import { MessagesScreenView } from "./MessagesScreenView";

interface MessagesScreenProps {
  messages: API.Message[];
  onPostMessage: (message: string) => Promise<void>;
  onRefreshMessages: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  messages,
  onPostMessage,
  onRefreshMessages,
  onLogout,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await onPostMessage(newMessage);
    setNewMessage("");
  };

  return (
    <MessagesScreenView
      messages={messages}
      newMessage={newMessage}
      onNewMessageChange={setNewMessage}
      onPostSubmit={handlePostSubmit}
      onRefreshMessages={onRefreshMessages} // Pass down the async handlers directly
      onLogout={onLogout}
    />
  );
};
