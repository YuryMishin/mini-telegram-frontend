import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject, Subject, Observable, timer, EMPTY, fromEvent, merge } from 'rxjs';
import {
  filter,
  map,
  takeUntil,
  retry,
  delay,
  switchMap,
  tap,
  catchError,
  share,
  distinctUntilChanged
} from 'rxjs/operators';

import { environment } from '../../environment';
import { ToastService } from '../ui/toast/toast.service';
import {
  WSEvent,
  WSEventType,
  WSMessageNewEvent,
  WSMessageEditEvent,
  WSMessageDeleteEvent,
  WSMessageReadEvent,
  WSTypingEvent,
  WSPresenceEvent,
  WSDialogEvent,
  WSUserUpdateEvent,
  WSNotificationEvent,
  WSConnectionEvent,
  WSErrorEvent,
  ConnectionState,
  TypingState,
  OnlineUsersMap,
  WSEventSchema,
} from './types';

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  connectionTimeout: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private readonly toastService = inject(ToastService);

  // Configuration
  private readonly config: WebSocketConfig = {
    url: environment.wsUrl,
    reconnectAttempts: environment.websocket.reconnectAttempts,
    reconnectDelay: environment.websocket.reconnectDelay,
    heartbeatInterval: environment.websocket.heartbeatInterval,
    connectionTimeout: 10000,
  };

  // WebSocket instance
  private ws?: WebSocket;
  private destroy$ = new Subject<void>();

  // Connection management
  private connectionState = signal<ConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0
  });

  private reconnectAttempts = 0;
  private heartbeatTimer?: number;
  private connectionTimer?: number;
  private reconnectTimer?: number;

  // Event streams
  private readonly eventSubject = new Subject<WSEvent>();
  private readonly rawEventSubject = new Subject<MessageEvent>();

  // State management
  private readonly typingState = signal<TypingState>({});
  private readonly onlineUsers = signal<OnlineUsersMap>(new Map());

  // Public observables
  readonly events$ = this.eventSubject.asObservable().pipe(share());
  readonly connectionState$ = computed(() => this.connectionState());
  readonly isConnected$ = computed(() => this.connectionState().status === 'connected');
  readonly isConnecting$ = computed(() => this.connectionState().status === 'connecting');
  readonly isReconnecting$ = computed(() => this.connectionState().status === 'reconnecting');

  // Typed event streams
  readonly messageEvents$ = this.events$.pipe(
    filter((event): event is WSMessageNewEvent | WSMessageEditEvent | WSMessageDeleteEvent =>
      ['message:new', 'message:edit', 'message:delete'].includes(event.type)
    )
  );

  readonly typingEvents$ = this.events$.pipe(
    filter((event): event is WSTypingEvent =>
      ['typing:start', 'typing:stop'].includes(event.type)
    )
  );

  readonly presenceEvents$ = this.events$.pipe(
    filter((event): event is WSPresenceEvent => event.type === 'presence:update')
  );

  readonly dialogEvents$ = this.events$.pipe(
    filter((event): event is WSDialogEvent =>
      ['dialog:new', 'dialog:update', 'dialog:delete'].includes(event.type)
    )
  );

  constructor() {
    this.setupOnlineStatusListener();
    this.setupTypingCleanup();
    this.setupPresenceTracking();
  }

  // ========================
  // Connection Management
  // ========================

  connect(token?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.cleanup();
    this.updateConnectionState({ status: 'connecting', reconnectAttempts: this.reconnectAttempts });

    try {
      const wsUrl = token ? `${this.config.url}?token=${encodeURIComponent(token)}` : this.config.url;
      this.ws = new WebSocket(wsUrl);

      this.setupEventListeners();
      this.setupConnectionTimeout();

    } catch (error) {
      this.handleConnectionError(`Failed to create WebSocket connection: ${error}`);
    }
  }

  disconnect(): void {
    this.destroy$.next();
    this.cleanup();
    this.updateConnectionState({ status: 'disconnected', reconnectAttempts: 0 });
    this.reconnectAttempts = 0;
  }

  reconnect(): void {
    if (this.connectionState().status === 'connected') {
      return;
    }

    this.disconnect();

    // Get token from localStorage or auth service
    const token = localStorage.getItem('accessToken');
    this.connect(token || undefined);
  }

  // ========================
  // Message Sending
  // ========================

  send(event: Omit<WSEvent, 'timestamp'>): boolean {
    if (!this.isConnected$()) {
      console.warn('WebSocket not connected. Cannot send event:', event);
      return false;
    }

    try {
      const eventWithTimestamp = {
        ...event,
        timestamp: new Date().toISOString()
      };

      this.ws!.send(JSON.stringify(eventWithTimestamp));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket event:', error);
      return false;
    }
  }

  // Convenience methods for sending specific events
  sendTyping(dialogId: string, isTyping: boolean): void {
    this.send({
      type: isTyping ? 'typing:start' : 'typing:stop',
      data: {
        userId: this.getCurrentUserId(),
        userName: this.getCurrentUserName(),
        dialogId
      }
    });
  }

  sendMessageRead(messageId: string, dialogId: string): void {
    this.send({
      type: 'message:read',
      data: {
        messageId,
        dialogId,
        userId: this.getCurrentUserId(),
        readAt: new Date().toISOString()
      }
    });
  }

  sendPresenceUpdate(status: 'online' | 'offline' | 'away' | 'busy'): void {
    this.send({
      type: 'presence:update',
      data: {
        userId: this.getCurrentUserId(),
        status,
        isOnline: status === 'online',
        lastSeen: new Date().toISOString()
      }
    });
  }

  // ========================
  // Event Listeners
  // ========================

  onEvent<T extends WSEvent>(eventType: T['type']): Observable<T['data']> {
    return this.events$.pipe(
      filter((event): event is T => event.type === eventType),
      map(event => event.data)
    );
  }

  onMessageNew(): Observable<WSMessageNewEvent['data']> {
    return this.onEvent('message:new');
  }

  onMessageEdit(): Observable<WSMessageEditEvent['data']> {
    return this.onEvent('message:edit');
  }

  onMessageDelete(): Observable<WSMessageDeleteEvent['data']> {
    return this.onEvent('message:delete');
  }

  onMessageRead(): Observable<WSMessageReadEvent['data']> {
    return this.onEvent('message:read');
  }

  onTypingStart(): Observable<WSTypingEvent['data']> {
    return this.onEvent('typing:start');
  }

  onTypingStop(): Observable<WSTypingEvent['data']> {
    return this.onEvent('typing:stop');
  }

  onPresenceUpdate(): Observable<WSPresenceEvent['data']> {
    return this.onEvent('presence:update');
  }

  onDialogNew(): Observable<WSDialogEvent['data']> {
    return this.onEvent('dialog:new');
  }

  onDialogUpdate(): Observable<WSDialogEvent['data']> {
    return this.onEvent('dialog:update');
  }

  onDialogDelete(): Observable<WSDialogEvent['data']> {
    return this.onEvent('dialog:delete');
  }

  onUserUpdate(): Observable<WSUserUpdateEvent['data']> {
    return this.onEvent('user:update');
  }

  onNotification(): Observable<WSNotificationEvent['data']> {
    return this.onEvent('notification:new');
  }

  onConnectionStatus(): Observable<WSConnectionEvent['data']> {
    return this.onEvent('connection:status');
  }

  onError(): Observable<WSErrorEvent['data']> {
    return this.onEvent('error');
  }

  // ========================
  // Typing State Management
  // ========================

  getTypingUsers(dialogId: string): string[] {
    const dialogTyping = this.typingState()[dialogId];
    if (!dialogTyping) return [];

    const currentTime = Date.now();
    return Object.entries(dialogTyping)
      .filter(([_, data]) => currentTime - data.timestamp < 5000) // 5 second timeout
      .map(([userId]) => userId);
  }

  getTypingUserNames(dialogId: string): string[] {
    const dialogTyping = this.typingState()[dialogId];
    if (!dialogTyping) return [];

    const currentTime = Date.now();
    return Object.entries(dialogTyping)
      .filter(([_, data]) => currentTime - data.timestamp < 5000)
      .map(([_, data]) => data.userName);
  }

  // ========================
  // Online Users Management
  // ========================

  isUserOnline(userId: string): boolean {
    return this.onlineUsers().get(userId)?.status === 'online' || false;
  }

  getUserStatus(userId: string): string {
    return this.onlineUsers().get(userId)?.status || 'offline';
  }

  getUserLastSeen(userId: string): Date | undefined {
    return this.onlineUsers().get(userId)?.lastSeen;
  }

  // ========================
  // Private Methods
  // ========================

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.updateConnectionState({
        status: 'connected',
        lastConnected: new Date(),
        error: undefined
      });
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.clearConnectionTimeout();

      // Send initial presence
      this.sendPresenceUpdate('online');
    };

    this.ws.onmessage = (event) => {
      this.rawEventSubject.next(event);
      this.handleMessage(event);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.stopHeartbeat();

      const wasConnected = this.connectionState().status === 'connected';
      this.updateConnectionState({ status: 'disconnected' });

      // Don't auto-reconnect if closed intentionally (code 1000)
      if (event.code !== 1000 && wasConnected && this.reconnectAttempts < this.config.reconnectAttempts) {
        this.scheduleReconnect();
      } else if (this.reconnectAttempts >= this.config.reconnectAttempts) {
        this.toastService.error('Connection lost. Please refresh the page.');
      }
    };

    this.ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.handleConnectionError('WebSocket connection error');
    };
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Handle heartbeat response
      if (data.type === 'pong') {
        return;
      }

      // Validate event schema
      const validatedEvent = WSEventSchema.parse(data);
      this.eventSubject.next(validatedEvent);

      // Handle specific event types for internal state
      this.handleInternalEvent(validatedEvent);

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error, event.data);
    }
  }

  private handleInternalEvent(event: WSEvent): void {
    switch (event.type) {
      case 'typing:start':
        this.updateTypingState(event.data.dialogId, event.data.userId, {
          userName: event.data.userName,
          timestamp: Date.now()
        });
        break;

      case 'typing:stop':
        this.removeTypingState(event.data.dialogId, event.data.userId);
        break;

      case 'presence:update':
        this.updateUserPresence(event.data.userId, {
          status: event.data.status,
          lastSeen: event.data.lastSeen ? new Date(event.data.lastSeen) : undefined
        });
        break;

      case 'connection:status':
        if (event.data.status === 'connected') {
          this.updateConnectionState({ status: 'connected' });
        }
        break;

      case 'error':
        this.handleWSError(event.data);
        break;
    }
  }

  private handleConnectionError(error: string): void {
    console.error('WebSocket connection error:', error);
    this.updateConnectionState({
      status: 'disconnected',
      error
    });

    if (this.reconnectAttempts < this.config.reconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleWSError(error: WSErrorEvent['data']): void {
    console.error('WebSocket server error:', error);

    switch (error.code) {
      case 'AUTH_INVALID':
        this.toastService.error('Authentication failed. Please log in again.');
        // Trigger re-authentication
        break;

      case 'RATE_LIMITED':
        this.toastService.warning('Too many requests. Please slow down.');
        break;

      default:
        this.toastService.error(`Server error: ${error.message}`);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.updateConnectionState({ status: 'reconnecting' });

    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.reconnectAttempts})`);

    this.reconnectTimer = window.setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      this.connect(token || undefined);
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private setupConnectionTimeout(): void {
    this.connectionTimer = window.setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.ws?.close();
        this.handleConnectionError('Connection timeout');
      }
    }, this.config.connectionTimeout);
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = undefined;
    }
  }

  private cleanup(): void {
    this.stopHeartbeat();
    this.clearConnectionTimeout();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = undefined;
    }
  }

  private updateConnectionState(update: Partial<ConnectionState>): void {
    this.connectionState.update(current => ({ ...current, ...update }));
  }

  private updateTypingState(dialogId: string, userId: string, data: { userName: string; timestamp: number }): void {
    this.typingState.update(current => ({
      ...current,
      [dialogId]: {
        ...current[dialogId],
        [userId]: data
      }
    }));
  }

  private removeTypingState(dialogId: string, userId: string): void {
    this.typingState.update(current => {
      const dialog = { ...current[dialogId] };
      delete dialog[userId];

      return {
        ...current,
        [dialogId]: dialog
      };
    });
  }

  private updateUserPresence(userId: string, data: { status: any; lastSeen?: Date }): void {
    this.onlineUsers.update(current => {
      const newMap = new Map(current);
      newMap.set(userId, data);
      return newMap;
    });
  }

  private setupOnlineStatusListener(): void {
    const online$ = fromEvent(window, 'online');
    const offline$ = fromEvent(window, 'offline');

    merge(online$, offline$).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (navigator.onLine) {
        if (this.connectionState().status === 'disconnected') {
          this.reconnect();
        }
        this.sendPresenceUpdate('online');
      } else {
        this.sendPresenceUpdate('offline');
      }
    });
  }

  private setupTypingCleanup(): void {
    // Clean up expired typing indicators every 5 seconds
    timer(0, 5000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.cleanupExpiredTyping();
    });
  }

  private cleanupExpiredTyping(): void {
    const currentTime = Date.now();
    const timeout = 5000; // 5 seconds

    this.typingState.update(current => {
      const cleaned: TypingState = {};

      Object.entries(current).forEach(([dialogId, users]) => {
        const activeUsers: { [userId: string]: { userName: string; timestamp: number } } = {};

        Object.entries(users).forEach(([userId, data]) => {
          if (currentTime - data.timestamp < timeout) {
            activeUsers[userId] = data;
          }
        });

        if (Object.keys(activeUsers).length > 0) {
          cleaned[dialogId] = activeUsers;
        }
      });

      return cleaned;
    });
  }

  private setupPresenceTracking(): void {
    // Send presence updates on page visibility changes
    fromEvent(document, 'visibilitychange').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (document.hidden) {
        this.sendPresenceUpdate('away');
      } else {
        this.sendPresenceUpdate('online');
      }
    });

    // Send presence on beforeunload
    fromEvent(window, 'beforeunload').pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.sendPresenceUpdate('offline');
    });
  }

  private getCurrentUserId(): string {
    // This would typically come from an auth service
    // For now, return a placeholder or get from localStorage
    return localStorage.getItem('userId') || 'unknown-user';
  }

  private getCurrentUserName(): string {
    // This would typically come from an auth service
    return localStorage.getItem('userName') || 'Unknown User';
  }
}
