import { Injectable, signal } from '@angular/core';

export interface ToastAction {
  label: string;
  callback: () => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: ToastAction;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  showToast(toast: Omit<Toast, 'id'>) {
    const id = this.generateId();
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast
    };

    this.toasts.update(current => [...current, newToast]);

    // Auto-remove toast if not persistent and has duration
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }
  }

  removeToast(id: string) {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }

  removeAllToasts() {
    this.toasts.set([]);
  }

  // Convenience methods
  success(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) {
    this.showToast({
      type: 'success',
      message,
      ...options
    });
  }

  error(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) {
    this.showToast({
      type: 'error',
      message,
      duration: 0, // Errors don't auto-dismiss by default
      ...options
    });
  }

  warning(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) {
    this.showToast({
      type: 'warning',
      message,
      ...options
    });
  }

  info(message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) {
    this.showToast({
      type: 'info',
      message,
      ...options
    });
  }

  // Advanced methods
  showPersistent(type: Toast['type'], message: string, title?: string, action?: ToastAction) {
    this.showToast({
      type,
      title,
      message,
      persistent: true,
      duration: 0,
      action
    });
  }

  showWithAction(type: Toast['type'], message: string, action: ToastAction, title?: string) {
    this.showToast({
      type,
      title,
      message,
      action,
      duration: 10000 // Longer duration for actionable toasts
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
