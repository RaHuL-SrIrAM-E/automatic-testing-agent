import { ComponentNode, ComponentType } from '../types';

export interface PostmanRequest {
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: {
    mode: string;
    raw?: string;
    formdata?: Array<{ key: string; value: string; type: string }>;
    urlencoded?: Array<{ key: string; value: string }>;
  };
  auth?: {
    type: string;
    bearer?: Array<{ key: string; value: string }>;
    basic?: Array<{ key: string; value: string }>;
    apikey?: Array<{ key: string; value: string }>;
  };
  queryParams?: Array<{ key: string; value: string }>;
}

export interface PostmanCollection {
  info: {
    name: string;
    description?: string;
  };
  item: PostmanItem[];
  variable?: Array<{ key: string; value: string }>;
}

export interface PostmanItem {
  name: string;
  request?: PostmanRequest;
  item?: PostmanItem[]; // For folders
  description?: string;
}

export class PostmanParser {
  static parseCollection(collectionJson: string): PostmanCollection {
    try {
      const collection = JSON.parse(collectionJson);
      return this.validateCollection(collection);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid JSON format: ${errorMessage}`);
    }
  }

  static validateCollection(collection: any): PostmanCollection {
    if (!collection || typeof collection !== 'object') {
      throw new Error('Invalid collection format');
    }

    if (!collection.info || !collection.info.name) {
      throw new Error('Collection must have a name');
    }

    if (!collection.item || !Array.isArray(collection.item)) {
      throw new Error('Collection must have items');
    }

    return collection as PostmanCollection;
  }

  static extractRequests(collection: PostmanCollection): PostmanRequest[] {
    const requests: PostmanRequest[] = [];
    
    const processItems = (items: PostmanItem[], parentName = '') => {
      items.forEach(item => {
        if (item.request) {
          // Process the request
          const request = this.processRequest(item.request, item.name);
          requests.push(request);
        } else if (item.item) {
          // Process nested folder
          const folderName = parentName ? `${parentName}/${item.name}` : item.name;
          processItems(item.item, folderName);
        }
      });
    };

    processItems(collection.item);
    return requests;
  }

  private static processRequest(request: any, name: string): PostmanRequest {
    const processedRequest: PostmanRequest = {
      name: name || 'Unnamed Request',
      method: (request.method || 'GET').toUpperCase(),
      url: this.processUrl(request.url),
      headers: this.processHeaders(request.header || []),
      queryParams: this.processQueryParams(request.url?.query || [])
    };

    // Process body
    if (request.body) {
      processedRequest.body = {
        mode: request.body.mode || 'raw',
        raw: request.body.raw,
        formdata: request.body.formdata,
        urlencoded: request.body.urlencoded
      };
    }

    // Process authentication
    if (request.auth) {
      processedRequest.auth = {
        type: request.auth.type || 'noauth',
        bearer: request.auth.bearer,
        basic: request.auth.basic,
        apikey: request.auth.apikey
      };
    }

    return processedRequest;
  }

  private static processUrl(url: any): string {
    if (typeof url === 'string') {
      return url;
    }

    if (url && url.raw) {
      return url.raw;
    }

    if (url && url.protocol && url.host) {
      let fullUrl = `${url.protocol}://${url.host.join('.')}`;
      if (url.path) {
        fullUrl += '/' + url.path.join('/');
      }
      return fullUrl;
    }

    return '';
  }

  private static processHeaders(headers: any[]): Record<string, string> {
    const headerObj: Record<string, string> = {};
    
    if (Array.isArray(headers)) {
      headers.forEach(header => {
        if (header.key && header.value) {
          headerObj[header.key] = header.value;
        }
      });
    }

    return headerObj;
  }

  private static processQueryParams(queryParams: any[]): Array<{ key: string; value: string }> {
    if (!Array.isArray(queryParams)) {
      return [];
    }

    return queryParams
      .filter(param => param.key && param.value)
      .map(param => ({
        key: param.key,
        value: param.value
      }));
  }

  static mapRequestToComponentType(request: PostmanRequest): ComponentType {
    switch (request.method.toUpperCase()) {
      case 'GET':
        return 'GET_REQUEST';
      case 'POST':
        return 'POST_REQUEST';
      case 'PUT':
        return 'PUT_REQUEST';
      case 'DELETE':
        return 'DELETE_REQUEST';
      case 'PATCH':
        return 'POST_REQUEST'; // Map PATCH to POST for now
      default:
        return 'GET_REQUEST';
    }
  }

  static generateFlowFromRequests(requests: PostmanRequest[]): ComponentNode[] {
    const nodes: ComponentNode[] = [];
    const baseY = 100;
    const spacing = 200;

    requests.forEach((request, index) => {
      const componentType = this.mapRequestToComponentType(request);
      const nodeId = `postman-${index}-${Date.now()}`;
      
      // Generate node data based on component type
      const nodeData = this.generateNodeData(request, componentType);
      
      const node: ComponentNode = {
        id: nodeId,
        type: componentType,
        position: {
          x: 200,
          y: baseY + (index * spacing)
        },
        data: nodeData,
        connections: [],
        outputs: this.getComponentOutputs(componentType),
        inputs: this.getComponentInputs(componentType)
      };

      nodes.push(node);
    });

    return nodes;
  }

  private static generateNodeData(request: PostmanRequest, componentType: ComponentType): any {
    const baseData = {
      url: request.url,
      headers: request.headers,
      timeout: 30000
    };

    switch (componentType) {
      case 'GET_REQUEST':
        return {
          ...baseData,
          queryParams: this.convertQueryParamsToObject(request.queryParams || [])
        };
      
      case 'POST_REQUEST':
      case 'PUT_REQUEST':
        return {
          ...baseData,
          bodyType: request.body?.mode === 'raw' ? 'json' : 'form',
          body: request.body?.raw || this.convertFormDataToBody(request.body)
        };
      
      case 'DELETE_REQUEST':
        return baseData;
      
      default:
        return baseData;
    }
  }

  private static convertQueryParamsToObject(queryParams: Array<{ key: string; value: string }>): Record<string, string> {
    const obj: Record<string, string> = {};
    queryParams.forEach(param => {
      obj[param.key] = param.value;
    });
    return obj;
  }

  private static convertFormDataToBody(body: any): string {
    if (body?.formdata) {
      const formData: Record<string, string> = {};
      body.formdata.forEach((item: any) => {
        if (item.key && item.value) {
          formData[item.key] = item.value;
        }
      });
      return JSON.stringify(formData);
    }
    
    if (body?.urlencoded) {
      const urlEncoded: Record<string, string> = {};
      body.urlencoded.forEach((item: any) => {
        if (item.key && item.value) {
          urlEncoded[item.key] = item.value;
        }
      });
      return JSON.stringify(urlEncoded);
    }

    return '';
  }

  private static getComponentOutputs(componentType: ComponentType): any[] {
    // Return standard outputs for each component type
    return [
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
      }
    ];
  }

  private static getComponentInputs(componentType: ComponentType): any[] {
    // Return standard inputs for each component type
    return [
      {
        name: 'url',
        description: 'Request URL',
        type: 'string',
        required: true
      }
    ];
  }
}
