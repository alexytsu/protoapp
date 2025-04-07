import { useAppState } from "@/hooks/use-app-state";
import { loginUrl } from "@/navigation";
import { Box, Container } from "@mui/material";
import { InternalLink } from "./Links";

export interface RequireLoginParams {
  children?: React.ReactNode;
}

export function RequireLogin(params: RequireLoginParams) {
  const app = useAppState();
  if (app.authState.kind != "auth") {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          You need to <InternalLink url={loginUrl()}>login</InternalLink>
        </Box>
      </Container>
    );
  }
  return <>{params.children}</>;
}
