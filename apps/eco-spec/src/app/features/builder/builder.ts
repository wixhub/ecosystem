import { Component, inject, signal } from '@angular/core';
import { BuilderService } from '../../core/services/builder.service';

@Component({
  imports: [],
  selector: 'app-builder',
  styleUrl: './builder.scss',
  templateUrl: './builder.html',
})
export class Builder {
  protected readonly builderService = inject(BuilderService);

  // Local component signals for form state
  protected readonly samplingFrequency = signal<number>(1);
  protected readonly deploymentDays = signal<number>(30);
  protected readonly packetSizeBytes = signal<number>(128);

  /**
   * Handles sampling frequency input changes and triggers worker calculation
   */
  protected updateFrequency(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);

    if (!isNaN(value)) {
      this.samplingFrequency.set(value);
      this.builderService.calculateConstraints(
        value,
        this.deploymentDays(),
        this.packetSizeBytes(),
      );
    }
  }
}
