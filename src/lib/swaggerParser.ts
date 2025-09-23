import { ComponentNode, ComponentType } from '../types';

export interface SwaggerPath {
  [method: string]: {
    summary?: string;
    description?: string;
    parameters?: SwaggerParameter[];
    requestBody?: SwaggerRequestBody;
    responses?: SwaggerResponses;
    tags?: string[];
  };
}

export interface SwaggerParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required?: boolean;
  schema?: {
    type?: string;
    format?: string;
    example?: any;
  };
  description?: string;
  example?: any;
}

export interface SwaggerRequestBody {
  content?: {
    [contentType: string]: {
      schema?: {
        type?: string;
        properties?: Record<string, any>;
        example?: any;
      };
    };
  };
  required?: boolean;
  description?: string;
}

export interface SwaggerResponses {
  [statusCode: string]: {
    description?: string;
    content?: {
      [contentType: string]: {
        schema?: {
          type?: string;
          properties?: Record<string, any>;
          example?: any;
        };
      };
    };
  };
}

export interface SwaggerDocument {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: {
    [path: string]: SwaggerPath;
  };
  components?: {
    securitySchemes?: {
      [name: string]: {
        type: string;
        scheme?: string;
        bearerFormat?: string;
        name?: string;
        in?: string;
      };
    };
  };
}

export class SwaggerParser {
  static parseDocument(swaggerJson: string): SwaggerDocument {
    try {
      const document = JSON.parse(swaggerJson);
      return this.validateDocument(document);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid JSON format: ${errorMessage}`);
    }
  }

  static validateDocument(document: any): SwaggerDocument {
    if (!document) {
      throw new Error('Swagger document is empty');
    }

    if (!document.info || !document.info.title) {
      throw new Error('Swagger document must have info.title');
    }

    if (!document.paths || typeof document.paths !== 'object') {
      throw new Error('Swagger document must have paths object');
    }

    return document as SwaggerDocument;
  }

  static convertToKarateNodes(document: SwaggerDocument): ComponentNode[] {
    const nodes: ComponentNode[] = [];
    const baseUrl = this.getBaseUrl(document);
    let nodeIndex = 0;

    // Process each path and method
    Object.entries(document.paths).forEach(([path, pathMethods]) => {
      Object.entries(pathMethods).forEach(([method, operation]) => {
        if (this.isValidHttpMethod(method)) {
          const node = this.createRequestNode(
            operation,
            method.toUpperCase(),
            path,
            baseUrl,
            nodeIndex++
          );
          nodes.push(node);

          // Add status assertion for successful responses
          const statusNode = this.createStatusAssertionNode(operation, nodeIndex++);
          if (statusNode) {
            nodes.push(statusNode);
          }

          // Add schema validation if response schema exists
          const schemaNode = this.createSchemaValidationNode(operation, nodeIndex++);
          if (schemaNode) {
            nodes.push(schemaNode);
          }
        }
      });
    });

    return nodes;
  }

  private static getBaseUrl(document: SwaggerDocument): string {
    if (document.servers && document.servers.length > 0) {
      return document.servers[0].url;
    }
    return 'https://api.example.com';
  }

  private static isValidHttpMethod(method: string): boolean {
    const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
    return validMethods.includes(method.toLowerCase());
  }

  private static createRequestNode(
    operation: any,
    method: string,
    path: string,
    baseUrl: string,
    index: number
  ): ComponentNode {
    const fullUrl = this.buildFullUrl(baseUrl, path);
    const nodeType = this.getComponentType(method);
    
    const node: ComponentNode = {
      id: `swagger-${method.toLowerCase()}-${index}`,
      type: nodeType,
      position: { x: 50 + (index * 250), y: 50 },
      data: {
        url: fullUrl,
        headers: this.buildHeaders(operation),
        timeout: 30000
      },
      connections: [],
      outputs: [],
      inputs: []
    };

    // Add method-specific data
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      node.data.body = this.buildRequestBody(operation);
      node.data.bodyType = 'json';
    }

    if (method === 'GET') {
      node.data.queryParams = this.buildQueryParams(operation);
    }

    return node;
  }

  private static buildFullUrl(baseUrl: string, path: string): string {
    // Replace path parameters with example values
    const processedPath = path.replace(/\{([^}]+)\}/g, (match, paramName) => {
      return `{${paramName}}`; // Keep as placeholder for now
    });
    
    return `${baseUrl}${processedPath}`;
  }

  private static buildHeaders(operation: any): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (operation.parameters) {
      operation.parameters.forEach((param: SwaggerParameter) => {
        if (param.in === 'header' && param.name) {
          headers[param.name] = param.example || 'example-value';
        }
      });
    }

    return headers;
  }

  private static buildQueryParams(operation: any): Record<string, string> {
    const queryParams: Record<string, string> = {};

    if (operation.parameters) {
      operation.parameters.forEach((param: SwaggerParameter) => {
        if (param.in === 'query' && param.name) {
          queryParams[param.name] = param.example || 'example-value';
        }
      });
    }

    return queryParams;
  }

  private static buildRequestBody(operation: any): string {
    if (operation.requestBody?.content) {
      const jsonContent = operation.requestBody.content['application/json'];
      if (jsonContent?.schema) {
        return JSON.stringify(this.generateExampleFromSchema(jsonContent.schema), null, 2);
      }
    }
    return '{}';
  }

  private static generateExampleFromSchema(schema: any): any {
    if (schema.example) {
      return schema.example;
    }

    if (schema.properties) {
      const example: any = {};
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        example[key] = this.generateExampleValue(prop);
      });
      return example;
    }

    return this.generateExampleValue(schema);
  }

  private static generateExampleValue(prop: any): any {
    switch (prop.type) {
      case 'string':
        return prop.example || 'example-string';
      case 'number':
      case 'integer':
        return prop.example || 123;
      case 'boolean':
        return prop.example || true;
      case 'array':
        return prop.example || [];
      case 'object':
        return prop.example || {};
      default:
        return prop.example || null;
    }
  }

  private static createStatusAssertionNode(operation: any, index: number): ComponentNode | null {
    const responses = operation.responses;
    if (!responses) return null;

    // Find a success status code (2xx)
    const successStatus = Object.keys(responses).find(status => 
      status.startsWith('2') && status.length === 3
    );

    if (!successStatus) return null;

    return {
      id: `swagger-status-${index}`,
      type: 'STATUS_ASSERTION',
      position: { x: 300, y: 50 },
      data: {
        expectedStatus: parseInt(successStatus),
        operator: 'equals'
      },
      connections: [],
      outputs: [],
      inputs: []
    };
  }

  private static createSchemaValidationNode(operation: any, index: number): ComponentNode | null {
    const responses = operation.responses;
    if (!responses) return null;

    // Find a success response with schema
    const successResponse = Object.values(responses).find((response: any) => 
      response.content?.['application/json']?.schema
    ) as any;

    if (!successResponse?.content?.['application/json']?.schema) return null;

    const schema = successResponse.content['application/json'].schema;
    
    return {
      id: `swagger-schema-${index}`,
      type: 'SCHEMA_VALIDATION',
      position: { x: 550, y: 50 },
      data: {
        jsonPath: '$.',
        validationType: 'json_schema',
        schema: JSON.stringify(schema, null, 2),
        allowNull: false
      },
      connections: [],
      outputs: [],
      inputs: []
    };
  }

  private static getComponentType(method: string): ComponentType {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'GET_REQUEST';
      case 'POST':
        return 'POST_REQUEST';
      case 'PUT':
        return 'PUT_REQUEST';
      case 'DELETE':
        return 'DELETE_REQUEST';
      default:
        return 'GET_REQUEST';
    }
  }
}
