import { Component, input, output, model, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type InputType = 'text' | 'password' | 'email' | 'search' | 'tel' | 'url' | 'number';
export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="containerClasses()">
      @if (label()) {
        <label [for]="inputId()" [class]="labelClasses()">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500 ml-1">*</span>
          }
        </label>
      }

      <div [class]="inputWrapperClasses()">
        <!-- Leading Icon -->
        @if (leadingIcon()) {
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              class="w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                [attr.d]="getIconPath(leadingIcon()!)"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </div>
        }

        <!-- Input Element -->
        <input
          #inputElement
          [id]="inputId()"
          [type]="currentType()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [required]="required()"
          [min]="min()"
          [max]="max()"
          [maxlength]="maxlength()"
          [autocomplete]="autocomplete()"
          [(ngModel)]="value"
          [class]="inputClasses()"
          (blur)="onBlur.emit($event)"
          (focus)="onFocus.emit($event)"
          (keydown.enter)="onEnter.emit($event)"
          (input)="onInputChange.emit($event)"
          [attr.aria-describedby]="getAriaDescribedBy()"
          [attr.aria-invalid]="hasError()"
        />

        <!-- Trailing Actions -->
        <div class="absolute inset-y-0 right-0 flex items-center">
          <!-- Clear Button -->
          @if (clearable() && value() && !disabled() && !readonly()) {
            <button
              type="button"
              (click)="clearValue()"
              class="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              [attr.aria-label]="'Clear ' + (label() || 'input')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              </svg>
            </button>
          }

          <!-- Password Toggle -->
          @if (type() === 'password') {
            <button
              type="button"
              (click)="togglePasswordVisibility()"
              class="p-1 mr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
            >
              @if (showPassword()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2"/>
                  <path
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                </svg>
              }
            </button>
          }

          <!-- Trailing Icon -->
          @if (trailingIcon()) {
            <div class="flex items-center pr-3 pointer-events-none">
              <svg
                class="w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  [attr.d]="getIconPath(trailingIcon()!)"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
          }
        </div>
      </div>

      <!-- Character Count -->
      @if (maxlength() && showCharCount()) {
        <div class="mt-1 text-right">
          <span
            class="text-sm"
            [class.text-gray-500]="value().length <= maxlength()! * 0.8"
            [class.text-yellow-600]="value().length > maxlength()! * 0.8 && value().length < maxlength()!"
            [class.text-red-600]="value().length >= maxlength()!"
          >
            {{ value().length }}/{{ maxlength() }}
          </span>
        </div>
      }

      <!-- Help Text -->
      @if (helpText() && !hasError()) {
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400" [id]="helpId()">
          {{ helpText() }}
        </p>
      }

      <!-- Error Message -->
      @if (hasError()) {
        <p class="mt-1 text-sm text-red-600 dark:text-red-400" [id]="errorId()" role="alert">
          {{ error() }}
        </p>
      }
    </div>
  `
})
export class InputComponent {
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  // Inputs
  label = input<string>();
  type = input<InputType>('text');
  size = input<InputSize>('md');
  placeholder = input<string>();
  disabled = input(false);
  readonly = input(false);
  required = input(false);
  clearable = input(false);
  leadingIcon = input<string>();
  trailingIcon = input<string>();
  error = input<string>();
  helpText = input<string>();
  min = input<string | number>();
  max = input<string | number>();
  maxlength = input<number>(100);
  autocomplete = input<string>();
  showCharCount = input(false);

  // Model
  value = model<string>('');

  // Outputs
  onFocus = output<FocusEvent>();
  onBlur = output<FocusEvent>();
  onEnter = output<KeyboardEvent>();
  onInputChange = output<Event>();

  // Internal state
  protected showPassword = signal(false);
  protected inputId = signal(this.generateId());

  // Computed properties
  currentType = computed(() => {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  });

  hasError = computed(() => !!this.error());

  containerClasses = computed(() => 'w-full');

  labelClasses = computed(() =>
    'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
  );

  inputWrapperClasses = computed(() => 'relative');

  inputClasses = computed(() => {
    const base = 'block w-full rounded-lg border-0 py-1.5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-sm ring-1 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 readonly:bg-gray-50 dark:readonly:bg-gray-900';

    const paddingClasses = this.getPaddingClasses();
    const stateClasses = this.getStateClasses();
    const sizeClasses = this.getSizeClasses();

    return `${base} ${paddingClasses} ${stateClasses} ${sizeClasses}`;
  });

  private getPaddingClasses(): string {
    const hasLeading = !!this.leadingIcon();
    const hasTrailing = !!this.trailingIcon() || this.type() === 'password' || (this.clearable() && this.value());

    if (hasLeading && hasTrailing) return 'pl-10 pr-12';
    if (hasLeading) return 'pl-10 pr-3';
    if (hasTrailing) return 'pl-3 pr-12';
    return 'px-3';
  }

  private getStateClasses(): string {
    if (this.hasError()) {
      return 'ring-red-300 dark:ring-red-600 focus:ring-red-500';
    }
    return 'ring-gray-300 dark:ring-gray-600 focus:ring-telegram-blue';
  }

  private getSizeClasses(): string {
    const sizes = {
      sm: 'py-1.5 text-sm',
      md: 'py-2 text-sm',
      lg: 'py-2.5 text-base'
    };
    return sizes[this.size()];
  }

  protected helpId = computed(() => `${this.inputId()}-help`);
  protected errorId = computed(() => `${this.inputId()}-error`);

  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.helpText()) ids.push(this.helpId());
    if (this.hasError()) ids.push(this.errorId());
    return ids.length > 0 ? ids.join(' ') : null;
  }

  togglePasswordVisibility() {
    this.showPassword.update(current => !current);
  }

  clearValue() {
    this.value.set('');
    this.inputElement?.nativeElement.focus();
  }

  onInput(event: Event) {
    this.onInputChange.emit(event);
  }

  focus() {
    this.inputElement?.nativeElement.focus();
  }

  getIconPath(iconName: string): string {
    const icons: Record<string, string> = {
      'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'lock': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      'mail': 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      'phone': 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      'globe': 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
    };

    return icons[iconName] || '';
  }

  private generateId(): string {
    return `input-${Math.random().toString(36).substr(2, 9)}`;
  }
}
