import React, { useState, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentPalette } from './components/ComponentPalette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CodePreview } from './components/CodePreview';
import { ExampleFlow } from './components/ExampleFlow';
import { ProjectGenerator } from './components/ProjectGenerator';
import { TestResults } from './components/TestResults';
import { ChatInterface } from './components/ChatInterface';
import { GitHubModal } from './components/GitHubModal';
import { ComponentNode, FlowState } from './types';
import { KarateGenerator } from './lib/karateGenerator';
import { TestExecutor } from './lib/testExecutor';
import { exportFlowAsJson, importFlowStateFromJson } from './utils/flowUtils';
import { Settings, Code, Package, Menu, X, Layers, Zap, Play, Download, MessageCircle, ChevronDown, ChevronUp, Trash2, Upload } from 'lucide-react';

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
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testProgress, setTestProgress] = useState<string>('');
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [isBottomPanelMinimized, setIsBottomPanelMinimized] = useState(false);
  const karateGenerator = useMemo(() => new KarateGenerator(), []);
  const testExecutor = useMemo(() => new TestExecutor(), []);

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
    }
  }, [flowState.nodes, flowState.selectedNodeId, updateFlowState]);

  const clearCanvas = useCallback(() => {
    updateFlowState({
      nodes: [],
      connections: [],
      selectedNodeId: null
    });
  }, [updateFlowState]);

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

  const handlePostmanImport = useCallback((nodes: ComponentNode[], collectionName: string) => {
    const newFlowState: FlowState = {
      nodes: [...flowState.nodes, ...nodes],
      connections: flowState.connections,
      selectedNodeId: null,
      generatedCode: ''
    };
    
    // Regenerate code with new nodes
    newFlowState.generatedCode = karateGenerator.generateFeature(newFlowState.nodes, newFlowState.connections);
    
    setFlowState(newFlowState);
    
    // Show success message
    console.log(`Successfully imported ${nodes.length} requests from "${collectionName}"`);
  }, [flowState.nodes, flowState.connections, karateGenerator]);

  const handleSwaggerImport = useCallback((nodes: ComponentNode[], documentName: string) => {
    const newFlowState: FlowState = {
      nodes: [...flowState.nodes, ...nodes],
      connections: flowState.connections,
      selectedNodeId: null,
      generatedCode: ''
    };
    
    // Regenerate code with new nodes
    newFlowState.generatedCode = karateGenerator.generateFeature(newFlowState.nodes, newFlowState.connections);
    
    setFlowState(newFlowState);
    
    // Show success message
    console.log(`Successfully imported ${nodes.length} API endpoints from "${documentName}"`);
  }, [flowState.nodes, flowState.connections, karateGenerator]);

  const handlePostmanError = useCallback((error: string) => {
    console.error('Postman import error:', error);
    // You could add a toast notification here
  }, []);

  const handleSwaggerError = useCallback((error: string) => {
    console.error('Swagger import error:', error);
    // You could add a toast notification here
  }, []);

  const handleDownloadTest = useCallback(() => {
    if (flowState.nodes.length === 0) {
      alert('Please add some components to the canvas before downloading test');
      return;
    }

    try {
      // Generate the Karate feature file
      const featureCode = karateGenerator.generateFeature(flowState.nodes, flowState.connections);
      
      // Create a temporary feature file
      const featureBlob = new Blob([featureCode], { type: 'text/plain' });
      const featureUrl = URL.createObjectURL(featureBlob);
      
      // Download the feature file
      const a = document.createElement('a');
      a.href = featureUrl;
      a.download = 'generated-test.feature';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(featureUrl);

      console.log('Test file downloaded successfully!');
    } catch (error) {
      console.error('Error generating test file:', error);
      alert('Error generating test file. Please try again.');
    }
  }, [flowState.nodes, flowState.connections, karateGenerator]);

  const handleRunTests = useCallback(async () => {
    if (flowState.nodes.length === 0) {
      alert('Please add some components to the canvas before running tests');
      return;
    }

    setIsRunningTests(true);
    setTestResults(null);
    setTestProgress('Generating test code...');

    try {
      // Generate the Karate feature file
      const featureCode = karateGenerator.generateFeature(flowState.nodes, flowState.connections);
      
      setTestProgress('Preparing test execution...');
      console.log('Starting test execution...');
      
      // Execute the test using TestExecutor
      setTestProgress('Running tests...');
      const result = await testExecutor.executeTest(featureCode, 'visual-test');
      
      setTestProgress('Processing results...');
      console.log('Test execution completed:', result);
      setTestResults(result);
      setTestProgress('');
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        summary: {
          total: 0,
          passed: 0,
          failed: 1,
          skipped: 0
        },
        details: [{
          name: 'Test Execution',
          status: 'failed',
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }],
        output: ''
      });
    } finally {
      setIsRunningTests(false);
      setTestProgress('');
    }
  }, [flowState.nodes, flowState.connections, karateGenerator, testExecutor]);

  const handleChatGenerateComponents = useCallback((components: ComponentNode[]) => {
    // Add generated components to the canvas
    const newNodes = components.map((component, index) => ({
      ...component,
      position: { x: 50 + (index * 250), y: 50 + (index * 150) }
    }));
    
    updateFlowState({ 
      nodes: [...flowState.nodes, ...newNodes],
      selectedNodeId: null
    });
  }, [flowState.nodes, updateFlowState]);

  const handleGitHubGenerate = useCallback(() => {
    setShowGitHubModal(true);
  }, []);

  const handleGitHubGenerateTests = useCallback(async (repoUrl: string, token: string) => {
    try {
      setTestProgress('Analyzing GitHub repository...');
      
      // Extract owner and repo from URL
      const urlMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!urlMatch) {
        throw new Error('Invalid GitHub URL format');
      }
      
      const [, owner, repo] = urlMatch;
      
      // Call backend to analyze repository and generate tests
      const response = await fetch('http://localhost:3001/api/generate-from-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          token
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze repository');
      }
      
      const data = await response.json();
      
      setTestProgress('Generating test components...');
      
      // Add generated components to canvas
      const newNodes = data.components.map((component: ComponentNode, index: number) => ({
        ...component,
        position: { x: 50 + (index * 250), y: 50 + (index * 150) }
      }));
      
      updateFlowState({
        nodes: [...flowState.nodes, ...newNodes],
        selectedNodeId: null
      });
      
      setTestProgress('Test generation completed!');
      setShowGitHubModal(false);
      
      // Clear progress after a delay
      setTimeout(() => setTestProgress(''), 2000);
      
    } catch (error) {
      console.error('GitHub generation error:', error);
      setTestProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [flowState.nodes, updateFlowState]);

  const handleExportFlow = useCallback(() => {
    if (flowState.nodes.length === 0) {
      alert('No components to export. Please add some components to the canvas first.');
      return;
    }

    try {
      const flowData = {
        version: '1.0.0',
        nodes: flowState.nodes,
        connections: flowState.connections,
        exportedAt: new Date().toISOString(),
        metadata: {
          totalNodes: flowState.nodes.length,
          totalConnections: flowState.connections.length,
          generatedCode: flowState.generatedCode
        }
      };

      const jsonString = JSON.stringify(flowData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `karate-flow-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Flow exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export flow. Please try again.');
    }
  }, [flowState]);

  const handleImportFlow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedState = importFlowStateFromJson(content);
          
          if (importedState.nodes.length === 0) {
            alert('No valid flow data found in the file.');
            return;
          }

          // Regenerate code for imported flow
          importedState.generatedCode = karateGenerator.generateFeature(importedState.nodes, importedState.connections);
          
          setFlowState(importedState);
          console.log(`Successfully imported ${importedState.nodes.length} components and ${importedState.connections.length} connections`);
        } catch (error) {
          console.error('Import failed:', error);
          alert('Failed to import flow. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [karateGenerator]);

  const selectedNode = flowState.selectedNodeId 
    ? flowState.nodes.find(node => node.id === flowState.selectedNodeId) || null
    : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex flex-col overflow-hidden">
        {/* Ultra Modern Header */}
        <header className="bg-gradient-to-r from-wf-red-600 to-wf-red-700 backdrop-blur-xl border-b border-wf-red-800/50 shadow-lg relative z-50">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden border border-white/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <span className="text-white font-bold text-xl relative z-10">K</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Karate Visual Builder
                    </h1>
                    <p className="text-sm text-white/80 font-medium">Professional API Testing Suite</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-xl p-1 shadow-inner border border-white/30">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <Layers className="w-4 h-4 text-white/90" />
                    <span className="text-sm font-semibold text-white">{flowState.nodes.length}</span>
                    <span className="text-xs text-white/80">Components</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowChatInterface(true)}
                    className="px-4 py-2.5 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>AI Chat</span>
                  </button>
                  <button 
                    onClick={handleDownloadTest}
                    disabled={flowState.nodes.length === 0}
                    className="px-4 py-2.5 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Test</span>
                  </button>
                  <button 
                    onClick={handleRunTests}
                    disabled={isRunningTests || flowState.nodes.length === 0}
                    className="px-4 py-2.5 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunningTests ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{testProgress || 'Running...'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Run Tests</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleExportFlow}
                    className="px-4 py-2.5 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button 
                    onClick={handleImportFlow}
                    className="px-4 py-2.5 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import</span>
                  </button>
                  <button 
                    onClick={handleGitHubGenerate}
                    className="px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 border border-white/30"
                  >
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
          <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white/60 backdrop-blur-xl border-r border-gray-200/50 flex flex-col relative z-40 h-full`}>
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
                  <ComponentPalette 
                    onImportPostman={handlePostmanImport}
                    onPostmanError={handlePostmanError}
                    onImportSwagger={handleSwaggerImport}
                    onSwaggerError={handleSwaggerError}
                  />
                </div>
              </>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Canvas Area - Dynamic Size with Max Dimensions */}
            <div className={`${isBottomPanelMinimized ? 'flex-1 max-h-[650px] max-w-[650px] mx-auto' : 'h-96'} p-4 transition-all duration-500 ease-in-out`}>
              <div className="h-full bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden relative">
                {/* Clear Canvas Button */}
                <button
                  onClick={clearCanvas}
                  className="absolute top-4 right-4 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-110 group"
                  title="Clear Canvas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
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
            
            {/* Bottom Panel - Compact Tabs with Minimize */}
            <div className={`${isBottomPanelMinimized ? 'h-12' : 'flex-1'} relative overflow-hidden transition-all duration-500 ease-in-out`}>
              {/* Sliding Panel Container */}
              <div className={`absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-lg transition-all duration-500 ease-in-out ${
                isBottomPanelMinimized 
                  ? 'transform translate-y-0 h-12' 
                  : 'transform translate-y-0 h-full'
              }`}>
                <div className="h-full flex flex-col">
                  {/* Modern Tab Navigation with Minimize Button */}
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
                    
                    {/* Minimize/Expand Button */}
                    <div className="flex-1 flex justify-end">
                      <button
                        onClick={() => setIsBottomPanelMinimized(!isBottomPanelMinimized)}
                        className="flex items-center space-x-2 px-4 py-3 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-white/50 transition-all duration-200"
                        title={isBottomPanelMinimized ? 'Expand panel' : 'Minimize panel'}
                      >
                        {isBottomPanelMinimized ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>Expand</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Minimize</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Tab Content - Only show when not minimized */}
                  {!isBottomPanelMinimized && (
                    <div className="flex-1 overflow-hidden">
                      {activeTab === 'feature' ? (
                        <CodePreview code={flowState.generatedCode} />
                      ) : (
                        <ProjectGenerator nodes={flowState.nodes} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties Panel - Always Visible */}
          <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-gray-200/50 shadow-xl flex flex-col relative z-30 h-full">
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
                {selectedNode && (
                  <button
                    onClick={() => selectNode(null)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <PropertiesPanel
                selectedNode={selectedNode}
                onNodeUpdate={updateNode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Results Modal */}
      {testResults && (
        <TestResults
          results={testResults}
          onClose={() => setTestResults(null)}
        />
      )}

      {/* Chat Interface Modal */}
      {showChatInterface && (
        <ChatInterface
          onGenerateComponents={handleChatGenerateComponents}
          onClose={() => setShowChatInterface(false)}
        />
      )}

      {/* GitHub Generation Modal */}
      {showGitHubModal && (
        <GitHubModal
          onGenerateTests={handleGitHubGenerateTests}
          onClose={() => setShowGitHubModal(false)}
        />
      )}
    </DndProvider>
  );
}

export default App;