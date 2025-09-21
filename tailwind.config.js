/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./src/**/*.component.{html,ts}"
  ],
  darkMode: 'class', // Включаем class-based dark mode
  theme: {
    extend: {
      // 🎨 Telegram цветовая палитра
      colors: {
        telegram: {
          blue: '#0088cc',
          'blue-dark': '#0077b6',
          'blue-light': '#33a3d1',
          dark: '#17212b',
          darker: '#0e1621',
          'dark-surface': '#1e2832',
          'dark-hover': '#2a3441',
        },
        // Дополнительная палитра для UI
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0088cc',
          600: '#0077b6',
          700: '#006bb3',
          800: '#005a9e',
          900: '#004c8c',
        },
        // Состояния сообщений
        message: {
          own: '#0088cc',
          'own-dark': '#006bb3',
          other: '#ffffff',
          'other-dark': '#1e2832',
          system: '#64748b',
        },
        // Статусы онлайн/оффлайн
        status: {
          online: '#10b981',
          offline: '#6b7280',
          away: '#f59e0b',
          busy: '#ef4444',
        },
      },

      // 📏 Типографика
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"Fira Code"',
          '"JetBrains Mono"',
          'Consolas',
          '"Liberation Mono"',
          'Menlo',
          'Courier',
          'monospace',
        ],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },

      // 📐 Spacing для telegram-подобного UI
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
        'chat-sidebar': '320px',
        'message-max': '480px',
      },

      // 🖼 Размеры для различных элементов
      width: {
        'sidebar': '320px',
        'sidebar-collapsed': '60px',
        'message-bubble': '480px',
        'avatar-sm': '32px',
        'avatar-md': '40px',
        'avatar-lg': '48px',
      },

      height: {
        'header': '64px',
        'input-area': '80px',
        'message-min': '40px',
        'avatar-sm': '32px',
        'avatar-md': '40px',
        'avatar-lg': '48px',
      },

      // ⏱ Анимации и переходы
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'typing': 'typing 1.4s infinite ease-in-out',
        'message-in': 'messageIn 0.4s ease-out',
        'toast-in': 'toastIn 0.3s ease-out',
        'modal-in': 'modalIn 0.2s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-4px)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '30%': { transform: 'scale(1.2)', opacity: '1' },
        },
        messageIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(8px) scale(0.98)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        toastIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(100%) scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0) scale(1)',
          },
        },
        modalIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },

      // 🎯 Transitions
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
      },

      // 📱 Breakpoints для responsive design
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Telegram-specific breakpoints
        'mobile': { 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1023px' },
        'desktop': { 'min': '1024px' },
      },

      // 🌫 Box shadows для depth
      boxShadow: {
        'message': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'message-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'toast': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },

      // 📝 Border radius для telegram стиля
      borderRadius: {
        'message': '18px',
        'message-sm': '12px',
        'input': '24px',
        'button': '8px',
      },

      // 🎨 Backdrop blur для модальных окон
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
    },
  },
  plugins: [
    // Typography plugin для красивого текста
    require('@tailwindcss/typography')({
      target: 'modern',
    }),

    // Кастомные утилиты
    function({ addUtilities, addComponents, theme }) {
      // Утилиты для scrollbar
      const scrollbarUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
        },
        '.scrollbar-thumb-telegram': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme('colors.telegram.blue'),
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: theme('colors.telegram.blue-dark'),
            },
          },
        },
      };

      // Компоненты для часто используемых стилей
      const telegramComponents = {
        '.message-bubble-own': {
          backgroundColor: theme('colors.telegram.blue'),
          color: 'white',
          borderRadius: '18px 18px 4px 18px',
          padding: '8px 12px',
          marginLeft: 'auto',
          maxWidth: theme('width.message-bubble'),
        },
        '.message-bubble-other': {
          backgroundColor: theme('colors.white'),
          color: theme('colors.gray.900'),
          borderRadius: '18px 18px 18px 4px',
          padding: '8px 12px',
          marginRight: 'auto',
          maxWidth: theme('width.message-bubble'),
          border: `1px solid ${theme('colors.gray.200')}`,
          '.dark &': {
            backgroundColor: theme('colors.telegram.dark-surface'),
            color: theme('colors.gray.100'),
            borderColor: theme('colors.gray.700'),
          },
        },
        '.typing-dots': {
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          '& > div': {
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: theme('colors.telegram.blue'),
            animation: 'typing 1.4s infinite ease-in-out',
            '&:nth-child(2)': {
              animationDelay: '0.2s',
            },
            '&:nth-child(3)': {
              animationDelay: '0.4s',
            },
          },
        },
        '.glass-effect': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '.dark &': {
            backgroundColor: 'rgba(23, 33, 43, 0.8)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      };

      addUtilities(scrollbarUtilities);
      addComponents(telegramComponents);
    },
  ],
}
