import type { ReactNode } from "react";

interface CardContainerProps {
  children: ReactNode;
  className?: string;
}

function CardContainer({ children, className = "" }: CardContainerProps) {
  return (
    <div
      className={`w-full rounded-lg border border-gray-200 border-l-4 border-l-orange-500 bg-sidebar p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default CardContainer;
