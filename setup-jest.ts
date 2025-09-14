import 'jest-preset-angular/setup-jest';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for encoding APIs
Object.assign(global, { TextDecoder, TextEncoder });

// Mock IndexedDB для offline-queue тестов
const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
const FDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

Object.defineProperty(window, 'indexedDB', {
  value: new FDBFactory()
});
Object.defineProperty(window, 'IDBKeyRange', {
  value: FDBKeyRange
});

// Mock WebSocket для WS тестов
Object.defineProperty(global, 'WebSocket', {
  value: class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    readyState = MockWebSocket.CONNECTING;
    onopen = jest.fn();
    onclose = jest.fn();
    onmessage = jest.fn();
    onerror = jest.fn();

    constructor(url: string) {
      setTimeout(() => {
        this.readyState = MockWebSocket.OPEN;
        this.onopen?.({});
      }, 10);
    }

    send = jest.fn();
    close = jest.fn();
  }
});

// Mock ResizeObserver для виртуализации
Object.defineProperty(window, 'ResizeObserver', {
  value: class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }
});
