import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [disabled]="disabled() || loading()"
      [type]="type()"
      [class]="buttonClasses()"
      (click)="handleClick()"
    >
      @if (loading()) {
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      } @else if (icon()) {
        <svg
          class="w-4 h-4"
          [class.mr-2]="hasContent()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            [attr.d]="getIconPath()"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      }

      <ng-content />

      @if (badge()) {
        <span
          class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full"
        >
          {{ badge() }}
        </span>
      }
    </button>
  `,
  host: {
    '[class]': 'hostClasses()'
  }
})
export class ButtonComponent {
  // Inputs
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input(false);
  loading = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  icon = input<string>();
  badge = input<string | number>();
  fullWidth = input(false);

  // Outputs
  onClick = output<MouseEvent>();

  // Computed properties
  buttonClasses = computed(() => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants = {
      primary: 'bg-telegram-blue hover:bg-telegram-blue-dark active:bg-telegram-blue-dark text-white shadow-sm hover:shadow-md focus:ring-telegram-blue',
      secondary: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:text-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm hover:shadow-md focus:ring-red-500',
      ghost: 'hover:bg-gray-100 active:bg-gray-200 text-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:text-gray-300 focus:ring-gray-500',
      outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 active:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:text-gray-300 focus:ring-gray-500'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12'
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  });

  hostClasses = computed(() => {
    return this.fullWidth() ? 'w-full' : '';
  });

  hasContent = computed(() => {
    // Проверяем есть ли контент в ng-content (приблизительно)
    return true; // В реальном проекте можно использовать ContentChild
  });

  handleClick(event?: MouseEvent) {
    if (!this.disabled() && !this.loading() && event) {
      this.onClick.emit(event);
    }
  }

  getIconPath(): string {
    const icons: Record<string, string> = {
      // Common icons
      'send': 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
      'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      'plus': 'M12 5v14m-7-7h14',
      'edit': 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
      'delete': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      'close': 'M6 18L18 6M6 6l12 12',
      'check': 'M5 13l4 4L19 7',
      'arrow-left': 'M19 12H5m0 0l7 7m-7-7l7-7',
      'arrow-right': 'M5 12h14m0 0l-7-7m7 7l-7 7',
      'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'menu': 'M4 6h16M4 12h16M4 18h16',
      'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'logout': 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    };

    return icons[this.icon() || ''] || '';
  }
}
