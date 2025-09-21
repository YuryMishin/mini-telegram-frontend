import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  // 🏠 Root redirect
  {
    path: '',
    redirectTo: '/dialogs',
    pathMatch: 'full'
  },

  // 🔐 Authentication routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Sign In - Mini Telegram'
  },

  // 💬 Main application routes (protected)
  {
    path: 'dialogs',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dialogs/dialogs.component')
      .then(m => m.DialogsComponent),
    title: 'Chats - Mini Telegram'
  },

  // 🗨 Individual chat route
  {
    path: 'chat/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/chat/chat.component')
      .then(m => m.ChatComponent),
    title: 'Chat - Mini Telegram'
  },

  // 👤 User profile (future feature)
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent),
    title: 'Profile - Mini Telegram'
  },

  // ⚙️ Settings (future feature)
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings.component')
      .then(m => m.SettingsComponent),
    title: 'Settings - Mini Telegram'
  },

  // 🔍 Search results
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./features/search/search.component')
      .then(m => m.SearchComponent),
    title: 'Search - Mini Telegram'
  },

  // 📄 Static pages
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component')
      .then(m => m.AboutComponent),
    title: 'About - Mini Telegram'
  },

  {
    path: 'privacy',
    loadComponent: () => import('./features/privacy/privacy.component')
      .then(m => m.PrivacyComponent),
    title: 'Privacy Policy - Mini Telegram'
  },

  // 🚫 404 Not Found
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: 'Page Not Found - Mini Telegram'
  },

  // Wildcard route - должен быть последним
  {
    path: '**',
    redirectTo: '/404'
  }
];
