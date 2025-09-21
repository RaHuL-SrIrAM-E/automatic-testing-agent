export interface ComponentNode {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  data: ComponentData;
  connections: string[];
  outputs: ComponentOutput[]; // Output variables this component produces
  inputs: ComponentInput[]; // Input variables this component expects
}

export interface ComponentOutput {
  name: string;
  description: string;
  type: 'string' | 'number' | 'object' | 'array';
  source: string; // JSONPath or field name
  example?: any;
}

export interface ComponentInput {
  name: string;
  description: string;
  type: 'string' | 'number' | 'object' | 'array';
  required: boolean;
  defaultValue?: any;
}

export interface ComponentConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromOutput: string; // Output variable name
  toInput: string; // Input variable name
  label?: string;
}

export interface ComponentData {
  [key: string]: any;
}

export type ComponentType = 
  | 'GET_REQUEST'
  | 'POST_REQUEST'
  | 'PUT_REQUEST'
  | 'DELETE_REQUEST'
  | 'BEARER_AUTH'
  | 'BASIC_AUTH'
  | 'API_KEY_AUTH'
  | 'STATUS_ASSERTION'
  | 'JSON_SCHEMA_VALIDATOR'
  | 'FIELD_MATCHER'
  | 'RESPONSE_TIME_CHECK'
  | 'VARIABLE_EXTRACTOR'
  | 'DATA_PROVIDER'
  | 'VARIABLE_SETTER'
  | 'LOOP_ITERATOR'
  | 'CONDITIONAL_BRANCH'
  | 'DELAY_WAIT';

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  description: string;
  category: ComponentCategory;
  icon: string;
  defaultData: ComponentData;
  properties: PropertyDefinition[];
  outputs?: ComponentOutput[];
  inputs?: ComponentInput[];
}

export type ComponentCategory = 
  | 'HTTP_REQUEST'
  | 'AUTHENTICATION'
  | 'VALIDATION'
  | 'DATA_MANAGEMENT'
  | 'CONTROL_FLOW';

export interface PropertyDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean' | 'json' | 'array';
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
  arrayItemSchema?: Record<string, any>;
}

export interface FlowState {
  nodes: ComponentNode[];
  connections: ComponentConnection[];
  selectedNodeId: string | null;
  generatedCode: string;
}

export interface DragItem {
  type: ComponentType;
  componentDefinition: ComponentDefinition;
}
