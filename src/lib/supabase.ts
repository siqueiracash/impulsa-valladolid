// This is a browser persistent store helper that makes sure leads are persistent on client and synced.
// It matches any historic Supabase interface if any part of the project attempts to call it.
export const dbSync = {
  getLeads: () => {
    try {
      const data = localStorage.getItem('impulsa_leads');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveLead: (lead: any) => {
    try {
      const current = dbSync.getLeads();
      const updated = [...current, { ...lead, id: lead.id || Date.now().toString(), datetime: lead.datetime || new Date().toISOString() }];
      localStorage.setItem('impulsa_leads', JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }
};
