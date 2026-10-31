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

export const defaultDevConfig = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
};

export const defaultProdConfig = {
  production: true,
  apiUrl: 'https://metadata-harvester-backend.onrender.com/api/v1',
};
