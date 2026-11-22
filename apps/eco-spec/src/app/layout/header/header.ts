import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { BuilderService } from '@es/data-access';

@Component({
  imports: [UpperCasePipe],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  readonly builderService = inject(BuilderService);
}
