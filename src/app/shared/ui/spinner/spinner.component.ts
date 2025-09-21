import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'white';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()">
      @switch (type()) {
        @case ('dots') {
          <div class="flex items-center space-x-1">
            @for (dot of [0,1,2]; track dot) {
              <div
                [class]="dotClasses()"
                [style.animation-delay]="dot * 0.15 + 's'"
              ></div>
            }
          </div>
        }
        @case ('pulse') {
          <div [class]="pulseClasses()"></div>
        }
        @default {
          <svg
            [class]="spinnerClasses()"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="status"
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
        }
      }

      @if (text()) {
        <span [class]="textClasses()">{{ text() }}</span>
      }
    </div>
  `
})
export class SpinnerComponent {
  // Inputs
  size = input<SpinnerSize>('md');
  variant = input<SpinnerVariant>('default');
  type = input<'default' | 'dots' | 'pulse'>('default');
  text = input<string>();
  centered = input(false);
  inline = input(false);

  // Computed properties
  containerClasses = computed(() => {
    const base = this.inline() ? 'inline-flex' : 'flex';
    const alignment = this.centered() ? 'justify-center items-center' : 'items-center';
    const spacing = this.text() ? 'space-x-2' : '';

    return `${base} ${alignment} ${spacing}`;
  });

  spinnerClasses = computed(() => {
    const base = 'animate-spin';
    const size = this.getSizeClasses();
    const color = this.getColorClasses();

    return `${base} ${size} ${color}`;
  });

  dotClasses = computed(() => {
    const base = 'rounded-full animate-bounce';
    const size = this.getDotSizeClasses();
    const color = this.getDotColorClasses();

    return `${base} ${size} ${color}`;
  });

  pulseClasses = computed(() => {
    const base = 'rounded-full animate-pulse';
    const size = this.getPulseSizeClasses();
    const color = this.getDotColorClasses();

    return `${base} ${size} ${color}`;
  });

  textClasses = computed(() => {
    const base = 'font-medium';
    const size = this.getTextSizeClasses();
    const color = this.getTextColorClasses();

    return `${base} ${size} ${color}`;
  });

  private getSizeClasses(): string {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };
    return sizes[this.size()];
  }

  private getDotSizeClasses(): string {
    const sizes = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
      xl: 'w-3 h-3'
    };
    return sizes[this.size()];
  }

  private getPulseSizeClasses(): string {
    const sizes = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20'
    };
    return sizes[this.size()];
  }

  private getColorClasses(): string {
    const colors = {
      default: 'text-gray-600 dark:text-gray-400',
      primary: 'text-telegram-blue',
      white: 'text-white'
    };
    return colors[this.variant()];
  }

  private getDotColorClasses(): string {
    const colors = {
      default: 'bg-gray-600 dark:bg-gray-400',
      primary: 'bg-telegram-blue',
      white: 'bg-white'
    };
    return colors[this.variant()];
  }

  private getTextSizeClasses(): string {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };
    return sizes[this.size()];
  }

  private getTextColorClasses(): string {
    const colors = {
      default: 'text-gray-700 dark:text-gray-300',
      primary: 'text-telegram-blue',
      white: 'text-white'
    };
    return colors[this.variant()];
  }
}
