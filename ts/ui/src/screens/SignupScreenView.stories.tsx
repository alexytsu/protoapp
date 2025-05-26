import type { Meta, StoryObj } from "@storybook/react";

import { SignupScreenView } from "./SignupScreenView";

const meta = {
  title: "Screens/SignupScreenView",
  component: SignupScreenView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SignupScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    email: "",
    onEmailChange: () => {},
    fullname: "",
    onFullnameChange: () => {},
    password: "",
    onPasswordChange: () => {},
    confirmPassword: "",
    onConfirmPasswordChange: () => {},
    onSubmit: (e) => e.preventDefault(),
    onLoginRedirect: () => {},
    error: null,
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: "Passwords do not match",
  },
};

export const Filled: Story = {
  args: {
    ...Default.args,
    email: "user@example.com",
    fullname: "John Doe",
    password: "password123",
    confirmPassword: "password123",
  },
};

export const Loading: Story = {
  args: {
    ...Filled.args,
    isSubmitting: true,
  },
};
