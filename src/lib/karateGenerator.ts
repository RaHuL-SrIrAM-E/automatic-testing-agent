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
    const { url, headers, queryParams, timeout } = node.data;
    
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
    const { url, headers, body, bodyType } = node.data;
    
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
    const { url, headers, body, bodyType } = node.data;
    
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
    const { url, headers } = node.data;
    
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
    const { token, headerName = 'Authorization' } = node.data;
    
    if (!token) {
      this.generatedSteps.push('* print "Bearer Auth: Token not configured"');
      return;
    }

    this.generatedSteps.push(`* header ${headerName} = 'Bearer ${token}'`);
  }

  private generateBasicAuth(node: ComponentNode): void {
    const { username, password } = node.data;
    
    if (!username || !password) {
      this.generatedSteps.push('* print "Basic Auth: Username or password not configured"');
      return;
    }

    this.generatedSteps.push(`* header Authorization = 'Basic ${btoa(`${username}:${password}`)}'`);
  }

  private generateApiKeyAuth(node: ComponentNode): void {
    const { key, value, location } = node.data;
    
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
    const { expectedStatus, operator } = node.data;
    
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
    const { jsonPath, expectedValue, operator } = node.data;
    
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

  private generateResponseTimeCheck(node: ComponentNode): void {
    const { maxTime, operator } = node.data;
    
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
    const { variableName, jsonPath, defaultValue } = node.data;
    
    if (!variableName || !jsonPath) {
      this.generatedSteps.push('* print "Variable Extractor: Variable name or JSON path not configured"');
      return;
    }

    if (defaultValue) {
      this.generatedSteps.push(`* def ${variableName} = ${jsonPath} || '${defaultValue}'`);
    } else {
      this.generatedSteps.push(`* def ${variableName} = ${jsonPath}`);
    }

    this.variables.set(variableName, jsonPath);
  }

  private generateVariableSetter(node: ComponentNode): void {
    const { variableName, value } = node.data;
    
    if (!variableName || value === undefined) {
      this.generatedSteps.push('* print "Variable Setter: Variable name or value not configured"');
      return;
    }

    this.generatedSteps.push(`* def ${variableName} = '${value}'`);
    this.variables.set(variableName, value);
  }

  private formatHeaders(headers: Record<string, any>): string {
    return Object.entries(headers)
      .map(([key, value]) => `${key} = '${value}'`)
      .join('\n* header ');
  }

  private formatQueryParams(params: Record<string, any>): string {
    return Object.entries(params)
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
