import { Service, signal } from '@angular/core';

@Service()
export class BuilderService {
  private worker: Worker | null = null;

  readonly totalDataVolumeMb = signal<number>(0);
  readonly isStorageValid = signal<boolean>(true);

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./builder.worker.ts', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        this.totalDataVolumeMb.set(data.totalDataVolumeMb);
        this.isStorageValid.set(data.isStorageValid);
      };
    }
  }

  public calculateConstraints(
    samplingFrequency: number,
    deploymentDays: number,
    packetSize: number,
  ): void {
    if (this.worker) {
      this.worker.postMessage({ samplingFrequency, deploymentDays, packetSize });
    }
  }
}
