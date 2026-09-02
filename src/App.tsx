import { useState } from 'react';
import { HelpdeskListPage } from './features/helpdesk/pages/HelpdeskListPage';
import { HelpdeskDetailPage } from './features/helpdesk/pages/HelpdeskDetailPage';

export default function App() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  return (
    <main className="w-full min-h-screen bg-slate-50">
      {selectedTicketId ? (
        <HelpdeskDetailPage onBack={() => setSelectedTicketId(null)} />
      ) : (
        <HelpdeskListPage onSelectTicket={(id) => setSelectedTicketId(id)} />
      )}
    </main>
  );
}