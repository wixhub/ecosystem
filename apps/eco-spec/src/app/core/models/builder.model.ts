export type MovebankEntity = 'study' | 'individual' | 'tag' | 'deployment' | 'event';
export type ControlType = 'text' | 'number' | 'integer' | 'boolean' | 'select' | 'date';

export interface MovebankAttribute {
  key: string;
  entity: MovebankEntity;
  group: string;
  label: string;
  type: ControlType;
  value: any;
  enabled: boolean;
  minimum?: number;
  maximum?: number;
  enum?: string[];
  description?: string;
}
