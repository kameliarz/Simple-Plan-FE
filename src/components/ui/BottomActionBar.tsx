import React from "react";
import { cn } from "../../lib/utils";

export interface BottomActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({ children, className }) => {
  return <div className={cn("flex items-center gap-3 pt-2", className)}>{children}</div>;
};

export default BottomActionBar;
