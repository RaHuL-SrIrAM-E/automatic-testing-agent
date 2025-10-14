import { ComponentNode, ComponentConnection } from '../types';

export class KarateGenerator {
  private variables: Map<string, any> = new Map();
  private generatedSteps: string[] = [];

  generateFeature(nodes: ComponentNode[], connections: ComponentConnection[] = []): string {
    this.variables.clear();
    this.generatedSteps = [];

    // Build dependency graph from connections
    const dependencyGraph = this.buildDependencyGraph(nodes, connections);
    
    // Topological sort to determine execution order
    const sortedNodes = this.topologicalSort(nodes, dependencyGraph);

    // Generate steps for each node in dependency order
    for (const node of sortedNodes) {
      this.generateNodeCode(node, connections);
    }

    // Build the complete feature file
    const featureName = this.generateFeatureName();
    const scenarioName = this.generateScenarioName();
    
    return `Feature: ${featureName}

Scenario: ${scenarioName}
${this.generatedSteps.map(step => `  ${step}`).join('\n')}`;
  }

  private buildDependencyGraph(nodes: ComponentNode[], connections: ComponentConnection[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    // Initialize graph with all nodes
    nodes.forEach(node => {
      graph.set(node.id, []);
    });
    
    // Add dependencies from connections
    connections.forEach(connection => {
      const dependencies = graph.get(connection.toNodeId) || [];
      dependencies.push(connection.fromNodeId);
      graph.set(connection.toNodeId, dependencies);
    });
    
    return graph;
  }

  private topologicalSort(nodes: ComponentNode[], dependencyGraph: Map<string, string[]>): ComponentNode[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: ComponentNode[] = [];
    
    const visit = (nodeId: string) => {
      if (visiting.has(nodeId)) {
        throw new Error(`Circular dependency detected involving node ${nodeId}`);
      }
      if (visited.has(nodeId)) {
        return;
      }
      
      visiting.add(nodeId);
      const dependencies = dependencyGraph.get(nodeId) || [];
      dependencies.forEach(depId => visit(depId));
      visiting.delete(nodeId);
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        result.push(node);
      }
    };
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    });
    
    return result;
  }

  private generateNodeCode(node: ComponentNode, connections: ComponentConnection[] = []): void {
    switch (node.type) {
      case 'GET_REQUEST':
        this.generateGetRequest(node);
        break;
      case 'POST_REQUEST':
        this.generatePostRequest(node);
        break;
      case 'PUT_REQUEST':
        this.generatePutRequest(node);
        break;
      case 'DELETE_REQUEST':
        this.generateDeleteRequest(node);
        break;
      case 'BEARER_AUTH':
        this.generateBearerAuth(node);
        break;
      case 'BASIC_AUTH':
        this.generateBasicAuth(node);
        break;
      case 'API_KEY_AUTH':
        this.generateApiKeyAuth(node);
        break;
      case 'STATUS_ASSERTION':
        this.generateStatusAssertion(node);
        break;
        case 'FIELD_MATCHER':
          this.generateFieldMatcher(node);
          break;
        case 'SCHEMA_VALIDATION':
          this.generateSchemaValidation(node);
          break;
      case 'RESPONSE_TIME_CHECK':
        this.generateResponseTimeCheck(node);
        break;
      case 'VARIABLE_EXTRACTOR':
        this.generateVariableExtractor(node);
        break;
      case 'VARIABLE_SETTER':
        this.generateVariableSetter(node);
        break;
      default:
        console.warn(`Unknown component type: ${node.type}`);
    }
  }

  private generateGetRequest(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { url, headers, queryParams, timeout } = data;
    
    if (!url) {
      this.generatedSteps.push('* print "GET Request: URL not configured"');
      return;
    }

    // Set URL
    this.generatedSteps.push(`Given url '${url}'`);

    // Set headers
    if (headers && Object.keys(headers).length > 0) {
      this.generatedSteps.push(`* header ${this.formatHeaders(headers)}`);
    }

    // Set query parameters
    if (queryParams && Object.keys(queryParams).length > 0) {
      this.generatedSteps.push(`* param ${this.formatQueryParams(queryParams)}`);
    }

    // Set timeout
    if (timeout) {
      this.generatedSteps.push(`* configure timeout = ${timeout}`);
    }

    // Make the request
    this.generatedSteps.push('When method GET');
  }

  private generatePostRequest(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { url, headers, body, bodyType } = data;
    
    if (!url) {
      this.generatedSteps.push('* print "POST Request: URL not configured"');
      return;
    }

    // Set URL
    this.generatedSteps.push(`Given url '${url}'`);

    // Set headers
    if (headers && Object.keys(headers).length > 0) {
      this.generatedSteps.push(`* header ${this.formatHeaders(headers)}`);
    }

    // Set request body
    if (body) {
      if (bodyType === 'json') {
        this.generatedSteps.push(`* def requestBody = ${body}`);
        this.generatedSteps.push('* request requestBody');
      } else if (bodyType === 'form') {
        this.generatedSteps.push(`* form field ${this.formatFormData(body)}`);
      } else {
        this.generatedSteps.push(`* text requestBody = '${body}'`);
        this.generatedSteps.push('* request requestBody');
      }
    }

    // Make the request
    this.generatedSteps.push('When method POST');
  }

  private generatePutRequest(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { url, headers, body, bodyType } = data;
    
    if (!url) {
      this.generatedSteps.push('* print "PUT Request: URL not configured"');
      return;
    }

    // Set URL
    this.generatedSteps.push(`Given url '${url}'`);

    // Set headers
    if (headers && Object.keys(headers).length > 0) {
      this.generatedSteps.push(`* header ${this.formatHeaders(headers)}`);
    }

    // Set request body
    if (body) {
      if (bodyType === 'json') {
        this.generatedSteps.push(`* def requestBody = ${body}`);
        this.generatedSteps.push('* request requestBody');
      } else if (bodyType === 'form') {
        this.generatedSteps.push(`* form field ${this.formatFormData(body)}`);
      } else {
        this.generatedSteps.push(`* text requestBody = '${body}'`);
        this.generatedSteps.push('* request requestBody');
      }
    }

    // Make the request
    this.generatedSteps.push('When method PUT');
  }

  private generateDeleteRequest(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { url, headers } = data;
    
    if (!url) {
      this.generatedSteps.push('* print "DELETE Request: URL not configured"');
      return;
    }

    // Set URL
    this.generatedSteps.push(`Given url '${url}'`);

    // Set headers
    if (headers && Object.keys(headers).length > 0) {
      this.generatedSteps.push(`* header ${this.formatHeaders(headers)}`);
    }

    // Make the request
    this.generatedSteps.push('When method DELETE');
  }

  private generateBearerAuth(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { token, headerName = 'Authorization' } = data;
    
    if (!token) {
      this.generatedSteps.push('* print "Bearer Auth: Token not configured"');
      return;
    }

    this.generatedSteps.push(`* header ${headerName} = 'Bearer ${token}'`);
  }

  private generateBasicAuth(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { username, password } = data;
    
    if (!username || !password) {
      this.generatedSteps.push('* print "Basic Auth: Username or password not configured"');
      return;
    }

    this.generatedSteps.push(`* header Authorization = 'Basic ${btoa(`${username}:${password}`)}'`);
  }

  private generateApiKeyAuth(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { key, value, location } = data;
    
    if (!key || !value) {
      this.generatedSteps.push('* print "API Key Auth: Key or value not configured"');
      return;
    }

    if (location === 'header') {
      this.generatedSteps.push(`* header ${key} = '${value}'`);
    } else {
      this.generatedSteps.push(`* param ${key} = '${value}'`);
    }
  }

  private generateStatusAssertion(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { expectedStatus, operator } = data;
    
    if (expectedStatus === undefined) {
      this.generatedSteps.push('* print "Status Assertion: Expected status not configured"');
      return;
    }

    switch (operator) {
      case 'equals':
        this.generatedSteps.push(`Then status ${expectedStatus}`);
        break;
      case 'not_equals':
        this.generatedSteps.push(`Then status != ${expectedStatus}`);
        break;
      case 'greater_than':
        this.generatedSteps.push(`Then status > ${expectedStatus}`);
        break;
      case 'less_than':
        this.generatedSteps.push(`Then status < ${expectedStatus}`);
        break;
      default:
        this.generatedSteps.push(`Then status ${expectedStatus}`);
    }
  }

  private generateFieldMatcher(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { jsonPath, expectedValue, operator } = data;
    
    if (!jsonPath || !expectedValue) {
      this.generatedSteps.push('* print "Field Matcher: JSON path or expected value not configured"');
      return;
    }

    switch (operator) {
      case 'equals':
        this.generatedSteps.push(`And match ${jsonPath} == '${expectedValue}'`);
        break;
      case 'not_equals':
        this.generatedSteps.push(`And match ${jsonPath} != '${expectedValue}'`);
        break;
      case 'contains':
        this.generatedSteps.push(`And match ${jsonPath} contains '${expectedValue}'`);
        break;
      case 'matches':
        this.generatedSteps.push(`And match ${jsonPath} == '#regex ${expectedValue}'`);
        break;
      case 'exists':
        this.generatedSteps.push(`And match ${jsonPath} != null`);
        break;
      default:
        this.generatedSteps.push(`And match ${jsonPath} == '${expectedValue}'`);
    }
  }

  private generateSchemaValidation(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { jsonPath, schema, validationType, allowNull } = data;
    
    if (!jsonPath) {
      this.generatedSteps.push('* print "Schema Validation: JSON path not configured"');
      return;
    }

    switch (validationType) {
      case 'json_schema':
        if (!schema) {
          this.generatedSteps.push('* print "Schema Validation: JSON schema not provided"');
          return;
        }
        try {
          const schemaObj = JSON.parse(schema);
          this.generatedSteps.push(`* def schema = ${JSON.stringify(schemaObj)}`);
          if (allowNull) {
            this.generatedSteps.push(`* match ${jsonPath} == '#notnull || ${jsonPath} == null'`);
            this.generatedSteps.push(`* if (${jsonPath} != null) match ${jsonPath} == '#(schema)'`);
          } else {
            this.generatedSteps.push(`* match ${jsonPath} == '#(schema)'`);
          }
        } catch (error) {
          this.generatedSteps.push('* print "Schema Validation: Invalid JSON schema provided"');
        }
        break;
        
      case 'not_null':
        this.generatedSteps.push(`* match ${jsonPath} == '#notnull'`);
        break;
        
      case 'is_null':
        this.generatedSteps.push(`* match ${jsonPath} == null`);
        break;
        
      case 'type_check':
        if (!schema) {
          this.generatedSteps.push('* print "Schema Validation: Expected type not provided"');
          return;
        }
        const expectedType = schema.toLowerCase();
        switch (expectedType) {
          case 'string':
            this.generatedSteps.push(`* match ${jsonPath} == '#string'`);
            break;
          case 'number':
            this.generatedSteps.push(`* match ${jsonPath} == '#number'`);
            break;
          case 'boolean':
            this.generatedSteps.push(`* match ${jsonPath} == '#boolean'`);
            break;
          case 'object':
            this.generatedSteps.push(`* match ${jsonPath} == '#object'`);
            break;
          case 'array':
            this.generatedSteps.push(`* match ${jsonPath} == '#array'`);
            break;
          default:
            this.generatedSteps.push(`* print "Schema Validation: Unknown type '${expectedType}'"`);
        }
        break;
        
      default:
        this.generatedSteps.push('* print "Schema Validation: Unknown validation type"');
    }
  }

  private generateResponseTimeCheck(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { maxTime, operator } = data;
    
    if (maxTime === undefined) {
      this.generatedSteps.push('* print "Response Time Check: Max time not configured"');
      return;
    }

    switch (operator) {
      case 'less_than':
        this.generatedSteps.push(`And match responseTime < ${maxTime}`);
        break;
      case 'less_than_or_equal':
        this.generatedSteps.push(`And match responseTime <= ${maxTime}`);
        break;
      case 'greater_than':
        this.generatedSteps.push(`And match responseTime > ${maxTime}`);
        break;
      case 'greater_than_or_equal':
        this.generatedSteps.push(`And match responseTime >= ${maxTime}`);
        break;
      default:
        this.generatedSteps.push(`And match responseTime < ${maxTime}`);
    }
  }

  private generateVariableExtractor(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { extractions } = data;
    
    if (!extractions || !Array.isArray(extractions) || extractions.length === 0) {
      this.generatedSteps.push('* print "Variable Extractor: No extractions configured"');
      return;
    }

    // Validate extractions
    const validExtractions = this.validateExtractions(extractions);
    
    if (validExtractions.length === 0) {
      this.generatedSteps.push('* print "Variable Extractor: No valid extractions found"');
      return;
    }

    // Generate individual variable extractions
    validExtractions.forEach((extraction: any, index: number) => {
      const { variableName, jsonPath, defaultValue } = extraction;
      
      if (defaultValue) {
        this.generatedSteps.push(`* def ${variableName} = ${jsonPath} || '${defaultValue}'`);
      } else {
        this.generatedSteps.push(`* def ${variableName} = ${jsonPath}`);
      }

      this.variables.set(variableName, jsonPath);
    });

    // Generate a combined object with all extracted variables
    const variableNames = validExtractions.map((ext: any) => ext.variableName);
    
    if (variableNames.length > 0) {
      const objectDefinition = variableNames
        .map(name => `${name}: ${name}`)
        .join(', ');
      this.generatedSteps.push(`* def extractedVariables = { ${objectDefinition} }`);
    }
  }

  private validateExtractions(extractions: any[]): any[] {
    const validExtractions: any[] = [];
    const seenVariableNames = new Set<string>();
    
    extractions.forEach((extraction: any, index: number) => {
      const { variableName, jsonPath } = extraction;
      
      // Check if variable name and JSON path are provided
      if (!variableName || !jsonPath) {
        this.generatedSteps.push(`* print "Variable Extractor: Extraction ${index + 1} - Variable name or JSON path not configured"`);
        return;
      }
      
      // Check for duplicate variable names
      if (seenVariableNames.has(variableName)) {
        this.generatedSteps.push(`* print "Variable Extractor: Extraction ${index + 1} - Duplicate variable name '${variableName}'"`);
        return;
      }
      
      // Check if variable name is valid (alphanumeric + underscore)
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName)) {
        this.generatedSteps.push(`* print "Variable Extractor: Extraction ${index + 1} - Invalid variable name '${variableName}' (must start with letter/underscore, contain only alphanumeric/underscore)"`);
        return;
      }
      
      // Check if JSON path starts with $ or @
      if (!jsonPath.startsWith('$') && !jsonPath.startsWith('@')) {
        this.generatedSteps.push(`* print "Variable Extractor: Extraction ${index + 1} - Invalid JSON path '${jsonPath}' (must start with $ or @)"`);
        return;
      }
      
      seenVariableNames.add(variableName);
      validExtractions.push(extraction);
    });
    
    return validExtractions;
  }

  private generateVariableSetter(node: ComponentNode): void {
    const data = node.data || node.properties || {};
    const { variables } = data;
    
    if (!variables || !Array.isArray(variables) || variables.length === 0) {
      this.generatedSteps.push('* print "Variable Setter: No variables configured"');
      return;
    }

    variables.forEach((variable: any, index: number) => {
      const { variableName, value } = variable;
      
      if (!variableName || value === undefined) {
        this.generatedSteps.push(`* print "Variable Setter: Variable ${index + 1} not properly configured"`);
        return;
      }

      this.generatedSteps.push(`* def ${variableName} = '${value}'`);
      this.variables.set(variableName, value);
    });
  }

  private formatHeaders(headers: Record<string, any> | string): string {
    // Handle case where headers is a JSON string
    let headersObj: Record<string, any>;
    if (typeof headers === 'string') {
      try {
        headersObj = JSON.parse(headers);
      } catch (e) {
        console.warn('Invalid headers JSON:', headers);
        return '';
      }
    } else {
      headersObj = headers;
    }
    
    return Object.entries(headersObj)
      .map(([key, value]) => `${key} = '${value}'`)
      .join('\n* header ');
  }

  private formatQueryParams(params: Record<string, any> | string): string {
    // Handle case where params is a JSON string
    let paramsObj: Record<string, any>;
    if (typeof params === 'string') {
      try {
        paramsObj = JSON.parse(params);
      } catch (e) {
        console.warn('Invalid query params JSON:', params);
        return '';
      }
    } else {
      paramsObj = params;
    }
    
    return Object.entries(paramsObj)
      .map(([key, value]) => `${key} = '${value}'`)
      .join('\n* param ');
  }

  private formatFormData(data: string): string {
    try {
      const parsed = JSON.parse(data);
      return Object.entries(parsed)
        .map(([key, value]) => `${key} = '${value}'`)
        .join('\n* form field ');
    } catch {
      return `data = '${data}'`;
    }
  }

  private generateFeatureName(): string {
    return 'Generated API Test';
  }

  private generateScenarioName(): string {
    return 'User Test Flow';
  }
}
