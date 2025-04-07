import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTypedFieldState } from "@/components/forms/model/fields/hooks";
import { EMAIL_FIELD, NON_EMPTY_STRING_FIELD } from "@/components/forms/model/fields/primitive";
import { TextField } from "@mui/material";
import { AsyncLoadingButton } from "@/components/Button";
import { useAppState } from "@/hooks/use-app-state";
import { useState } from "react";
import { useNavigate } from "raviger";
import { messagesUrl } from "@/navigation";

export function Login() {
  const navigate = useNavigate();
  const appState = useAppState();
  const email = useTypedFieldState(EMAIL_FIELD);
  const password = useTypedFieldState(NON_EMPTY_STRING_FIELD);
  const [showErrors, setShowErrors] = useState(false);
  const formValid = email.isValid() && password.isValid();

  async function onLogin() {
    if (formValid) {
      const resp = await appState.api.login({ email: email.value(), password: password.value() });
      appState.setAuthStateFromLogin(resp);
      if (resp.kind === "tokens") {
        navigate(messagesUrl());
      }
    } else {
      setShowErrors(true);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Login
        </Typography>

        <TextField
          label="Email"
          required
          variant="outlined"
          color="secondary"
          type="email"
          sx={{ mb: 3 }}
          fullWidth
          onChange={(e) => email.setText(e.target.value)}
          value={email.text}
          error={showErrors && !email.isValid()}
          helperText={showErrors && email.validationError()}
        />

        <TextField
          label="Password"
          required
          variant="outlined"
          color="secondary"
          type="password"
          onChange={(e) => password.setText(e.target.value)}
          value={password.text}
          error={showErrors && !password.isValid()}
          helperText={showErrors && password.validationError()}
          fullWidth
          sx={{ mb: 3 }}
        />

        {appState.authState.kind === "authfailed" && (
          <Box sx={{ marginBottom: "15px", color: "red" }}>Incorrect username/password.</Box>
        )}

        <AsyncLoadingButton variant="contained" onClick={onLogin}>
          Login
        </AsyncLoadingButton>
      </Box>
    </Container>
  );
}
