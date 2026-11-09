import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  aiPrompt = input.required<string>();
  entityType = input.required<string>();
  studyId = input.required<string>();
  activeSource = input.required<'live' | 'mock'>();
  datasetsCount = input.required<number>();

  // Outputs for parent communication
  aiPromptChange = output<string>();
  entityTypeChange = output<string>();
  studyIdChange = output<string>();

  aiSearch = output<void>();
  loadLive = output<void>();
  loadMock = output<void>();
  reset = output<void>();

  // Update AI query signal value on input event
  onAiInput(event: Event): void {
    this.aiPromptChange.emit((event.target as HTMLInputElement).value);
  }

  // Update entity type selection
  onEntityChange(event: Event): void {
    this.entityTypeChange.emit((event.target as HTMLSelectElement).value);
  }

  // Update study ID filter value
  onStudyIdInput(event: Event): void {
    this.studyIdChange.emit((event.target as HTMLInputElement).value);
  }
}
