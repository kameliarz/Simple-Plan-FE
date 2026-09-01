import { useState, type ReactNode } from "react";

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            type="button"
            key={tab.label}
            onClick={() => setActiveTab(index)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
              activeTab === index
                ? "border-b-2 border-primary text-primary"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-4 text-text">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}

export default Tabs;