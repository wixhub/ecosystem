import { InjectionToken } from '@angular/core';

// Tell TypeScript that carto.config is optional and might not exist initially
// @ts-ignore
import * as cartoConfig from './carto.config';

const localCartoApiKey = (cartoConfig as any)?.CARTO_API_KEY || '';

export const CARTO_CONFIG = new InjectionToken<string>('CARTO_CONFIG');
export const CARTO_API_KEY = localCartoApiKey;

export function provideCartoConfig(apiKey: string = localCartoApiKey) {
  return {
    provide: CARTO_CONFIG,
    useValue: apiKey,
  };
}
