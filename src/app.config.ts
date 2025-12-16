import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Fix: Replaced deprecated provideExperimentalZonelessChangeDetection with provideZonelessChangeDetection.
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
  ],
};
