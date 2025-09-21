import { bootstrapApplication } from '@angular/platform-browser';
import { MainLayoutComponent } from './app/layout/main-layout.component';
import { appConfig } from './app/app.config';

bootstrapApplication(MainLayoutComponent, appConfig)
  .catch(err => console.error('Application bootstrap failed:', err));
