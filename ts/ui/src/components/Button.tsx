import { FC, useState } from "react";
import { LoadingButton, LoadingButtonProps } from "@mui/lab";

interface AsyncLoadingButtonProps extends LoadingButtonProps {
  onClick?: () => Promise<void>;
}

// Shows a spinner whilst the onClick handler is running, disabled if an
// onClick handler is not provided
export const AsyncLoadingButton: FC<AsyncLoadingButtonProps> = (props) => {
  const [showLoading, setShowLoading] = useState(false);
  async function onAsyncClick() {
    if (props.onClick) {
      setShowLoading(true);
      await props.onClick();
      setShowLoading(false);
    }
  }
  return <LoadingButton {...props} disabled={!props.onClick} loading={!!showLoading} onClick={onAsyncClick} />;
};
