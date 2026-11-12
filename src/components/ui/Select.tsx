import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

function Select({ children, ...props }: SelectProps) {
  return <select {...props}>{children}</select>;
}

export default Select;
