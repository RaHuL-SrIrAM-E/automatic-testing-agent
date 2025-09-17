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
import { Settings, Code, Package, Menu, X, Layers, Zap, Play, Download } from 'lucide-react';

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
  const [showProperties, setShowProperties] = useState(false);
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
    if (flowState.selectedNodeId === nodeId) {
      setShowProperties(false);
    }
  }, [flowState.nodes, flowState.selectedNodeId, updateFlowState]);

  const selectNode = useCallback((nodeId: string | null) => {
    updateFlowState({
      selectedNodeId: nodeId
    });
    setShowProperties(!!nodeId);
  }, [updateFlowState]);

  const loadFlow = useCallback((loadedFlowState: FlowState) => {
    setFlowState({
      ...loadedFlowState,
      generatedCode: karateGenerator.generateFeature(loadedFlowState.nodes, loadedFlowState.connections),
      selectedNodeId: null
    });
    setShowProperties(false);
  }, [karateGenerator]);

  const selectedNode = flowState.selectedNodeId 
    ? flowState.nodes.find(node => node.id === flowState.selectedNodeId) || null
    : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex flex-col overflow-hidden">
        {/* Ultra Modern Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm relative z-50">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <span className="text-white font-bold text-xl relative z-10">K</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                      Karate Visual Builder
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">Professional API Testing Suite</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1 shadow-inner">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <Layers className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">{flowState.nodes.length}</span>
                    <span className="text-xs text-gray-500">Components</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Run</span>
                  </button>
                  <button className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Compact & Modern */}
          <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white/60 backdrop-blur-xl border-r border-gray-200/50 flex flex-col relative z-40`}>
            {showSidebar && (
              <>
                {/* Demo Section - Compact */}
                <div className="p-4 border-b border-gray-200/50">
                  <ExampleFlow onLoadFlow={loadFlow} />
                </div>
                
                {/* Components Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Components</h2>
                    </div>
                    <p className="text-sm text-gray-600">Drag to canvas to build your flow</p>
                  </div>
                  <ComponentPalette />
                </div>
              </>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Canvas Area - Optimized Size */}
            <div className={`flex-1 p-4 transition-all duration-300 ${showProperties ? 'mr-80' : ''}`}>
              <div className="h-full bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden relative">
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
            
            {/* Bottom Panel - Compact Tabs */}
            <div className="h-72 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-lg">
              <div className="h-full flex flex-col">
                {/* Modern Tab Navigation */}
                <div className="flex border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80">
                  <button
                    onClick={() => setActiveTab('feature')}
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-semibold transition-all duration-200 relative ${
                      activeTab === 'feature'
                        ? 'text-red-600 bg-white shadow-sm'
                        : 'text-gray-600 hover:text-red-600 hover:bg-white/50'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Feature File</span>
                    {activeTab === 'feature' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-700"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('project')}
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-semibold transition-all duration-200 relative ${
                      activeTab === 'project'
                        ? 'text-red-600 bg-white shadow-sm'
                        : 'text-gray-600 hover:text-red-600 hover:bg-white/50'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Complete Project</span>
                    {activeTab === 'project' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-700"></div>
                    )}
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
          {showProperties && selectedNode && (
            <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-gray-200/50 shadow-xl flex flex-col animate-slide-in-right relative z-30">
              <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-yellow-50/80 to-red-50/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Properties</h2>
                      <p className="text-sm text-gray-600">Configure component</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      selectNode(null);
                      setShowProperties(false);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
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