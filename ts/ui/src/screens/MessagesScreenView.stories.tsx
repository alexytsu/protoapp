import type { Meta, StoryObj } from "@storybook/react";
import * as API from "@protoapp/adl/protoapp/apis/ui";
import { fn } from "@storybook/test";

import { MessagesScreenView } from "./MessagesScreenView";

const meta = {
  component: MessagesScreenView,
  title: "Screens/MessagesScreenView",
  parameters: {
    layout: "fullscreen",
  },
  // Add argTypes if needed for controls
  argTypes: {
    // Example: Control the newMessage input
    newMessage: { control: "text" },
    // Actions for button clicks
    onNewMessageChange: { action: "newMessageChanged" },
    onPostSubmit: { action: "postSubmitted" },
    onRefreshMessages: { action: "refreshClicked" },
    onLogout: { action: "logoutClicked" },
  },
} satisfies Meta<typeof MessagesScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Define mock messages using the inferred API.Message structure
const mockMessages: API.Message[] = [
  {
    id: "1",
    message: "Hello there! This is the first message.",
    user_fullname: "User One",
    posted_at: new Date(Date.now() - 60000 * 5).getTime(), // Use getTime() for number timestamp
  },
  {
    id: "2",
    message: "Hi! How are you doing today?",
    user_fullname: "User Two",
    posted_at: new Date(Date.now() - 60000 * 2).getTime(), // Use getTime() for number timestamp
  },
  {
    id: "3",
    message: "Just testing the message view.",
    user_fullname: "User One",
    posted_at: new Date().getTime(), // Use getTime() for number timestamp
  },
];

export const Default: Story = {
  args: {
    messages: mockMessages,
    newMessage: "",
    onNewMessageChange: (value: string) => fn()(value),
    onPostSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      fn()(e);
    },
    onRefreshMessages: () => fn()(),
    onLogout: () => fn()(),
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    messages: [],
  },
};

export const WithPendingMessage: Story = {
  args: {
    ...Default.args,
    newMessage: "This is a pre-filled message.",
  },
};
