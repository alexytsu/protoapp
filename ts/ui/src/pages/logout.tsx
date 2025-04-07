import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useAppState } from "@/hooks/use-app-state";
import { useEffect } from "react";

export function Logout() {
  const appState = useAppState();

  useEffect(() => {
    appState.logout();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Logout
        </Typography>
      </Box>
    </Container>
  );
}
