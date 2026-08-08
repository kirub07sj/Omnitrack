import { useEffect, useRef } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useAppStore } from '../store/useAppStore';

export function useSSE() {
  const { currentUser } = useAppStore();
  const { addOrderFromEvent, updateOrderFromEvent, deleteOrderFromEvent } = useOrderStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!currentUser?.business_id) return;

    const eventSource = new EventSource(`/api/orders/sse?business_id=${currentUser.business_id}`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('NEW_ORDER', (event) => {
      try {
        const data = JSON.parse(event.data);
        addOrderFromEvent(data);
      } catch (e) {
        console.error('Failed to parse NEW_ORDER event', e);
      }
    });

    eventSource.addEventListener('UPDATE_ORDER', (event) => {
      try {
        const data = JSON.parse(event.data);
        updateOrderFromEvent(data);
      } catch (e) {
        console.error('Failed to parse UPDATE_ORDER event', e);
      }
    });

    eventSource.addEventListener('DELETE_ORDER', (event) => {
      try {
        const data = JSON.parse(event.data);
        deleteOrderFromEvent(data.id);
      } catch (e) {
        console.error('Failed to parse DELETE_ORDER event', e);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      // Optional: implement reconnect logic or just let EventSource auto-reconnect
    };

    return () => {
      eventSource.close();
    };
  }, [currentUser?.business_id, addOrderFromEvent, updateOrderFromEvent, deleteOrderFromEvent]);

  return eventSourceRef.current;
}
