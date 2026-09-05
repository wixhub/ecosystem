import { Component, inject } from '@angular/core';
import { BuilderService } from '../../core/services/builder.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  imports: [UpperCasePipe],
  selector: 'app-builder',
  styleUrl: './builder.scss',
  templateUrl: './builder.html',
})
export class Builder {
  readonly builderService = inject(BuilderService);

  updateField(key: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;

    this.builderService.updateValue(key, value);
  }
}
