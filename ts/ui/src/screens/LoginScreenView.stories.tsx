import { BrowserRouter } from "react-router-dom";

import { LoginScreenView } from "./LoginScreenView";

export default {
  component: LoginScreenView,
  title: "Screens/LoginScreenView",
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export const Default = {
  args: {
    email: "",
    onEmailChange: () => {},
    password: "",
    onPasswordChange: () => {},
    onSubmit: (e) => e.preventDefault(),
  },
};

export const Filled = {
  args: {
    ...Default.args,
    email: "user@example.com",
    password: "password123",
  },
};
