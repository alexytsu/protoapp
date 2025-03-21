import { useState } from "react";
import { Button } from "./button";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "./button-variants";

interface AsyncLoadingButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {
  onClick: () => Promise<void>;
}

export function AsyncLoadingButton({
  onClick,
  children,
  disabled,
  ...props
}: AsyncLoadingButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading || disabled} {...props}>
      {loading ? "Loading..." : children}
    </Button>
  );
}