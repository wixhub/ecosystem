import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MetadataApiService } from '@es/data-access';

@Component({
  selector: 'app-dataset-explorer',
  imports: [RouterLink],
  templateUrl: './dataset-explorer.html',
  styleUrl: './dataset-explorer.scss',
})
export class DatasetExplorer {
  private api = inject(MetadataApiService);

  // Bound directly to the service's httpResource value
  datasets = this.api.datasetsResource.value;
}
