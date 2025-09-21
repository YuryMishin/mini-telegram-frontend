import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './shared/data-access/http-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ⚡ Zoneless Change Detection - главная фича Angular 20
    provideZonelessChangeDetection(),

    // 🛣 Router с оптимизациями
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      }),
      // withHashLocation() // Раскомментировать если нужен hash routing
    ),

    // 🌐 HTTP Client с современным fetch API и интерцепторами
    provideHttpClient(
      withFetch(), // Использует fetch вместо XMLHttpRequest
      withInterceptors([authInterceptor])
    ),

    // 🎨 Анимации (async loading для оптимизации)
    provideAnimationsAsync()
  ]
};
