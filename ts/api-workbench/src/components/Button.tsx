import { FC, useState } from "react";
import { Button, ButtonProps } from "@mui/material";

interface AsyncLoadingButtonProps extends ButtonProps {
  onClick?: () => Promise<void>;
}

/**
 * Shows a spinner whilst the onClick handler is running, disabled if an
 * onClick handler is not provided
 */
export const AsyncLoadingButton: FC<AsyncLoadingButtonProps> = (props) => {
  const [loading, setLoading] = useState(false);
  async function onAsyncClick() {
    if (props.onClick) {
      setLoading(true);
      await props.onClick();
      setLoading(false);
    }
  }
  return <Button {...props} disabled={!props.onClick} loading={loading} onClick={onAsyncClick} />;
};
