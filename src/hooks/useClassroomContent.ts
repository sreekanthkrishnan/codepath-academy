import { useEffect, useState } from 'react';
import { loadClassroom, type Lesson, type RemoteClass, type Topic } from '../api/classroom';
type State = { loading: boolean; error?: string; lesson?: Lesson; topics?: Topic[]; clazz?: RemoteClass };
export function useClassroomContent(classCode: string, locale: string): State {
  const [state, setState] = useState<State>({ loading: true });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ loading: true });

    loadClassroom(classCode, locale, controller.signal)
      .then(data => {
        if (active) setState({ loading: false, ...data });
      })
      .catch(error => {
        if (active && error.name !== 'AbortError') {
          setState({ loading: false, error: 'Lesson API unavailable — showing the local lesson fallback.' });
        }
      });

    return () => { active = false; controller.abort(); };
  }, [classCode, locale]);

  return state;
}
