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
import { Settings, Code, Package, Menu, X } from 'lucide-react';

const initialFlowState: FlowState = {
  nodes: [],
  connections: [],
  selectedNodeId: null,
  generatedCode: ''
};

function App() {
  const [flowState, setFlowState] = useState<FlowState>(initialFlowState);
  const [activeTab, setActiveTab] = useState<'feature' | 'project'>('feature');
  const [showSidebar, setShowSidebar] = useState(true);
  const karateGenerator = useMemo(() => new KarateGenerator(), []);

  const updateFlowState = useCallback((updates: Partial<FlowState>) => {
    setFlowState(prev => {
      const newState = { ...prev, ...updates };
      
      // Regenerate code whenever nodes change
      if (updates.nodes) {
        newState.generatedCode = karateGenerator.generateFeature(newState.nodes, newState.connections);
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

  const loadFlow = useCallback((loadedFlowState: FlowState) => {
    setFlowState({
      ...loadedFlowState,
      generatedCode: karateGenerator.generateFeature(loadedFlowState.nodes, loadedFlowState.connections),
      selectedNodeId: null
    });
  }, [karateGenerator]);

  const selectedNode = flowState.selectedNodeId 
    ? flowState.nodes.find(node => node.id === flowState.selectedNodeId) || null
    : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gradient-to-br from-wf-gray-50 via-white to-wf-red-50 flex flex-col overflow-hidden">
        {/* Modern Header */}
        <header className="bg-white border-b border-wf-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 text-wf-gray-600 hover:text-wf-red-600 hover:bg-wf-red-50 rounded-lg transition-all duration-200"
                >
                  {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-wf-red-600 to-wf-red-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">K</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-wf-red-600 to-wf-red-700 bg-clip-text text-transparent">
                      Karate Visual Builder
                    </h1>
                    <p className="text-sm text-wf-gray-600">Professional API Testing Suite</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-wf-gray-100 rounded-lg p-1">
                  <span className="px-3 py-1 text-xs font-semibold text-wf-gray-700">
                    {flowState.nodes.length} Components
                  </span>
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-wf-gray-700 hover:text-wf-red-600 hover:bg-wf-red-50 rounded-lg transition-all duration-200">
                  💾 Save
                </button>
                <button className="px-4 py-2 bg-wf-red-600 text-white text-sm font-semibold rounded-lg hover:bg-wf-red-700 transition-all duration-200 shadow-sm">
                  📤 Export
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Components & Demo */}
          <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-wf-gray-200 shadow-sm flex flex-col`}>
            {showSidebar && (
              <>
                {/* Demo Section */}
                <div className="p-6 border-b border-wf-gray-200 bg-gradient-to-r from-wf-red-50 to-wf-yellow-50">
                  <ExampleFlow onLoadFlow={loadFlow} />
                </div>
                
                {/* Components Section */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 border-b border-wf-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-wf-red-500 to-wf-red-600 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-wf-gray-900">Components</h2>
                    </div>
                    <p className="text-sm text-wf-gray-600">Drag components to build your test flow</p>
                  </div>
                  <ComponentPalette />
                </div>
              </>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Canvas Area */}
            <div className={`flex-1 p-6 transition-all duration-300 ${selectedNode ? 'mr-80' : ''}`}>
              <div className="h-full bg-white rounded-2xl border border-wf-gray-200 shadow-sm overflow-hidden">
                <Canvas
                  nodes={flowState.nodes}
                  connections={flowState.connections}
                  onNodeUpdate={updateNode}
                  onNodeDelete={deleteNode}
                  onNodeSelect={selectNode}
                  selectedNodeId={flowState.selectedNodeId}
                  onAddNode={addNode}
                />
              </div>
            </div>
            
            {/* Bottom Panel - Code Preview / Project Generator */}
            <div className="h-80 bg-white border-t border-wf-gray-200 shadow-sm">
              <div className="h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="flex border-b border-wf-gray-200 bg-wf-gray-50">
                  <button
                    onClick={() => setActiveTab('feature')}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                      activeTab === 'feature'
                        ? 'text-wf-red-600 border-b-2 border-wf-red-600 bg-white'
                        : 'text-wf-gray-600 hover:text-wf-red-600 hover:bg-white/50'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Feature File</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('project')}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                      activeTab === 'project'
                        ? 'text-wf-red-600 border-b-2 border-wf-red-600 bg-white'
                        : 'text-wf-gray-600 hover:text-wf-red-600 hover:bg-white/50'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Complete Project</span>
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

          {/* Right Sidebar - Properties Panel */}
          {selectedNode && (
            <div className="w-80 bg-white border-l border-wf-gray-200 shadow-sm flex flex-col animate-slide-in-right">
              <div className="p-6 border-b border-wf-gray-200 bg-gradient-to-r from-wf-yellow-50 to-wf-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-wf-yellow-500 to-wf-yellow-600 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-wf-gray-900">Properties</h2>
                      <p className="text-sm text-wf-gray-600">Configure component</p>
                    </div>
                  </div>
                  <button
                    onClick={() => selectNode(null)}
                    className="p-2 text-wf-gray-500 hover:text-wf-red-600 hover:bg-wf-red-50 rounded-lg transition-all duration-200"
                    title="Close Properties Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
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