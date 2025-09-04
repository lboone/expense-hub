import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

interface SpinnerButtonProps extends React.ComponentProps<typeof Button> {
  isLoading: boolean;
}

const SpinnerButton = ({
  isLoading = false,
  children,
  disabled,
  ...props
}: SpinnerButtonProps) => {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
};
export default SpinnerButton;
