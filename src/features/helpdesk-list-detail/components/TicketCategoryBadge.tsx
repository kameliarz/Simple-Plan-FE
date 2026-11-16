import React from "react";
import type { TicketCategory } from "../types/helpdesk";

interface Props {
  category: TicketCategory;
}

export const TicketCategoryBadge: React.FC<Props> = ({ category }) => {
  const isTIK = category === "TIK";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
        isTIK ? "bg-blue-900 text-white" : "bg-[#7a3015] text-white"
      }`}
    >
      {category}
    </span>
  );
};
