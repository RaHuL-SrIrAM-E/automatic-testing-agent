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
      setTimeout(() => {
        console.log('Auto-downloading project...');
        FileGenerator.generateProjectZip(project);
      }, 500);
    } catch (error) {
      console.error('Error generating project:', error);
      alert('Error generating project. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadProject = () => {
    if (!generatedProject) {
      console.error('No project generated yet');
      return;
    }

    try {
      console.log('Downloading project:', generatedProject.name);
      // Generate and download as project file
      FileGenerator.generateProjectZip(generatedProject);
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
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generate Complete Karate Project</h3>
            <p className="text-sm text-gray-600">Creates a ready-to-run Maven project with all files</p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project name"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleGenerateProject}
            disabled={isGenerating || nodes.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                <span>Generate Project</span>
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
            className="w-full px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
          >
            Test Download
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
            className="w-full px-3 py-1 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600"
          >
            Download Simple Project
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How to Run Generated Project:</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <p>1. <strong>Download the project</strong> (ZIP file)</p>
            <p>2. <strong>Extract the ZIP</strong> to a folder</p>
            <p>3. <strong>Open terminal</strong> in the project folder</p>
            <p>4. <strong>Run:</strong> <code className="bg-blue-100 px-1 rounded">chmod +x setup.sh && ./setup.sh</code></p>
            <p className="text-blue-600 font-medium">That's it! The script will install dependencies and run tests automatically.</p>
          </div>
        </div>
      </div>

      {generatedProject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Generated Project Files</h4>
            <button
              onClick={handleDownloadProject}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Download ZIP</span>
            </button>
          </div>
          
          {/* Debug Info */}
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <strong>Debug:</strong> Project generated with {generatedProject.features.length} features, {generatedProject.configFiles.length} configs
          </div>

          {/* Feature Files */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Feature Files ({generatedProject.features.length})</span>
            </h5>
            <div className="space-y-2">
              {generatedProject.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                    <div className="text-xs text-gray-500">{feature.path}</div>
                    <div className="text-xs text-gray-400">{feature.description}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadFeature(feature)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Files */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Settings className="w-4 h-4" />
              <span>Configuration Files ({generatedProject.configFiles.length})</span>
            </h5>
            <div className="space-y-2">
              {generatedProject.configFiles.map((config, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{config.name}</div>
                    <div className="text-xs text-gray-500">{config.path}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadConfig(config)}
                    className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Data Files */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Database className="w-4 h-4" />
              <span>Data Files ({generatedProject.dataFiles.length})</span>
            </h5>
            <div className="space-y-2">
              {generatedProject.dataFiles.map((dataFile, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{dataFile.name}</div>
                    <div className="text-xs text-gray-500">{dataFile.path}</div>
                    <div className="text-xs text-gray-400">Type: {dataFile.type.toUpperCase()}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadConfig(dataFile)}
                    className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Project Structure */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Project Structure</h5>
            <div className="p-3 bg-gray-900 text-gray-100 rounded font-mono text-xs overflow-x-auto">
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
