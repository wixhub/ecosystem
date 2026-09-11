import { computed, Service, signal } from '@angular/core';
import { INITIAL_MOVEBANK_ATTRIBUTES } from '../models/builder.config';
import { MovebankEntity } from '../models/builder.model';

@Service()
export class BuilderService {
  readonly allAttributes = signal(INITIAL_MOVEBANK_ATTRIBUTES);

  readonly steps: MovebankEntity[] = ['study', 'individual', 'tag', 'deployment', 'event'];
  readonly currentStepIndex = signal<number>(0);

  readonly currentEntity = computed(() => this.steps[this.currentStepIndex()]);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);
  readonly isFirstStep = computed(() => this.currentStepIndex() === 0);

  readonly searchQuery = signal<string>('');

  readonly filteredAttributes = computed(() => {
    const entity = this.currentEntity();
    const query = this.searchQuery().toLowerCase();
    return this.allAttributes().filter(
      (attr) =>
        attr.entity === entity &&
        (attr.label.toLowerCase().includes(query) || attr.key.toLowerCase().includes(query)),
    );
  });

  // Validate individual attribute values against rules (min/max)
  readonly attributeErrors = computed(() => {
    const errors: Record<string, string> = {};
    this.allAttributes().forEach((attr) => {
      if (!attr.enabled) return;

      if (attr.type === 'number' || attr.type === 'integer') {
        const num = Number(attr.value);
        if (isNaN(num)) {
          errors[attr.key] = 'Must be a valid number';
        } else if (attr.minimum !== undefined && num < attr.minimum) {
          errors[attr.key] = `Min allowed: ${attr.minimum}`;
        } else if (attr.maximum !== undefined && num > attr.maximum) {
          errors[attr.key] = `Max allowed: ${attr.maximum}`;
        }
      }
    });
    return errors;
  });

  // Check if current step has any validation errors
  readonly isCurrentStepValid = computed(() => {
    const currentKeys = new Set(this.filteredAttributes().map((a) => a.key));
    const errors = this.attributeErrors();
    return !Object.keys(errors).some((key) => currentKeys.has(key));
  });

  readonly totalEnabledCount = computed(() => this.allAttributes().filter((a) => a.enabled).length);

  readonly totalDataVolumeMb = computed(() => this.totalEnabledCount() * 1.5);
  readonly isStorageValid = computed(() => this.totalDataVolumeMb() <= 50);

  readonly nextStep = (): void => {
    if (!this.isLastStep() && this.isCurrentStepValid()) {
      this.currentStepIndex.update((i) => i + 1);
    }
  };

  readonly prevStep = (): void => {
    if (!this.isFirstStep()) {
      this.currentStepIndex.update((i) => i - 1);
    }
  };

  readonly toggleAttribute = (key: string): void => {
    this.allAttributes.update((list) =>
      list.map((attr) => (attr.key === key ? { ...attr, enabled: !attr.enabled } : attr)),
    );
  };

  readonly updateValue = (key: string, val: any): void => {
    this.allAttributes.update((list) =>
      list.map((attr) => (attr.key === key ? { ...attr, value: val } : attr)),
    );
  };

  readonly generateConfigJson = computed(() => {
    const enabledFields = this.allAttributes().filter((a) => a.enabled);
    const configMap: Record<string, any> = {};
    enabledFields.forEach((f) => {
      configMap[f.key] = f.value;
    });
    return JSON.stringify(
      {
        $schema: 'http://eco-spec.maxplanck.de/schema/v1',
        generatedForResearchGroup: 'MPI Animal Behavior',
        timestamp: new Date().toISOString(),
        parameters: configMap,
      },
      null,
      2,
    );
  });

  readonly downloadConfigFile = (): void => {
    if (Object.keys(this.attributeErrors()).length > 0) return;

    const blob = new Blob([this.generateConfigJson()], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movebank-spec-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };
}
