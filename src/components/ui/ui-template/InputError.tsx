import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  message?: string;
}

export default function InputError({ className, message, ...props }: InputErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn("text-xs font-normal text-danger-500", className)} {...props}>
      {message}
    </p>
  );
}
