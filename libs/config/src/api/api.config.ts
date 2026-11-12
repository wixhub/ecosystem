import { InjectionToken } from '@angular/core';

export interface AppConfig {
  readonly production: boolean;
  readonly apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const defaultDevConfig: AppConfig = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
};

export const defaultProdConfig: AppConfig = {
  production: true,
  apiUrl: 'https://metadata-harvester-backend.onrender.com/api/v1',
};
