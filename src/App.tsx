import React, { useState, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentPalette } from './components/ComponentPalette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CodePreview } from './components/CodePreview';
import { ExampleFlow } from './components/ExampleFlow';
import { ComponentNode, FlowState } from './types';
import { KarateGenerator } from './lib/karateGenerator';

const initialFlowState: FlowState = {
  nodes: [],
  selectedNodeId: null,
  generatedCode: ''
};

function App() {
  const [flowState, setFlowState] = useState<FlowState>(initialFlowState);
  const karateGenerator = useMemo(() => new KarateGenerator(), []);

  const updateFlowState = useCallback((updates: Partial<FlowState>) => {
    setFlowState(prev => {
      const newState = { ...prev, ...updates };
      
      // Regenerate code whenever nodes change
      if (updates.nodes) {
        newState.generatedCode = karateGenerator.generateFeature(newState.nodes);
      }
      
      return newState;
    });
  }, [karateGenerator]);

  const addNode = useCallback((node: ComponentNode) => {
    updateFlowState({
      nodes: [...flowState.nodes, node]
    });
  }, [flowState.nodes, updateFlowState]);

  const updateNode = useCallback((nodeId: string, updates: Partial<ComponentNode>) => {
    updateFlowState({
      nodes: flowState.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    });
  }, [flowState.nodes, updateFlowState]);

  const deleteNode = useCallback((nodeId: string) => {
    updateFlowState({
      nodes: flowState.nodes.filter(node => node.id !== nodeId),
      selectedNodeId: flowState.selectedNodeId === nodeId ? null : flowState.selectedNodeId
    });
  }, [flowState.nodes, flowState.selectedNodeId, updateFlowState]);

  const selectNode = useCallback((nodeId: string | null) => {
    updateFlowState({
      selectedNodeId: nodeId
    });
  }, [updateFlowState]);

  const loadFlow = useCallback((nodes: ComponentNode[]) => {
    updateFlowState({
      nodes,
      selectedNodeId: null
    });
  }, [updateFlowState]);

  const selectedNode = flowState.selectedNodeId 
    ? flowState.nodes.find(node => node.id === flowState.selectedNodeId) || null
    : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Karate Visual Builder</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
                Save Flow
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                Export Feature
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Palette */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Components</h2>
              <p className="text-sm text-gray-500 mt-1">Drag components to the canvas</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <ExampleFlow onLoadFlow={loadFlow} />
              </div>
              <ComponentPalette />
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-gray-100 p-4">
              <Canvas
                nodes={flowState.nodes}
                onNodeUpdate={updateNode}
                onNodeDelete={deleteNode}
                onNodeSelect={selectNode}
                selectedNodeId={flowState.selectedNodeId}
                onAddNode={addNode}
              />
            </div>
            
            {/* Code Preview */}
            <div className="h-80 bg-white border-t border-gray-200">
              <CodePreview code={flowState.generatedCode} />
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Properties</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedNode ? `Configure ${selectedNode.type}` : 'Select a component to configure'}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PropertiesPanel
                selectedNode={selectedNode}
                onNodeUpdate={updateNode}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
