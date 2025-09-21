import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="getToastClasses(toast.type)"
          class="pointer-events-auto w-full overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 animate-toast-in"
          role="alert"
          [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <div class="p-4">
            <div class="flex items-start">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <svg
                  [class]="getIconClasses(toast.type)"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path [attr.d]="getIconPath(toast.type)" [attr.fill-rule]="getIconFillRule(toast.type)" [attr.clip-rule]="getIconClipRule(toast.type)" />
                </svg>
              </div>

              <!-- Content -->
              <div class="ml-3 w-0 flex-1">
                @if (toast.title) {
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ toast.title }}
                  </p>
                }
                <p [class]="getMessageClasses(toast.title)">
                  {{ toast.message }}
                </p>

                @if (toast.action) {
                  <div class="mt-3 flex space-x-2">
                    <button
                      type="button"
                      (click)="handleAction(toast)"
                      class="bg-white dark:bg-gray-800 rounded-md text-sm font-medium text-telegram-blue hover:text-telegram-blue-dark focus:outline-none focus:ring-2 focus:ring-telegram-blue"
                    >
                      {{ toast.action.label }}
                    </button>
                  </div>
                }
              </div>

              <!-- Close Button -->
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  type="button"
                  (click)="toastService.removeToast(toast.id)"
                  class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-telegram-blue"
                  [attr.aria-label]="'Close ' + toast.type + ' notification'"
                >
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Progress Bar for Auto-dismiss -->
            @if (toast.duration && toast.duration > 0) {
              <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                <div
                  class="h-full transition-all ease-linear"
                  [class]="getProgressBarClasses(toast.type)"
                  [style.animation]="'toast-progress ' + toast.duration + 'ms linear'"
                ></div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Toast Container for Bottom Position (alternative) -->
    @if (false) {
      <div class="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full">
        <!-- Same toast structure but positioned at bottom -->
      </div>
    }
  `,
  styles: [`
    @keyframes toast-progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    .animate-toast-in {
      animation: toastIn 0.3s ease-out;
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(100%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getToastClasses(type: string): string {
    const baseClasses = 'border-l-4';
    const typeClasses = {
      success: 'border-green-400 bg-green-50 dark:bg-green-900/20',
      error: 'border-red-400 bg-red-50 dark:bg-red-900/20',
      warning: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      info: 'border-telegram-blue bg-blue-50 dark:bg-blue-900/20'
    };
    return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`;
  }

  getIconClasses(type: string): string {
    const baseClasses = 'h-5 w-5';
    const typeClasses = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-telegram-blue'
    };
    return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`;
  }

  getProgressBarClasses(type: string): string {
    const baseClasses = 'bg-current opacity-60';
    const typeClasses = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-telegram-blue'
    };
    return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`;
  }

  getMessageClasses(hasTitle?: string): string {
    const baseClasses = 'text-sm text-gray-700 dark:text-gray-300';
    return hasTitle ? `${baseClasses} mt-1` : baseClasses;
  }

  getIconPath(type: string): string {
    const paths = {
      success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
      error: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z',
      warning: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
      info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
    };
    return paths[type as keyof typeof paths] || paths.info;
  }

  getIconFillRule(type: string): string {
    return type === 'warning' ? 'evenodd' : '';
  }

  getIconClipRule(type: string): string {
    return type === 'warning' ? 'evenodd' : '';
  }

  handleAction(toast: any) {
    if (toast.action?.callback) {
      toast.action.callback();
    }
    this.toastService.removeToast(toast.id);
  }
}
