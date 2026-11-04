import { useEffect, useState } from 'react';
import { loadCurriculum, type RemoteCurriculum } from '../api/curriculum';
export function useCurriculum() {
  const [state, setState] = useState<{ data?: RemoteCurriculum; error?: string; loading: boolean }>({ loading: true });
  useEffect(() => { const controller = new AbortController(); loadCurriculum(controller.signal).then(data => setState({ data, loading: false })).catch(error => { if (error.name !== 'AbortError') setState({ error: 'API unavailable — showing the checked-in curriculum fallback.', loading: false }); }); return () => controller.abort(); }, []);
  return state;
}
