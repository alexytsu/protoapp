import { LoginScreenView } from "./LoginScreenView";

export default {
  component: LoginScreenView,
  title: "Screens/LoginScreenView",
  parameters: {
    layout: "fullscreen",
  },
};

export const Default = {
  args: {
    onLogin: () => console.log("Login clicked"),
    onRegister: () => console.log("Register clicked"),
  },
};
