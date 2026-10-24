type EventCallback<T = unknown> = (data: T) => void;

interface EventMap {
  'node:selected': { nodeId: string | null };
  'node:inspected': { nodeId: string | null };
  'node:hovered': { nodeId: string | null };
  'edge:added': { edgeId: string; sourceId: string; targetId: string };
  'edge:removed': { edgeId: string };
  'puzzle:complete': { score: number };
  'puzzle:reset': Record<string, never>;
  'simulation:started': Record<string, never>;
  'simulation:stepComplete': { stepIndex: number };
  'simulation:finished': Record<string, never>;
  'hint:used': { level: 1 | 2 | 3 };
  'level:loaded': { levelId: string };
  'level:error': { message: string };
  'audio:play': { soundId: string };
  'phase:changed': { phase: string };
}

class EventBus {
  private listeners: Map<string, Set<EventCallback<unknown>>> = new Map();

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const cb = callback as EventCallback<unknown>;
    this.listeners.get(event)!.add(cb);

    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  }

  once<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    const unsubscribe = this.on(event, (data) => {
      callback(data);
      unsubscribe();
    });
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners.get(event)?.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[EventBus] Error in listener for "${event}":`, err);
      }
    });
  }

  off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
  }

  removeAllListeners(event?: keyof EventMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();
