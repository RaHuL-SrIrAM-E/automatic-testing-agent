import { ComponentNode, FlowState } from '../types';

export const generateNodeId = (): string => {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const validateFlow = (nodes: ComponentNode[]): string[] => {
  const errors: string[] = [];

  // Check for nodes without required properties
  nodes.forEach(node => {
    // Add validation logic here based on component type
    if (node.type.includes('REQUEST') && !node.data.url) {
      errors.push(`${node.type} component is missing required URL`);
    }
  });

  return errors;
};

export const exportFlowAsJson = (nodes: ComponentNode[]): string => {
  return JSON.stringify({
    version: '1.0.0',
    nodes,
    exportedAt: new Date().toISOString()
  }, null, 2);
};

export const importFlowFromJson = (jsonString: string): ComponentNode[] => {
  try {
    const data = JSON.parse(jsonString);
    return data.nodes || [];
  } catch (error) {
    console.error('Failed to import flow:', error);
    return [];
  }
};

export const importFlowStateFromJson = (jsonString: string): FlowState => {
  try {
    const data = JSON.parse(jsonString);
    return {
      nodes: data.nodes || [],
      connections: data.connections || [],
      selectedNodeId: null,
      generatedCode: data.metadata?.generatedCode || ''
    };
  } catch (error) {
    console.error('Failed to import flow state:', error);
    return {
      nodes: [],
      connections: [],
      selectedNodeId: null,
      generatedCode: ''
    };
  }
};

export const getNodeConnections = (nodeId: string, nodes: ComponentNode[]): ComponentNode[] => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];
  
  return nodes.filter(n => node.connections.includes(n.id));
};

export const canConnectNodes = (sourceId: string, targetId: string, nodes: ComponentNode[]): boolean => {
  // Add logic to determine if two nodes can be connected
  // For now, allow any connection
  return sourceId !== targetId;
};
