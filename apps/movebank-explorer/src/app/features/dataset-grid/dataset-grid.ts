import { Component, input } from '@angular/core';
import { Dataset } from '@es/data-access';

@Component({
  selector: 'app-dataset-grid',
  styleUrl: './dataset-grid.scss',
  templateUrl: './dataset-grid.html',
})
export class DatasetGrid {
  // Receive datasets list using signal input with shared interface
  datasets = input.required<Dataset[]>();
}
