import { ComponentDefinition } from '../types';

export const componentDefinitions: ComponentDefinition[] = [
  // HTTP Request Components
  {
    type: 'GET_REQUEST',
    name: 'GET Request',
    description: 'Make a GET HTTP request',
    category: 'HTTP_REQUEST',
    icon: '🌐',
    defaultData: {
      url: '',
      headers: {},
      queryParams: {},
      timeout: 30000
    },
    properties: [
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com/users',
        description: 'The endpoint URL to make the GET request to'
      },
      {
        key: 'headers',
        label: 'Headers',
        type: 'json',
        required: false,
        placeholder: '{"Content-Type": "application/json"}',
        description: 'HTTP headers to include with the request'
      },
      {
        key: 'queryParams',
        label: 'Query Parameters',
        type: 'json',
        required: false,
        placeholder: '{"page": 1, "limit": 10}',
        description: 'Query parameters to append to the URL'
      },
      {
        key: 'timeout',
        label: 'Timeout (ms)',
        type: 'number',
        required: false,
        placeholder: '30000',
        description: 'Request timeout in milliseconds'
      }
    ],
    outputs: [
      {
        name: 'response',
        description: 'Full HTTP response',
        type: 'object',
        source: 'response',
        example: { status: 200, data: {} }
      },
      {
        name: 'status',
        description: 'HTTP status code',
        type: 'number',
        source: 'response.status',
        example: 200
      },
      {
        name: 'body',
        description: 'Response body',
        type: 'object',
        source: 'response.body',
        example: {}
      }
    ],
    inputs: [
      {
        name: 'url',
        description: 'Request URL (can use variables)',
        type: 'string',
        required: true
      },
      {
        name: 'headers',
        description: 'Request headers (can use variables)',
        type: 'object',
        required: false
      },
      {
        name: 'queryParams',
        description: 'Query parameters (can use variables)',
        type: 'object',
        required: false
      }
    ]
  },
  {
    type: 'POST_REQUEST',
    name: 'POST Request',
    description: 'Make a POST HTTP request',
    category: 'HTTP_REQUEST',
    icon: '📤',
    defaultData: {
      url: '',
      headers: {},
      body: '',
      bodyType: 'json'
    },
    properties: [
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com/users',
        description: 'The endpoint URL to make the POST request to'
      },
      {
        key: 'headers',
        label: 'Headers',
        type: 'json',
        required: false,
        placeholder: '{"Content-Type": "application/json"}',
        description: 'HTTP headers to include with the request'
      },
      {
        key: 'bodyType',
        label: 'Body Type',
        type: 'select',
        required: true,
        options: ['json', 'form', 'text', 'xml'],
        description: 'The type of request body'
      },
      {
        key: 'body',
        label: 'Request Body',
        type: 'textarea',
        required: false,
        placeholder: '{"name": "John Doe", "email": "john@example.com"}',
        description: 'The request body content'
      }
    ],
    outputs: [
      {
        name: 'response',
        description: 'Full HTTP response',
        type: 'object',
        source: 'response',
        example: { status: 201, data: {} }
      },
      {
        name: 'status',
        description: 'HTTP status code',
        type: 'number',
        source: 'response.status',
        example: 201
      },
      {
        name: 'body',
        description: 'Response body',
        type: 'object',
        source: 'response.body',
        example: { id: 123, name: 'John' }
      },
      {
        name: 'id',
        description: 'Created resource ID (common pattern)',
        type: 'string',
        source: 'response.body.id',
        example: '123'
      }
    ],
    inputs: [
      {
        name: 'url',
        description: 'Request URL (can use variables)',
        type: 'string',
        required: true
      },
      {
        name: 'headers',
        description: 'Request headers (can use variables)',
        type: 'object',
        required: false
      },
      {
        name: 'body',
        description: 'Request body (can use variables)',
        type: 'string',
        required: false
      }
    ]
  },
  {
    type: 'PUT_REQUEST',
    name: 'PUT Request',
    description: 'Make a PUT HTTP request',
    category: 'HTTP_REQUEST',
    icon: '🔄',
    defaultData: {
      url: '',
      headers: {},
      body: '',
      bodyType: 'json'
    },
    properties: [
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com/users/1',
        description: 'The endpoint URL to make the PUT request to'
      },
      {
        key: 'headers',
        label: 'Headers',
        type: 'json',
        required: false,
        placeholder: '{"Content-Type": "application/json"}',
        description: 'HTTP headers to include with the request'
      },
      {
        key: 'bodyType',
        label: 'Body Type',
        type: 'select',
        required: true,
        options: ['json', 'form', 'text', 'xml'],
        description: 'The type of request body'
      },
      {
        key: 'body',
        label: 'Request Body',
        type: 'textarea',
        required: false,
        placeholder: '{"name": "John Doe", "email": "john@example.com"}',
        description: 'The request body content'
      }
    ]
  },
  {
    type: 'DELETE_REQUEST',
    name: 'DELETE Request',
    description: 'Make a DELETE HTTP request',
    category: 'HTTP_REQUEST',
    icon: '🗑️',
    defaultData: {
      url: '',
      headers: {}
    },
    properties: [
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com/users/1',
        description: 'The endpoint URL to make the DELETE request to'
      },
      {
        key: 'headers',
        label: 'Headers',
        type: 'json',
        required: false,
        placeholder: '{"Authorization": "Bearer token"}',
        description: 'HTTP headers to include with the request'
      }
    ]
  },
  
  // Authentication Components
  {
    type: 'BEARER_AUTH',
    name: 'Bearer Token',
    description: 'Add Bearer token authentication',
    category: 'AUTHENTICATION',
    icon: '🔑',
    defaultData: {
      token: '',
      headerName: 'Authorization'
    },
    properties: [
      {
        key: 'token',
        label: 'Token',
        type: 'text',
        required: true,
        placeholder: 'your-bearer-token-here',
        description: 'The Bearer token value'
      },
      {
        key: 'headerName',
        label: 'Header Name',
        type: 'text',
        required: false,
        placeholder: 'Authorization',
        description: 'The header name to use (default: Authorization)'
      }
    ]
  },
  {
    type: 'BASIC_AUTH',
    name: 'Basic Auth',
    description: 'Add Basic authentication',
    category: 'AUTHENTICATION',
    icon: '👤',
    defaultData: {
      username: '',
      password: ''
    },
    properties: [
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'username',
        description: 'The username for basic authentication'
      },
      {
        key: 'password',
        label: 'Password',
        type: 'text',
        required: true,
        placeholder: 'password',
        description: 'The password for basic authentication'
      }
    ]
  },
  {
    type: 'API_KEY_AUTH',
    name: 'API Key',
    description: 'Add API key authentication',
    category: 'AUTHENTICATION',
    icon: '🔐',
    defaultData: {
      key: '',
      value: '',
      location: 'header'
    },
    properties: [
      {
        key: 'key',
        label: 'Key Name',
        type: 'text',
        required: true,
        placeholder: 'X-API-Key',
        description: 'The API key name'
      },
      {
        key: 'value',
        label: 'Key Value',
        type: 'text',
        required: true,
        placeholder: 'your-api-key-here',
        description: 'The API key value'
      },
      {
        key: 'location',
        label: 'Location',
        type: 'select',
        required: true,
        options: ['header', 'query'],
        description: 'Where to place the API key'
      }
    ]
  },
  
  // Validation Components
  {
    type: 'STATUS_ASSERTION',
    name: 'Status Check',
    description: 'Assert HTTP status code',
    category: 'VALIDATION',
    icon: '✅',
    defaultData: {
      expectedStatus: 200,
      operator: 'equals'
    },
    properties: [
      {
        key: 'expectedStatus',
        label: 'Expected Status',
        type: 'number',
        required: true,
        placeholder: '200',
        description: 'The expected HTTP status code'
      },
      {
        key: 'operator',
        label: 'Operator',
        type: 'select',
        required: true,
        options: ['equals', 'not_equals', 'greater_than', 'less_than'],
        description: 'The comparison operator'
      }
    ]
  },
  {
    type: 'FIELD_MATCHER',
    name: 'Field Matcher',
    description: 'Assert specific JSON field values',
    category: 'VALIDATION',
    icon: '🎯',
    defaultData: {
      jsonPath: '',
      expectedValue: '',
      operator: 'equals'
    },
    properties: [
      {
        key: 'jsonPath',
        label: 'JSON Path',
        type: 'text',
        required: true,
        placeholder: '$.data.name',
        description: 'JSONPath expression to the field'
      },
      {
        key: 'expectedValue',
        label: 'Expected Value',
        type: 'text',
        required: true,
        placeholder: 'John Doe',
        description: 'The expected value'
      },
      {
        key: 'operator',
        label: 'Operator',
        type: 'select',
        required: true,
        options: ['equals', 'not_equals', 'contains', 'matches', 'exists'],
        description: 'The comparison operator'
      }
    ]
  },
  {
    type: 'RESPONSE_TIME_CHECK',
    name: 'Response Time',
    description: 'Check response time limits',
    category: 'VALIDATION',
    icon: '⏱️',
    defaultData: {
      maxTime: 1000,
      operator: 'less_than'
    },
    properties: [
      {
        key: 'maxTime',
        label: 'Max Time (ms)',
        type: 'number',
        required: true,
        placeholder: '1000',
        description: 'Maximum allowed response time in milliseconds'
      },
      {
        key: 'operator',
        label: 'Operator',
        type: 'select',
        required: true,
        options: ['less_than', 'less_than_or_equal', 'greater_than', 'greater_than_or_equal'],
        description: 'The comparison operator'
      }
    ]
  },
  
  // Data Management Components
  {
    type: 'VARIABLE_EXTRACTOR',
    name: 'Extract Variables',
    description: 'Extract multiple values from response',
    category: 'DATA_MANAGEMENT',
    icon: '📤',
    defaultData: {
      extractions: [
        {
          variableName: '',
          jsonPath: '',
          defaultValue: ''
        }
      ]
    },
    properties: [
      {
        key: 'extractions',
        label: 'Variable Extractions',
        type: 'array',
        required: true,
        description: 'List of variables to extract from the response',
        arrayItemSchema: {
          variableName: {
            type: 'text',
            label: 'Variable Name',
            required: true,
            placeholder: 'userId',
            description: 'Name of the variable to store the extracted value'
          },
          jsonPath: {
            type: 'text',
            label: 'JSON Path',
            required: true,
            placeholder: '$.data.id',
            description: 'JSONPath expression to extract the value'
          },
          defaultValue: {
            type: 'text',
            label: 'Default Value',
            required: false,
            placeholder: 'default-value',
            description: 'Default value if extraction fails'
          }
        }
      }
    ],
    outputs: [
      {
        name: 'extractedVariables',
        description: 'All extracted variables as an object',
        type: 'object',
        source: 'extractedVariables',
        example: { userId: '123', userName: 'John', userEmail: 'john@example.com' }
      }
    ],
    inputs: [
      {
        name: 'response',
        description: 'Response data to extract from',
        type: 'object',
        required: true
      }
    ]
  },
  {
    type: 'VARIABLE_SETTER',
    name: 'Set Variables',
    description: 'Set multiple static variable values',
    category: 'DATA_MANAGEMENT',
    icon: '📝',
    defaultData: {
      variables: [
        {
          variableName: '',
          value: ''
        }
      ]
    },
    properties: [
      {
        key: 'variables',
        label: 'Variable Settings',
        type: 'array',
        required: true,
        description: 'List of variables to set with their values',
        arrayItemSchema: {
          variableName: {
            type: 'text',
            label: 'Variable Name',
            required: true,
            placeholder: 'baseUrl',
            description: 'Name of the variable to set'
          },
          value: {
            type: 'text',
            label: 'Value',
            required: true,
            placeholder: 'https://api.example.com',
            description: 'The value to assign to the variable'
          }
        }
      }
    ],
    outputs: [
      {
        name: 'setVariables',
        description: 'All set variables as an object',
        type: 'object',
        source: 'setVariables',
        example: { baseUrl: 'https://api.example.com', apiVersion: 'v1', timeout: '30000' }
      }
    ],
    inputs: []
  }
];

export const getComponentDefinition = (type: string): ComponentDefinition | undefined => {
  return componentDefinitions.find(def => def.type === type);
};

export const getComponentsByCategory = (category: string) => {
  return componentDefinitions.filter(def => def.category === category);
};
