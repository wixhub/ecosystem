import { Component, input } from '@angular/core';

export interface HeaderStateService {
  loadRawFile(file: File): void;
  exportData(format: 'csv' | 'json'): void;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  // Modern signal-based input (optional service)
  readonly stateService = input<HeaderStateService>();

  /**
   * Handles the file selection event and passes the file to the state service.
   */
  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      this.stateService()?.loadRawFile(file);
    }
  }
}
