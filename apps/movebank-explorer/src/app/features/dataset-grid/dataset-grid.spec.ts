import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatasetGrid } from './dataset-grid';
import { Dataset } from '@es/data-access';

describe('DatasetGrid', () => {
  let component: DatasetGrid;
  let fixture: ComponentFixture<DatasetGrid>;

  const mockDatasets: Dataset[] = [
    {
      id: '1',
      title: 'Movebank Animal Tracking Study 1',
      doi: '10.5441/001/1.234',
      abstract: 'Sample abstract for animal tracking data.',
      authors: ['Jane Doe', 'John Smith'],
      discipline: 'Ecology',
      format: 'CSV',
      fileSize: '15 MB',
      publicationDate: '2026-01-15',
      license: 'CC-BY',
      tags: ['birds', 'GPS'],
      downloadsCount: 42,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetGrid);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('datasets', mockDatasets);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should correctly receive datasets via signal input', () => {
    fixture.componentRef.setInput('datasets', mockDatasets);
    fixture.detectChanges();

    expect(component.datasets()).toEqual(mockDatasets);
    expect(component.datasets().length).toBe(1);
    expect(component.datasets()[0].title).toBe('Movebank Animal Tracking Study 1');
  });
});
