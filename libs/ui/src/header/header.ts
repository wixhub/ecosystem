import { Component, Input } from '@angular/core';

export type HeaderStateService = {
  loadRawFile(file: File): void;
  exportData(format: 'csv' | 'json'): void;
};

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Input() stateService?: HeaderStateService;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.stateService?.loadRawFile(file);
    }
  }
}
