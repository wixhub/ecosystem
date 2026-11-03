export * from './api.config';

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { APP_CONFIG, AppConfig } from './api.config';

export function provideAppConfig(config: AppConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_CONFIG,
      useValue: config,
    },
  ]);
}
