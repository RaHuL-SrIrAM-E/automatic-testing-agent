export interface ComponentNode {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  data: ComponentData;
  connections: string[];
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
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean' | 'json';
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface FlowState {
  nodes: ComponentNode[];
  selectedNodeId: string | null;
  generatedCode: string;
}

export interface DragItem {
  type: ComponentType;
  componentDefinition: ComponentDefinition;
}
