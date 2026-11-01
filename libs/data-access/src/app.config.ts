import { InjectionToken, Provider } from '@angular/core';

export interface AppConfig {
  readonly production: boolean;
  readonly apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export function provideAppConfig(config: AppConfig): Provider {
  return {
    provide: APP_CONFIG,
    useValue: config,
  };
}
