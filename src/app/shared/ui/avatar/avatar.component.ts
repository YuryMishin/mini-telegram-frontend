import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()" [title]="name()">
      @if (src() && !imageError()) {
        <img
          [src]="src()"
          [alt]="name()"
          [class]="imageClasses()"
          (error)="onImageError()"
          loading="lazy"
        />
      } @else {
        <div [class]="initialsClasses()">
          {{ initials() }}
        </div>
      }

      <!-- Online Status Indicator -->
      @if (showStatus()) {
        <div [class]="statusClasses()">
          <div [class]="statusDotClasses()"></div>
        </div>
      }

      <!-- Badge/Notification Count -->
      @if (badge()) {
        <div [class]="badgeClasses()">
          {{ badge() > 99 ? '99+' : badge() }}
        </div>
      }
    </div>
  `
})
export class AvatarComponent {
  // Inputs
  src = input<string>();
  name = input.required<string>();
  size = input<AvatarSize>('md');
  status = input<'online' | 'offline' | 'away' | 'busy'>();
  showStatus = input(false);
  badge = input<number>();
  clickable = input(false);

  protected imageError = signal(false);

  // Computed properties
  initials = computed(() => {
    return this.name()
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  });

  containerClasses = computed(() => {
    const base = 'relative inline-block flex-shrink-0';
    const clickable = this.clickable() ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';

    return `${base} ${clickable}`.trim();
  });

  imageClasses = computed(() => {
    const base = 'object-cover';
    const size = this.getSizeClasses();

    return `${base} ${size}`;
  });

  initialsClasses = computed(() => {
    const base = 'flex items-center justify-center font-semibold text-white select-none';
    const size = this.getSizeClasses();
    const fontSize = this.getFontSizeClasses();
    const background = this.getInitialsBackground();

    return `${base} ${size} ${fontSize} ${background}`;
  });

  statusClasses = computed(() => {
    const positions = {
      xs: 'absolute -bottom-0 -right-0',
      sm: 'absolute -bottom-0 -right-0',
      md: 'absolute -bottom-0.5 -right-0.5',
      lg: 'absolute -bottom-1 -right-1',
      xl: 'absolute -bottom-1 -right-1'
    };

    return `${positions[this.size()]} flex items-center justify-center bg-white dark:bg-gray-900 rounded-full p-0.5`;
  });

  statusDotClasses = computed(() => {
    const base = 'rounded-full border-2 border-white dark:border-gray-900';
    const sizes = {
      xs: 'w-2 h-2',
      sm: 'w-2.5 h-2.5',
      md: 'w-3 h-3',
      lg: 'w-3.5 h-3.5',
      xl: 'w-4 h-4'
    };

    const statusColors = {
      online: 'bg-status-online',
      offline: 'bg-status-offline',
      away: 'bg-status-away',
      busy: 'bg-status-busy'
    };

    const statusColor = this.status() ? statusColors[this.status()!] : statusColors.offline;

    return `${base} ${sizes[this.size()]} ${statusColor}`;
  });

  badgeClasses = computed(() => {
    const positions = {
      xs: 'absolute -top-1 -right-1',
      sm: 'absolute -top-1 -right-1',
      md: 'absolute -top-1 -right-1',
      lg: 'absolute -top-2 -right-2',
      xl: 'absolute -top-2 -right-2'
    };

    const sizes = {
      xs: 'min-w-[16px] h-4 text-xs px-1',
      sm: 'min-w-[16px] h-4 text-xs px-1',
      md: 'min-w-[18px] h-[18px] text-xs px-1.5',
      lg: 'min-w-[20px] h-5 text-sm px-2',
      xl: 'min-w-[22px] h-[22px] text-sm px-2'
    };

    return `${positions[this.size()]} ${sizes[this.size()]} inline-flex items-center justify-center font-bold text-white bg-red-500 rounded-full leading-none`;
  });

  private getSizeClasses(): string {
    const sizes = {
      xs: 'w-6 h-6 rounded-full',
      sm: 'w-8 h-8 rounded-full',
      md: 'w-10 h-10 rounded-full',
      lg: 'w-12 h-12 rounded-full',
      xl: 'w-16 h-16 rounded-full'
    };

    return sizes[this.size()];
  }

  private getFontSizeClasses(): string {
    const fontSizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };

    return fontSizes[this.size()];
  }

  private getInitialsBackground(): string {
    // Генерируем цвет на основе имени для консистентности
    const colors = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-teal-500',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
      'bg-gradient-to-br from-red-500 to-pink-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
      'bg-gradient-to-br from-cyan-500 to-blue-500',
      'bg-gradient-to-br from-teal-500 to-green-500'
    ];

    // Простой хеш для выбора цвета
    const hash = this.name().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  onImageError() {
    this.imageError.set(true);
  }
}
