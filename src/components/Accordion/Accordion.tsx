import { useState, type ReactNode } from "react";

interface AccordionItem {
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
}

function Accordion({
  items,
}: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    null,
  );

  const toggleItem = (index: number) => {
    setOpenIndex(
      openIndex === index ? null : index,
    );
  };

  return (
    <div className="w-full divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-sidebar">
      {items.map((item, index) => (
        <div key={item.title}>
          <button
            type="button"
            onClick={() => toggleItem(index)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-background"
          >
            <span className="text-sm font-medium text-text">
              {item.title}
            </span>

            <span className="text-xl text-text-secondary">
              {openIndex === index ? "−" : "+"}
            </span>
          </button>

          {openIndex === index && (
            <div className="px-5 pb-4 text-sm text-text-secondary">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Accordion;