import { navigate } from "raviger";
import Link from "@mui/material/Link";

interface InternalLinkParams {
  url: string;
  children?: React.ReactNode;
}

export function InternalLink(params: InternalLinkParams) {
  return (
    <Link
      sx={{ cursor: "pointer" }}
      href={params.url}
      onClick={(e) => {
        e.preventDefault();
        navigate(params.url);
      }}
    >
      {params.children}
    </Link>
  );
}
