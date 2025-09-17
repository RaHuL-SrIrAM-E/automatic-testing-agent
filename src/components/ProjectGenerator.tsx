import React, { useState } from 'react';
import { Download, FolderOpen, FileText, Settings, Database } from 'lucide-react';
import { ComponentNode } from '../types';
import { KarateProjectGenerator, KarateProject } from '../lib/karateProjectGenerator';
import { FileGenerator } from '../lib/fileGenerator';

interface ProjectGeneratorProps {
  nodes: ComponentNode[];
}

export const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({ nodes }) => {
  const [projectName, setProjectName] = useState('karate-test-project');
  const [generatedProject, setGeneratedProject] = useState<KarateProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generator = new KarateProjectGenerator();

  const handleGenerateProject = () => {
    setIsGenerating(true);
    try {
      console.log('Generating project with nodes:', nodes.length);
      const project = generator.generateProject(nodes, projectName);
      console.log('Generated project:', project);
      setGeneratedProject(project);
      
      // Automatically trigger download after generation
      setTimeout(async () => {
        console.log('Auto-downloading project...');
        await FileGenerator.generateProjectZip(project);
      }, 500);
    } catch (error) {
      console.error('Error generating project:', error);
      alert('Error generating project. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadProject = async () => {
    if (!generatedProject) {
      console.error('No project generated yet');
      return;
    }

    try {
      console.log('Downloading project:', generatedProject.name);
      // Generate and download as ZIP file
      await FileGenerator.generateProjectZip(generatedProject);
      console.log('Download initiated');
    } catch (error) {
      console.error('Error downloading project:', error);
      alert('Error downloading project. Check console for details.');
    }
  };

  const handleDownloadFeature = (feature: any) => {
    const blob = new Blob([feature.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = feature.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadConfig = (config: any) => {
    const blob = new Blob([config.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 glass-panel rounded-2xl">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-wf-red-500 to-wf-yellow-500 rounded-xl flex items-center justify-center shadow-wf">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gradient">Generate Complete Karate Project</h3>
            <p className="text-wf-gray-600">Creates a ready-to-run Maven project with all files</p>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="property-label">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="property-input"
            placeholder="Enter project name"
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGenerateProject}
            disabled={isGenerating || nodes.length === 0}
            className="w-full btn-primary flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold">Generating...</span>
              </>
            ) : (
              <>
                <Settings className="w-5 h-5" />
                <span className="font-semibold">Generate Project</span>
              </>
            )}
          </button>
          
          {/* Test Download Button */}
          <button
            onClick={() => {
              const testContent = 'This is a test file to verify download functionality.';
              const blob = new Blob([testContent], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'test-download.txt';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              console.log('Test download completed');
            }}
            className="w-full btn-outline text-sm"
          >
            🧪 Test Download
          </button>
          
          {/* Simple Project Download */}
          <button
            onClick={() => {
              const simpleProject = {
                name: projectName,
                features: [
                  {
                    name: 'api-tests.feature',
                    content: `Feature: Generated API Test

Scenario: User Test Flow
  Given url 'https://jsonplaceholder.typicode.com/users'
  When method GET
  Then status 200`
                  }
                ],
                config: {
                  name: 'karate-config.js',
                  content: `function() {
  return {
    baseUrl: 'https://jsonplaceholder.typicode.com'
  };
}`
                }
              };
              
              const blob = new Blob([JSON.stringify(simpleProject, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${projectName}-simple.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              console.log('Simple project download completed');
            }}
            className="w-full btn-secondary text-sm"
          >
            📦 Download Simple Project
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-wf-red-50 to-wf-yellow-50 border border-wf-red-200 rounded-xl">
          <h4 className="text-sm font-bold text-wf-gray-900 mb-3 flex items-center space-x-2">
            <span>📋</span>
            <span>How to Run Generated Project:</span>
          </h4>
          <div className="text-sm text-wf-gray-700 space-y-2">
            <p>1. <strong>Download the ZIP file</strong> (auto-downloads after generation)</p>
            <p>2. <strong>Extract the ZIP</strong> to a folder</p>
            <p>3. <strong>Open terminal</strong> in the project folder</p>
            <p>4. <strong>Run:</strong> <code className="bg-wf-gray-100 px-2 py-1 rounded-lg font-mono text-xs">chmod +x setup.sh && ./setup.sh</code></p>
            <p className="text-wf-red-600 font-bold">That's it! The script will install dependencies and run tests automatically.</p>
          </div>
        </div>
      </div>

      {generatedProject && (
        <div className="space-y-6 mt-8 animate-fade-in max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10 pb-4">
            <h4 className="text-xl font-bold text-gradient flex items-center space-x-2">
              <span>📁</span>
              <span>Generated Project Files</span>
            </h4>
            <button
              onClick={handleDownloadProject}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
          </div>
          
          {/* Debug Info */}
          <div className="p-4 bg-gradient-to-r from-wf-yellow-50 to-wf-red-50 border border-wf-yellow-200 rounded-xl">
            <div className="flex items-center space-x-2 text-sm font-semibold text-wf-gray-900">
              <span>🔍</span>
              <span>Debug Info:</span>
            </div>
            <p className="text-sm text-wf-gray-700 mt-1">
              Project generated with <strong>{generatedProject.features.length}</strong> features, <strong>{generatedProject.configFiles.length}</strong> configs
            </p>
          </div>

          {/* Feature Files */}
          <div className="glass-panel p-4 rounded-xl">
            <h5 className="text-lg font-bold text-wf-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-wf-red-600" />
              <span>Feature Files ({generatedProject.features.length})</span>
            </h5>
            <div className="space-y-3">
              {generatedProject.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-wf-gray-50 to-wf-gray-100 rounded-xl border border-wf-gray-200 hover:shadow-wf transition-all duration-300">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-wf-gray-900 flex items-center space-x-2">
                      <span>📄</span>
                      <span>{feature.name}</span>
                    </div>
                    <div className="text-xs text-wf-gray-600 font-mono mt-1">{feature.path}</div>
                    <div className="text-xs text-wf-gray-500 mt-1">{feature.description}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadFeature(feature)}
                    className="ml-3 px-3 py-1 text-xs btn-outline hover:scale-105 transition-transform duration-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Files */}
          <div className="glass-panel p-4 rounded-xl">
            <h5 className="text-lg font-bold text-wf-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-wf-yellow-600" />
              <span>Configuration Files ({generatedProject.configFiles.length})</span>
            </h5>
            <div className="space-y-3">
              {generatedProject.configFiles.map((config, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-wf-gray-50 to-wf-gray-100 rounded-xl border border-wf-gray-200 hover:shadow-wf transition-all duration-300">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-wf-gray-900 flex items-center space-x-2">
                      <span>⚙️</span>
                      <span>{config.name}</span>
                    </div>
                    <div className="text-xs text-wf-gray-600 font-mono mt-1">{config.path}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadConfig(config)}
                    className="ml-3 px-3 py-1 text-xs btn-secondary hover:scale-105 transition-transform duration-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Files */}
          <div className="glass-panel p-4 rounded-xl">
            <h5 className="text-lg font-bold text-wf-gray-900 mb-4 flex items-center space-x-2">
              <Database className="w-5 h-5 text-wf-red-600" />
              <span>Data Files ({generatedProject.dataFiles.length})</span>
            </h5>
            <div className="space-y-3">
              {generatedProject.dataFiles.map((dataFile, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-wf-gray-50 to-wf-gray-100 rounded-xl border border-wf-gray-200 hover:shadow-wf transition-all duration-300">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-wf-gray-900 flex items-center space-x-2">
                      <span>📊</span>
                      <span>{dataFile.name}</span>
                    </div>
                    <div className="text-xs text-wf-gray-600 font-mono mt-1">{dataFile.path}</div>
                    <div className="text-xs text-wf-gray-500 mt-1">Type: {dataFile.type.toUpperCase()}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadConfig(dataFile)}
                    className="ml-3 px-3 py-1 text-xs btn-outline hover:scale-105 transition-transform duration-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Project Structure */}
          <div className="glass-panel p-4 rounded-xl">
            <h5 className="text-lg font-bold text-wf-gray-900 mb-4 flex items-center space-x-2">
              <span>🏗️</span>
              <span>Project Structure</span>
            </h5>
            <div className="p-4 bg-gradient-to-br from-wf-gray-900 to-wf-gray-800 text-wf-gray-100 rounded-xl font-mono text-sm overflow-x-auto shadow-wf-lg">
              <pre>{JSON.stringify(generatedProject.folderStructure, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {nodes.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p>Add some components to the canvas to generate a project</p>
        </div>
      )}
    </div>
  );
};
