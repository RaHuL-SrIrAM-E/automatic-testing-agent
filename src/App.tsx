import React, { useState, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentPalette } from './components/ComponentPalette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CodePreview } from './components/CodePreview';
import { ExampleFlow } from './components/ExampleFlow';
import { ProjectGenerator } from './components/ProjectGenerator';
import { ComponentNode, FlowState } from './types';
import { KarateGenerator } from './lib/karateGenerator';

const initialFlowState: FlowState = {
  nodes: [],
  selectedNodeId: null,
  generatedCode: ''
};

function App() {
  const [flowState, setFlowState] = useState<FlowState>(initialFlowState);
  const [activeTab, setActiveTab] = useState<'feature' | 'project'>('feature');
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
      <div className="h-screen gradient-bg flex flex-col">
        {/* Header */}
        <header className="glass-panel border-b border-wf-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-wf-red-600 to-wf-yellow-500 rounded-xl flex items-center justify-center shadow-wf">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Karate Visual Builder</h1>
                <p className="text-sm text-wf-gray-600">Professional API Testing Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-outline text-sm">
                💾 Save Flow
              </button>
              <button 
                onClick={() => setActiveTab('feature')}
                className="btn-primary text-sm"
              >
                📄 Export Feature
              </button>
              <button 
                onClick={() => setActiveTab('project')}
                className="btn-secondary text-sm"
              >
                🚀 Generate Project
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Palette */}
          <div className="w-80 glass-panel border-r border-wf-gray-200 flex flex-col">
            <div className="p-6 border-b border-wf-gray-200 bg-gradient-to-r from-wf-red-50 to-wf-yellow-50">
              <h2 className="text-xl font-bold text-wf-gray-900">Component Library</h2>
              <p className="text-sm text-wf-gray-600 mt-1">Drag components to build your test flow</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <ExampleFlow onLoadFlow={loadFlow} />
              </div>
              <ComponentPalette />
            </div>
          </div>

          {/* Canvas Area */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedNode ? 'mr-80' : ''}`}>
            <div className="flex-1 bg-gradient-to-br from-wf-gray-50 to-wf-gray-100 p-6">
              <Canvas
                nodes={flowState.nodes}
                onNodeUpdate={updateNode}
                onNodeDelete={deleteNode}
                onNodeSelect={selectNode}
                selectedNodeId={flowState.selectedNodeId}
                onAddNode={addNode}
              />
            </div>
            
            {/* Code Preview / Project Generator */}
            <div className="h-80 glass-panel border-t border-wf-gray-200">
              <div className="h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="flex border-b border-wf-gray-200 bg-gradient-to-r from-wf-red-50 to-wf-yellow-50">
                  <button
                    onClick={() => setActiveTab('feature')}
                    className={`px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                      activeTab === 'feature'
                        ? 'text-wf-red-600 border-b-2 border-wf-red-600 bg-white'
                        : 'text-wf-gray-600 hover:text-wf-red-600 hover:bg-white/50'
                    }`}
                  >
                    📄 Feature File
                  </button>
                  <button
                    onClick={() => setActiveTab('project')}
                    className={`px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                      activeTab === 'project'
                        ? 'text-wf-red-600 border-b-2 border-wf-red-600 bg-white'
                        : 'text-wf-gray-600 hover:text-wf-red-600 hover:bg-white/50'
                    }`}
                  >
                    🚀 Complete Project
                  </button>
                </div>
                
                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'feature' ? (
                    <CodePreview code={flowState.generatedCode} />
                  ) : (
                    <ProjectGenerator nodes={flowState.nodes} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Properties Panel - Only show when component is selected */}
          {selectedNode && (
            <div className="w-80 glass-panel border-l border-wf-gray-200 flex flex-col animate-slide-up">
              <div className="p-6 border-b border-wf-gray-200 bg-gradient-to-r from-wf-yellow-50 to-wf-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-wf-gray-900">Properties</h2>
                    <p className="text-sm text-wf-gray-600 mt-1">
                      Configure {selectedNode.type}
                    </p>
                  </div>
                  <button
                    onClick={() => selectNode(null)}
                    className="p-2 text-wf-gray-500 hover:text-wf-red-600 hover:bg-wf-red-50 rounded-lg transition-all duration-300"
                    title="Close Properties Panel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <PropertiesPanel
                  selectedNode={selectedNode}
                  onNodeUpdate={updateNode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
