type Listener = (...args: any[]) => void;

interface EventMap {
  [eventName: string]: Listener[];
}

export class EventEmitter {
  private events: EventMap;

  constructor() {
    this.events = {};
  }

  on(eventName: string, listener: Listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(listener);
  }

  once(eventName: string, listener: Listener) {
    const onceListener: Listener = (...args: any[]) => {
      this.removeListener(eventName, onceListener);
      listener(...args);
    };

    this.on(eventName, onceListener);
  }

  emit(eventName: string, ...args: any[]) {
    const listeners = this.events[eventName];
    if (listeners) {
      listeners.forEach((listener) => {
        listener(...args);
      });
    }
  }

  removeListener(eventName: string, listener: Listener) {
    const listeners = this.events[eventName];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}
