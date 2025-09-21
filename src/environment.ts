// Environment configuration using Vite-style approach
// Поддерживает как Vite переменные, так и обычные process.env

interface Environment {
  production: boolean;
  apiUrl: string;
  wsUrl: string;
  appName: string;
  version: string;
  features: {
    enableOfflineMode: boolean;
    enablePushNotifications: boolean;
    enableFileUpload: boolean;
    enableVoiceMessages: boolean;
    maxFileSize: number; // в MB
  };
  websocket: {
    reconnectAttempts: number;
    reconnectDelay: number;
    heartbeatInterval: number;
  };
}

// Функция для получения переменной окружения с fallback
function getEnvVar(key: string, fallback: string): string {
  // Поддержка Vite переменных (VITE_*)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }

  // Fallback для других bundler'ов
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }

  // Если ничего не найдено, возвращаем fallback
  return fallback;
}

export const environment: Environment = {
  production: getEnvVar('NODE_ENV', 'development') === 'production',

  // API endpoints
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:3000/api'),
  wsUrl: getEnvVar('VITE_WS_URL', 'ws://localhost:3000/ws'),

  // App metadata
  appName: 'Mini Telegram',
  version: '1.0.0',

  // Feature flags
  features: {
    enableOfflineMode: getEnvVar('VITE_ENABLE_OFFLINE', 'true') === 'true',
    enablePushNotifications: getEnvVar('VITE_ENABLE_PUSH', 'false') === 'true',
    enableFileUpload: getEnvVar('VITE_ENABLE_FILE_UPLOAD', 'true') === 'true',
    enableVoiceMessages: getEnvVar('VITE_ENABLE_VOICE', 'false') === 'true',
    maxFileSize: parseInt(getEnvVar('VITE_MAX_FILE_SIZE', '10'), 10), // 10MB default
  },

  // WebSocket configuration
  websocket: {
    reconnectAttempts: parseInt(getEnvVar('VITE_WS_RECONNECT_ATTEMPTS', '10'), 10),
    reconnectDelay: parseInt(getEnvVar('VITE_WS_RECONNECT_DELAY', '1000'), 10), // ms
    heartbeatInterval: parseInt(getEnvVar('VITE_WS_HEARTBEAT', '30000'), 10), // 30 seconds
  }
};

// Дополнительные утилиты для работы с environment
export const isDevelopment = !environment.production;
export const isProduction = environment.production;

// Логирование конфигурации в development режиме
if (isDevelopment) {
  console.group('🚀 Environment Configuration');
  console.log('API URL:', environment.apiUrl);
  console.log('WebSocket URL:', environment.wsUrl);
  console.log('Features:', environment.features);
  console.log('WebSocket Config:', environment.websocket);
  console.groupEnd();
}
